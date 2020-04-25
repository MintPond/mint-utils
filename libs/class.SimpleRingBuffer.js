'use strict';

const
    precon = require('@mintpond/mint-precon'),
    pu = require('./service.prototypes');


/**
 * Used to keep a collection of items up to a maximum number of entries.
 *
 * Newest entries overwrite oldest entries when capacity is reached.
 */
class SimpleRingBuffer {

    /**
     * Constructor.
     *
     * @param capacity {number} The max number of items the buffer can hold.
     */
    constructor (capacity) {
        precon.positiveInteger(capacity, 'capacity');

        const _ = this;
        _._capacity = capacity;
        _._size = 0;
        _._nextIndex = 0;
        _._bufferArr = Array(capacity);
    }


    /**
     * Get the number of items in the buffer.
     * @returns {number}
     */
    get size() { return this._size; }

    /**
     * Get the max number of items the buffer can hold.
     * @returns {number}
     */
    get capacity() { return this._capacity; }


    /**
     * Push an item into the ring buffer.
     *
     * @param item {*} The item to push.
     * @returns {*} The replaced value, if any.
     */
    push(item) {
        precon.notNull(item, 'item');

        const _ = this;

        if (_._size < _._capacity)
            _._size++;

        const replacedValue = _._size === _._capacity
            ? _._bufferArr[_._nextIndex]
            : undefined;

        _._bufferArr[_._nextIndex] = item;
        _._nextIndex = (_._nextIndex + 1) % _._capacity;

        return replacedValue;
    }


    /**
     * Convert the ring buffer into an array of the items it contains.
     *
     * @returns {*[]}
     */
    toArray() {

        const _ = this;
        const resultArr = [];

        if (_._size === 0)
            return resultArr;

        for (let i = _._size - 1, index = _._nextIndex - 1; i >= 0; i--, index--) {

            if (index < 0)
                index = _._bufferArr.length - 1;

            const entry = _._bufferArr[index];
            resultArr.push(entry);
        }

        resultArr.reverse();

        return resultArr;
    }


    /**
     * Clear all values from the buffer.
     */
    clear() {
        const _ = this;
        _._size = 0;
        _._nextIndex = 0;
        _._bufferArr.length = 0;
    }


    /**
     * Iterate values in the buffer.
     *
     * @param iteratorFn {function(entry:*, index:number)}
     * @returns {SimpleRingBuffer}
     */
    forEach(iteratorFn) {
        precon.funct(iteratorFn, 'iteratorFn');

        const _ = this;

        if (_._size === 0)
            return _;

        const startIndex = _._size === _._capacity ? _._nextIndex : 0;
        for (let i = startIndex, j = 0; j < _._size; i++, j++) {
            if (i >= _._capacity)
                i = 0;

            const entry = _._bufferArr[i];
            iteratorFn(entry, i);
        }

        return _;
    }


    /**
     * Generate an array of mapped values from the buffer.
     *
     * @param iteratorFn {function(entry:*, index:number):*}
     * @returns {*[]}
     */
    map(iteratorFn) {
        precon.funct(iteratorFn, 'iteratorFn');

        const _ = this;
        const resultArr = [];

        if (_._size === 0)
            return resultArr;

        const startIndex = _._size === _._capacity ? _._nextIndex : 0;
        for (let i = startIndex, j = 0; j < _._size; i++, j++) {
            if (i >= _._capacity)
                i = 0;

            const entry = _._bufferArr[i];
            resultArr[j] = iteratorFn(entry, j);
        }

        return resultArr;
    }


    /**
     * Reduce values in the buffer to a single value.
     *
     * @param iteratorFn {function(a:*, entry:*):*}
     * @param [startValue] {*}
     * @returns {*}
     */
    reduce(iteratorFn, startValue) {
        precon.funct(iteratorFn, 'iteratorFn');

        const _ = this;

        if (_._size === 0)
            return startValue;

        let value = startValue;

        const startIndex = _._size === _._capacity ? _._nextIndex : 0;
        for (let i = startIndex, j = 0; j < _._size; i++, j++) {
            if (i >= _._capacity)
                i = 0;

            const entry = _._bufferArr[i];
            value = iteratorFn(value, entry, j);
        }

        return value;
    }


    static [Symbol.hasInstance](obj) {
        return pu.isInstanceOfByName(obj, 'SimpleRingBuffer') &&
            pu.isFunction(obj.push) &&
            pu.isFunction(obj.toArray) &&
            pu.isFunction(obj.clear) &&
            pu.isFunction(obj.forEach) &&
            pu.isFunction(obj.map) &&
            pu.isFunction(obj.reduce) &&
            pu.hasGetters(obj,
                'size', 'capacity');
    }
}

module.exports = SimpleRingBuffer;