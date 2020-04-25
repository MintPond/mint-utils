'use strict';

const precon = require('@mintpond/mint-precon');

const FACTOR = 100000000;
const FACTOR_BI = 100000000n;


class HighLowAverage {

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
        _._countBi = 0n;
        _._valuesArr = max || filterFn ? [] : null;
        _._averageBi = 0n;
        _._highBi = 0n;
        _._lowBi = 0n;
        _._totalBi = 0n;
    }


    /**
     * The number of entries added.
     * @returns {number}
     */
    get count() { this._recalculate(); return Number(this._countBi); }

    /**
     * The highest entry value.
     * @returns {number}
     */
    get high() { this._recalculate(); return Number(this._highBi) / FACTOR; }

    /**
     * The average entry value.
     * @returns {number}
     */
    get average() { this._recalculate(); return Number(this._averageBi) / FACTOR; }

    /**
     * The lowest entry value.
     * @returns {number}
     */
    get low() { this._recalculate(); return Number(this._lowBi) / FACTOR; }


    /**
     * Add an entry. Use as many arguments as needed to describe the
     * value. Additional arguments are used by the filter function.
     *
     * The first argument must be a BigInt, number or a string parsable into a number.
     *
     * @param args
     */
    add(...args) {
        if (typeof args[0] === 'bigint') {
            args[0] = args[0] * FACTOR_BI;
        }
        else if (typeof args[0] === 'string') {
            args[0] = BigInt(Math.round(parseFloat(args[0]) * FACTOR));
        }
        else if (typeof args[0] === 'number') {
            args[0] = BigInt(args[0] * FACTOR);
        }
        else {
            throw new Error(`Invalid data type (Expected BigInt, parsable string, or number): ${args[0]}`)
        }

        const _ = this;
        if (_._max || _._filterFn) {
            _._valuesArr.push([...args]);
            _._requiresRecalc = true;
        }
        else {
            const valBi = args[0];
            _._countBi++;
            _._totalBi = _._totalBi + valBi;
            _._highBi = _._countBi === 1n ? valBi : _._highBi > valBi ? _._highBi : valBi;
            _._lowBi = _._countBi === 1n ? valBi : _._lowBi < valBi ? _._lowBi : valBi;
            _._averageBi = _._totalBi / _._countBi;
        }
    }


    /**
     * Clear all entries.
     */
    clear() {
        const _ = this;
        if (_._max || _._filterFn) {
            _._valuesArr.length = 0;
            _._requiresRecalc = false;
        }
        _._countBi = 0n;
        _._highBi = 0n;
        _._lowBi = 0n;
        _._averageBi = 0n;
        _._totalBi = 0n;
    }


    toJSON() {
        const _ = this;
        _._recalculate();
        return {
            count: Number(_._countBi),
            high: Number(_._highBi) / FACTOR,
            low: Number(_._lowBi) / FACTOR,
            average: Number(_._averageBi) / FACTOR
        };
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
        _._countBi = 0n;
        _._totalBi = 0n;
        _._highBi = null;
        _._lowBi = null;
        _._averageBi = null;

        for (let i = _._valuesArr.length - 1; i >= 0; i--) {
            const entry = _._valuesArr[i];

            if (_._filterFn && !_._filterFn(parseInt(entry[0]) / FACTOR, ...entry.slice(1))) {
                _._valuesArr.splice(i, 1);
            }
            else {
                const valBi = entry[0];
                _._countBi++;
                _._highBi = _._highBi === null ? valBi : _._highBi > valBi ? _._highBi : valBi;
                _._lowBi = _._lowBi === null ? valBi : _._lowBi < valBi ? _._lowBi : valBi;
                _._totalBi = _._totalBi + valBi;
            }
        }

        if (_._countBi === 0n) {
            _._highBi = 0n;
            _._lowBi = 0n;
            _._averageBi = 0n;
        }
        else {
            _._averageBi = _._totalBi / _._countBi;
        }
    }
}


module.exports = HighLowAverage;