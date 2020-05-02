'use strict';

const pu = require('./service.prototypes');


/**
 * Basic stop watch.
 */
class StopWatch {

    /**
     * Empty constructor.
     */
    constructor() {
        const _ = this;
        _._startTimeMs = 0;
        _._stopTimeMs = 0;
        _._starts = 0;
        _._totalTimeMs = 0;
        _._maxMs = Number.MIN_SAFE_INTEGER;
        _._minMs = Number.MAX_SAFE_INTEGER;
        _._isStarted = false;
    }


    /**
     * Get the duration in milliseconds.
     * @returns {number}
     */
    get timeMs() {
        const _ = this;
        return _._isStarted
            ? Date.now() - _._startTimeMs
            : _._stopTimeMs - _._startTimeMs;
    }

    /**
     * Get the maximum time recorded in milliseconds.
     * @returns {number}
     */
    get maxTimeMs() { return this._maxMs; }

    /**
     * Get the smallest time recorded in milliseconds.
     * @returns {number}
     */
    get minTimeMs() { return this._minMs; }

    /**
     * Get the sum of all recorded times in milliseconds.
     * @returns {number}
     */
    get totalTimeMs() { return this._totalTimeMs; }

    /**
     * Get the number of times the stopwatch was started.
     * @returns {number}
     */
    get starts() { return this._starts; }

    /**
     * Determine if the stopwatch is started.
     * @returns {boolean}
     */
    get isStarted() { return this._isStarted; }


    /**
     * Start the stopwatch.
     */
    start() {
        const _ = this;
        _._isStarted = true;
        _._startTimeMs = Date.now();
        _._starts++;
    }


    /**
     * Stop the stopwatch.
     *
     * @returns {number}
     */
    stop() {
        const _ = this;
        _._isStarted = false;
        _._stopTimeMs = Date.now();
        const timeMs = _._stopTimeMs - _._startTimeMs;
        _._totalTimeMs += timeMs;

        if (timeMs > _._maxMs)
            _._maxMs = timeMs;

        if (timeMs < _._minMs)
            _._minMs = timeMs;

        return timeMs;
    }


    /**
     * Reset all values.
     */
    reset() {
        const _ = this;
        _.stop();
        _._totalTimeMs = 0;
        _._startTimeMs = 0;
        _._stopTimeMs = 0;
        _._starts = 0;
        _._maxMs = Number.MIN_SAFE_INTEGER;
        _._minMs = Number.MAX_SAFE_INTEGER;
    }


    toJSON() {
        const _ = this;
        return {
            isStarted: _._isStarted,
            timeMs: _.timeMs,
            totalTimeMs: _._totalTimeMs,
            starts: _._starts,
            avgTimeMs: _._starts === 0 ? 0 : _._totalTimeMs / _._starts,
            maxMs: _._maxMs === Number.MIN_SAFE_INTEGER ? 0 : _._maxMs,
            minMs: _._minMs === Number.MAX_SAFE_INTEGER ? 0 : _._minMs
        }
    }


    static get CLASS_ID() { return 'b8238c87608e930ebb0dbaeedd5ce705fea7866be6206ed201717d8879af9718'; }
    static [Symbol.hasInstance](obj) {
        return pu.isInstanceOfById(obj, StopWatch.CLASS_ID);
    }
}

module.exports = StopWatch;