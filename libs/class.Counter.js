'use strict';

const precon = require('@mintpond/mint-precon');

/**
 * This is a simple counter that allows setting a start count, a minimum and maximum count, and will automatically wrap
 * back to the minimum when the maximum is reached.
 *
 * Resetting the counter will return it to the start count.
 */
class Counter {

    /**
     * Constructor.
     *
     * @param [startCount=0] {number} The first integer to start with.
     * @param [minCount=0] {number} The minimum value. This is the integer that will be after maxCount.
     * @param [maxCount=4294967295] {number} The maximum value. The counter will reset to minCount after this value.
     */
    constructor(startCount, minCount, maxCount) {
        precon.opt_integer(startCount, 'startCount');
        precon.opt_integer(minCount, 'minCount');
        precon.opt_integer(maxCount, 'maxCount');

        const _ = this;
        _._startCount = typeof startCount === 'number' ? startCount : 0;
        _._counter = _._startCount;
        _._minCount = typeof minCount === 'number' ? minCount : 0;
        _._maxCount = typeof maxCount === 'number' ? maxCount : 4294967295;
        _._buffer = null;
    }


    /**
     * Increment the counter and return the current count.
     *
     * @returns {number}
     */
    next() {
        const _ = this;
        const count = _._counter;

        _._counter++;
        if (_._counter > _._maxCount)
            _._counter = _._minCount;

        return count;
    }


    /**
     * Increment the counter and return the current count as a 32-bit hex string.
     *
     * This should not be used if minCount is less than 0 or maxCount is a number larger than 32 bits.
     *
     * @returns {string}
     */
    nextHex32() {

        const _ = this;
        const count = Math.abs(_.next());

        if (_._buffer === null)
            _._buffer = Buffer.alloc(4);

        _._buffer.writeUInt32BE(count % 4294967296, 0);

        return _._buffer.toString('hex');
    }


    /**
     * Reset the counter back to startCount value.
     */
    reset() {
        const _ = this;
        _._counter = _._startCount;
    }
}

module.exports = Counter;