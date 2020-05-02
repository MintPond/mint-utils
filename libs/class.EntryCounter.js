'use strict';

const
    precon = require('@mintpond/mint-precon'),
    pu = require('./service.prototypes');


class EntryCounter {

    /**
     * Constructor.
     *
     * @param [max] {number} The max number of entries allowed.
     * @param [filterFn] {function(...args):boolean} Optional function that filters entries.
     */
    constructor(max, filterFn) {
        precon.opt_funct(filterFn, 'filterFn');

        const _ = this;

        _._max = max;
        _._filterFn = filterFn;
        _._requiresRecalc = false;
        _._count = 0;
        _._valuesArr = max || filterFn ? [] : null;
    }


    /**
     * The number of entries added.
     * @returns {number}
     */
    get count() { this._recalculate(); return this._count; }


    /**
     * Add an entry. Use as many arguments as needed to describe the
     * entry. Arguments are used by the filter function.
     *
     * The first argument must be a positive number and is the increment amount.
     * If omitted, the default increment value is 1.
     *
     * @param [args]
     */
    increment(...args) {
        precon.opt_positiveNumber(args[0], 'value');

        if (typeof args[0] !== 'number')
            args[0] = 1;

        const _ = this;
        if (_._filterFn) {
            _._valuesArr.push([...args]);
            _._requiresRecalc = true;
        }
        else {
            _._count = _._count + args[0];
            if (_._max && _._count > _._max)
                _._count = _._max;
        }
    }


    /**
     * Clear all entries.
     */
    clear() {
        const _ = this;
        if (_._filterFn) {
            _._valuesArr.length = 0;
            _._requiresRecalc = false;
        }
        _._count = 0;
    }


    toJSON() {
        const _ = this;
        _._recalculate();
        return _._count;
    }


    _recalculate() {
        const _ = this;

        if (!_._requiresRecalc)
            return;

        if (_._max && _._valuesArr.length > _._max) {
            _._valuesArr.splice(0, _._valuesArr.length - _._max);
            if (_._valuesArr.length !== _._max)
                throw new Error('unexpected');
        }

        _._requiresRecalc = false;
        _._count = 0;

        for (let i = _._valuesArr.length - 1; i >= 0; i--) {
            const entry = _._valuesArr[i];
            if (_._filterFn && !_._filterFn(...entry)) {
                _._valuesArr.splice(i, 1);
            }
            else {
                _._count = _._count + entry[0];
            }
        }
    }


    static get CLASS_ID() { return '8f3d5286a76b44d812f886e69391025f0cc4d5ff07381c5f1710770447d72efc'; }
    static [Symbol.hasInstance](obj) {
        return pu.isInstanceOfById(obj, EntryCounter.CLASS_ID);
    }
}


module.exports = EntryCounter;