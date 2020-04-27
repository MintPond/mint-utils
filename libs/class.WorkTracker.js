'use strict';

const
    EventEmitter = require('events'),
    precon = require('@mintpond/mint-precon'),
    StopWatch = require('./class.StopWatch'),
    pu = require('./service.prototypes');


class WorkTracker extends EventEmitter {

    /**
     * Constructor.
     *
     * @param contextName {string} The work tracker context name.
     * @param [parent] {WorkTracker} Parent work tracker.
     */
    constructor(contextName, parent) {
        precon.string(contextName, 'contextName');
        precon.opt_instanceOf(parent, WorkTracker, 'parent');

        super();

        const _ = this;
        _._contextName = contextName;
        _._parent = parent;
        _._trackerMap = new Map();
        _._childrenMap = new Map();
        _._timingsEnabled = false;
        _._isWorking = false;
    }


    /**
     * The name of the event emitted when a work task is done.
     * @returns {string}
     */
    static get EVENT_WORK_DONE() { return 'workDone'; }


    /**
     * Get the context name of this instance.
     * @returns {string}
     */
    get contextName() { return this._contextName; }

    /**
     * Determine if timings is enabled.
     * @returns {boolean}
     */
    get timingsEnabled() { return this._timingsEnabled; }

    /**
     * Set timings enabled. Also sets value on child contexts.
     * @param enabled {boolean}
     */
    set timingsEnabled(enabled) {
        precon.boolean(enabled, 'timingsEnabled');
        this._timingsEnabled = enabled;
        for (const child of this._childrenMap.values()) {
            child.timingsEnabled = enabled;
        }
    }

    /**
     * Get the total number of in-progress work items being tracked. The number includes work in child contexts.
     * @returns {number}
     */
    get totalInProgress() {
        return this.localTotalInProgress + Array.from(this._childrenMap.values()).reduce((a, child) => {
            return a + child.totalInProgress;
        }, 0);
    }

    /**
     * Get the total number of in-progress work items being tracked by this instance.
     * @returns {number}
     */
    get localTotalInProgress() {
        return Array.from(this._trackerMap.values()).reduce((a, tracker) => {
            return a + tracker.inProgress;
        }, 0);
    }

    /**
     * Quickly determine if there is work in-progress.
     * @returns {boolean}
     */
    get isWorking() {

        const _ = this;
        if (this._isWorking)
            return true;

        for (const child of _._childrenMap.values()) {
            if (child.isWorking)
                return true;
        }

        return false;
    }

    /**
     * Get array of tracker names that are currently in progress.
     * @returns {string[]}
     */
    get inProgressArr() {
        return Array.from(this._trackerMap.values()).filter(tracker => tracker.inProgress).map(tracker => tracker.name);
    }


    /**
     * Get an object containing timings and work profile information.
     * @returns {{contextName:string, total:number, inProgress:string[], children:*[], timingsEnabled:boolean, isWorking:boolean, localTotal:number}}
     */
    get profile() {
        const _ = this;
        return {
            contextName: _._contextName,
            isWorking: _.isWorking,
            timingsEnabled: _.timingsEnabled,
            total: _.totalInProgress,
            localTotal: _.localTotalInProgress,
            inProgress: _.inProgressArr,
            children: Array.from(_._childrenMap.values()).map(child => {
                return child.profile;
            })
        };
    }


    /**
     * Create a child work-tracker context.
     *
     * @param contextName {string}
     * @returns {WorkTracker}
     */
    createChild(contextName) {
        precon.string(contextName, 'contextName');

        const _ = this;
        let child = _._childrenMap.get(contextName);
        if (child)
            return child;

        child = new WorkTracker(contextName, _);
        _._childrenMap.set(contextName, child);
        return child;
    }


    /**
     * Increment a counter that is visible in timings.
     *
     * @param name {string} The tracker name.
     */
    increment(name) {
        precon.string(name, 'name');

        const _ = this;
        let data = _._trackerMap.get(name);
        if (!data) {
            data = _._createTracker(name);
            _._trackerMap.set(name, data);
        }

        data.count++;
    }


    /**
     * Start tracking a work item. If timings are enabled, will also start stop watch.
     *
     * @param name {string} The tracker name.
     */
    start(name) {
        precon.string(name, 'name');

        const _ = this;
        let data = _._trackerMap.get(name);
        if (!data) {
            data = _._createTracker(name);
            _._trackerMap.set(name, data);
        }

        data.inProgress++;
        data.count++;

        if (_.timingsEnabled) {

            if (!data.stopWatch)
                data.stopWatch = new StopWatch();

            data.stopWatch.start();
        }

        _._isWorking = true;

        return _.stop.bind(_, name);
    }


    /**
     * Stop tracking a work item. Also stops stopwatch.
     *
     * @param name {string} The tracker name.
     */
    stop(name) {
        precon.string(name, 'name');
        const _ = this;

        let data = _._trackerMap.get(name);
        if (!data || data.inProgress === 0)
            throw new Error(`"stop" called more times than "start" (${name})`);

        data.inProgress--;

        if (data.stopWatch && data.stopWatch.isStarted)
            data.stopWatch.stop();

        _._checkLocal();
    }


    /**
     * Get the status of a tracker.
     *
     * @param name {string} The tracker name.
     * @returns {{inProgress:number, count:number, stopWatch:{totalTimeMs:number, maxMs:number, avgTimeMs:number, minMs:number, isStarted:boolean, starts:number, timeMs:number}}}
     */
    getStatus(name) {
        precon.string(name, 'name');

        const _ = this;
        let data = _._trackerMap.get(name);
        if (!data)
            data = _._createTracker(name);

        return {
            inProgress: data.inProgress,
            count: data.count,
            stopWatch: (data.stopWatch || new StopWatch()).toJSON()
        };
    }


    /**
     * Reset all timings data.
     */
    reset() {

        const _ = this;

        for (const tracker of _._trackerMap.values()) {
            if (tracker.inProgress === 0) {
                _._trackerMap.delete(tracker);
            }
            else {
                tracker.count = 0;
                tracker.stopWatch = null;
            }
        }

        for (const child of _._childrenMap.values()) {
            child.reset();
        }
    }


    destroy() {
        const _ = this;

        if (_._parent) {
            _._parent._childrenMap.delete(_._contextName);
        }
        _._parent = null;

        for (const child of _._childrenMap.values()) {
            child.destroy();
        }
        _._childrenMap.clear();
        _._trackerMap.clear();
    }


    toJSON() {
        const _ = this;
        return _.profile;
    }


    _createTracker(name) {
        return {
            name: name,
            inProgress: 0,
            count: 0,
            stopWatch: null
        };
    }


    _checkLocal() {
        const _ = this;
        if (_.totalInProgress === 0 && _._isWorking) {
            _._isWorking = false;
            _._parent && _._parent._check();
            _._emitWorkDone();
        }
    }


    _check() {
        const _ = this;

        if (_.totalInProgress === 0) {
            _._isWorking = false;
            _._parent && _._parent._check();
            _._emitWorkDone();
        }
    }


    _emitWorkDone() {
        const _ = this;
        _.emit(WorkTracker.EVENT_WORK_DONE);
    }


    static [Symbol.hasInstance](obj) {
        return pu.isInstanceOfByName(obj, 'WorkTracker') &&
            pu.isFunction(obj.createChild) &&
            pu.isFunction(obj.increment) &&
            pu.isFunction(obj.start) &&
            pu.isFunction(obj.stop) &&
            pu.isFunction(obj.getStatus) &&
            pu.isFunction(obj.reset) &&
            pu.isFunction(obj.destroy) &&
            pu.hasGetters(obj,
                'contextName', 'timingsEnabled', 'totalInProgress', 'localTotalInProgress',
                'isWorking', 'inProgressArr', 'profile');
    }
}

module.exports = WorkTracker;
