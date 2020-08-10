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
        _._profileMap = new Map();
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
     * Get timings object map.
     */
    get timingsOMap() {
        const timings = {};
        for (const [trackerName, tracker] of this._trackerMap) {
            if (tracker.stopWatch)
                timings[trackerName] = tracker.stopWatch.toJSON();
        }
        return timings;
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
     * @returns {{
     *     contextName:string,
     *     total:number,
     *     inProgress:string[],
     *     children:*[],
     *     timingsEnabled:boolean,
     *     isWorking:boolean,
     *     localTotal:number
     * }}
     */
    get profile() {
        const _ = this;
        const profile = {
            contextName: _._contextName,
            isWorking: _.isWorking,
            timingsEnabled: _.timingsEnabled,
            total: _.totalInProgress,
            localTotal: _.localTotalInProgress,
            inProgress: _.inProgressArr,
            timings: undefined,
            children: Array.from(_._childrenMap.values()).map(child => {
                return child.profile;
            })
        };

        if (_._timingsEnabled)
            profile.timings = _.timingsOMap;

        return profile;
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

        for (const [profileName, report] of _._profileMap) {
            const childReport = child._createProfile(profileName, _);
            report.childMap.set(contextName, childReport);
        }

        _._childrenMap.set(contextName, child);
        return child;
    }


    /**
     * Create an independent profile of timings.
     *
     * Profiling starts as soon as the profile is created and ends when the profiles "complete()" function is called. Be
     * sure to call the profiles "complete" function when finished to prevent "memory leak".
     *
     * @param profileName {string}
     * @returns {{
     *     name: string,
     *     totalInProgress: number,
     *     localTotalInProgress: number,
     *     isWorking: boolean,
     *     inProgressArr: string[],
     *     timingsOMap: {...},
     *     getStatus(trackerName:string),
     *     reset(),
     *     complete()
     * }}
     */
    createProfile(profileName) {
        precon.string(profileName, 'profileName');

        const _ = this;
        return _._createProfile(profileName);
    }


    /**
     * Increment a counter that is visible in timings.
     *
     * @param name {string} The tracker name.
     */
    increment(name) {
        precon.string(name, 'name');

        const _ = this;
        const tracker = _._getTracker(name, true/*add*/);
        tracker.count++;

        // profiles
        for (const profile of _._profileMap.values()) {
            const pTracker = _._getTracker(name, true/*add*/, profile.trackerMap);
            pTracker.count++;
        }
    }


    /**
     * Start tracking a work item. If timings are enabled, will also start stopwatch.
     *
     * @param trackerName {string} The tracker name.
     */
    start(trackerName) {
        precon.string(trackerName, 'name');

        const _ = this;
        const tracker = _._getTracker(trackerName, true/*add*/);

        tracker.inProgress++;
        tracker.count++;

        if (_.timingsEnabled)
            _._startTimings(tracker);

        // profiles
        for (const profile of _._profileMap.values()) {
            const pTracker = _._getTracker(trackerName, true/*add*/, profile.trackerMap);
            pTracker.inProgress++;
            pTracker.count++;
            _._startTimings(pTracker);
        }

        _._isWorking = true;

        return _.stop.bind(_, trackerName);
    }


    /**
     * Stop tracking a work item. Also stops stopwatch.
     *
     * @param trackerName {string} The tracker name.
     */
    stop(trackerName) {
        precon.string(trackerName, 'name');
        const _ = this;

        let tracker = _._trackerMap.get(trackerName);
        if (!tracker || tracker.inProgress === 0)
            throw new Error(`"stop" called more times than "start" (${trackerName})`);

        tracker.inProgress--;

        if (tracker.stopWatch && tracker.stopWatch.isStarted)
            tracker.stopWatch.stop();

        // profiles
        for (const profile of _._profileMap.values()) {
            const pTracker = profile.trackerMap.get(trackerName);
            if (pTracker) {
                pTracker.inProgress--;
                pTracker.stopWatch.isStarted && pTracker.stopWatch.stop();
            }
        }

        _._checkLocal();
    }


    /**
     * Get the status of a tracker.
     *
     * @param trackerName {string} The tracker name.
     * @returns {{
     *      inProgress:number,
     *      count:number,
     *      stopWatch: {
     *          isStarted:boolean,
     *          totalTimeMs:number,
     *          maxMs:number,
     *          avgTimeMs:number,
     *          minMs:number,
     *          starts:number,
     *          timeMs:number
     *      }
     * }}
     */
    getStatus(trackerName) {
        precon.string(trackerName, 'name');

        const _ = this;
        const data = _._getTracker(trackerName, false/*add*/);

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

        // remove from parent's child map
        if (_._parent) {
            _._parent._childrenMap.delete(_._contextName);
        }
        _._parent = null;

        // cleanup profiles
        for (const profile of _._profileMap.values()) {
            profile.complete();
            profile.parent && profile.parent.childMap.delete(_._contextName);
        }
        _._profileMap.clear();

        // cleanup child tracker references
        for (const child of _._childrenMap.values()) {
            child.destroy();
        }
        _._childrenMap.clear();

        // clear trackers
        _._trackerMap.clear();
    }


    toJSON() {
        const _ = this;
        return _.profile;
    }


    _createProfile(profileName, parentProfile) {

        const _ = this;
        let profile = _._profileMap.get(profileName);
        if (profile)
            return profile;

        profile = {
            childMap: new Map(),
            trackerMap: new Map(),
            get name() { return profileName; },
            get parent() { return parentProfile; },
            /**
             * Get the total number of in-progress work items being tracked. The number includes work in child contexts.
             * @returns {number}
             */
            get totalInProgress() {
                return profile.localTotalInProgress + Array.from(profile.childMap.values()).reduce((a, child) => {
                    return a + child.totalInProgress;
                }, 0);
            },
            /**
             * Get the total number of in-progress work items being tracked by this instance.
             * @returns {number}
             */
            get localTotalInProgress() {
                return Array.from(profile.trackerMap.values()).reduce((a, tracker) => {
                    return a + tracker.inProgress;
                }, 0);
            },
            /**
             * Quickly determine if there is work in-progress.
             * @returns {boolean}
             */
            get isWorking() { return _.isWorking; },
            /**
             * Get array of tracker names that are currently in progress.
             * @returns {string[]}
             */
            get inProgressArr() {
                return Array.from(profile.trackerMap.values()).filter(tracker => tracker.inProgress).map(tracker => tracker.name);
            },
            /**
             * Get timings object map.
             */
            get timingsOMap() {
                const timings = {};
                for (const [trackerName, tracker] of profile.trackerMap) {
                    timings[trackerName] = tracker.stopWatch.toJSON();
                }
                return timings;
            },
            /**
             * Get status of a work tracker by name.
             * @param trackerName {string}
             * @returns {{inProgress: number, count: number, stopWatch: *}}
             */
            getStatus(trackerName) {
                precon.string(trackerName, 'trackerName');
                const pTracker = _._getTracker(trackerName, false/*add*/, profile.trackerMap);
                return {
                    inProgress: pTracker.inProgress,
                    count: pTracker.count,
                    stopWatch: pTracker.stopWatch.toJSON()
                };
            },
            /**
             * Reset all values
             */
            reset() {
                profile.trackerMap.clear();
                Array.from(profile.childMap.values()).forEach(child => child.reset());
            },
            /**
             * Complete profiling and unregister from parent work tracker.
             * This is also equivalent of calling a destroy function.
             */
            complete() {
                _._profileMap.delete(profileName);
                Array.from(profile.childMap.values()).forEach(child => child.complete());
            },
            toJSON() {
                return {
                    contextName: _._contextName,
                    isWorking: _.isWorking,
                    total: _.totalInProgress,
                    localTotal: _.localTotalInProgress,
                    inProgress: _.inProgressArr,
                    timings: profile.timingsOMap,
                    children: Array.from(profile.childMap.values()).map(child => {
                        return child.toJSON();
                    })
                };
            }
        };

        _._profileMap.set(profileName, profile);
        for (const [contextName, child] of _._childrenMap) {
            const childReport = child._createProfile(profileName, profile);
            profile.childMap.set(contextName, childReport);
        }

        return profile;
    }


    _getTracker(name, add, sourceMap) {

        const _ = this;
        sourceMap = sourceMap || _._trackerMap;
        let data = sourceMap.get(name);
        if (!data) {
            data = {
                name: name,
                inProgress: 0,
                count: 0,
                stopWatch: null
            };
            add && sourceMap.set(name, data);
        }

        return data;
    }


    _startTimings(tracker) {
        const _ = this;

        if (!tracker.stopWatch)
            tracker.stopWatch = new StopWatch();

        tracker.stopWatch.start();
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


    static get CLASS_ID() { return '640d1584c2cfa965d41ff7f8725d74b280ccfba357c01d3729f3236203699a2d'; }
    static TEST_INSTANCE(WorkTracker) { return new WorkTracker('test'); }
    static [Symbol.hasInstance](obj) {
        return pu.isInstanceOfById(obj, WorkTracker.CLASS_ID);
    }
}

module.exports = WorkTracker;
