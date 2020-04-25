'use strict';

const
    async = require('async'),
    precon = require('@mintpond/mint-precon');


/*
 * Private CacheItemPool class used by TTLMemCache.
 * Creates and recycles CacheItem container instances.
 */
class CacheItemPool {

    /**
     * Empty constructor.
     */
    constructor() {
        const _ = this;
        _._poolArr = [];
    }


    getItem(value, ttl, isResetOnAccess) {
        const _ = this;
        if (_._poolArr.length === 0) {
            return new CacheItem(value, ttl, isResetOnAccess);
        }
        else {
            const item = _._poolArr.pop();
            item.ttl = ttl;
            item.isResetOnAccess = isResetOnAccess;
            item.setValue(value);
            return item;
        }
    }


    recycleItem(item) {
        const _ = this;
        item.reset();
        _._poolArr.push(item);
    }
}

const itemPool = new CacheItemPool();


/**
 * In-memory key/value cache whose items expire if not accessed after a "time to live" period (TTL).
 */
class TTLMemCache {

    /**
     * Constructor.
     *
     * @param [args]
     * @param [args.ttl] {number} Default TTL seconds of values in the cache. If omitted, the default value is 180.
     * @param [args.isResetOnAccess] {boolean} True will cause TTL timeout of a value to reset
     *                                         whenever it is retrieved or set.
     */
    constructor(args) {
        if (args) {
            precon.opt_positiveInteger(args.ttl, 'ttl');
            precon.opt_boolean(args.isResetOnAccess, 'isResetOnAccess');
        }

        const _ = this;

        _._cache = new Cache();

        if (args && args.ttl) {
            _._defaultTTL = precon.number(args.ttl, 'ttl');
        }
        else {
            _._defaultTTL = 180;
        }

        if (args && typeof args.isResetOnAccess !== 'undefined') {
            _._isResetOnAccess = !!args.isResetOnAccess;
        }
        else {
            _._isResetOnAccess = true;
        }
    }


    /**
     * The time in seconds that un-accessed cache items will live in the cache when not specified individually.
     * @type {number}
     */
    get defaultTTL() { return this._defaultTTL; }
    set defaultTTL(ttl) {
        precon.positiveNumber(ttl, 'defaultTTL');
        this._defaultTTL = ttl;
    }

    /**
     * Determine if cached value lifetime should be reset when accessed.
     * @type {boolean}
     */
    get isResetOnAccess() { return this._isResetOnAccess; }
    set isResetOnAccess(is) { this._isResetOnAccess = !!is; }

    /**
     * Get the number of cached items.
     * @returns {number}
     */
    get size() { return this._cache.lookup.size; }

    /**
     * Get the interval in seconds between checks for expired cache items.
     * @returns {number}
     */
    get checkInterval() { return this._cache.checkPeriod; }
    set checkInterval(seconds) {
        precon.positiveInteger(seconds, 'checkInterval');

        const _ = this;
        _._cache.checkInterval = seconds;
        _._cache.setupCheck();
    }


    /**
     * Get the value for the specified key from the cache. If the value is present in the cache, its TTL timer is
     * reset.
     *
     * @param key {string}  The key associated with the desired value to retrieve.
     * @returns {*|undefined}
     */
    get(key) {
        precon.string(key, 'key');

        const _ = this;
        const item = _._cache.lookup.get(key);
        return item && !item.isExpired() ? item.getValue() : undefined;
    }


    /**
     * Set the value for the specified key into the cache. Overwrites existing value or adds to the cache if a
     * value is not already present. If a value is already present, it's TTL timer is reset.
     *
     * @param key {string}  The key associated with the value to set.
     * @param value {*}  The value to set.
     * @param [ttl] {number}  TTL value in seconds. If omitted, the default TTL is used.
     * @param [isResetOnAccess] {boolean}  Flag to determine if the lifetime should be reset when key is
     *                                       accessed. If omitted, the default flag is used.
     */
    set(key, value, ttl, isResetOnAccess) {
        precon.string(key, 'key');
        precon.defined(value, 'value');
        precon.opt_positiveInteger(ttl, 'ttl');
        precon.opt_boolean(isResetOnAccess, 'isResetOnAccess');

        const _ = this;

        let item = _._cache.lookup.get(key);
        if (!item) {
            item = itemPool.getItem(
                value,
                ttl || _._defaultTTL,
                typeof isResetOnAccess !== 'undefined' ? isResetOnAccess : _._isResetOnAccess);
            _._cache.lookup.set(key, item);
        }
        else {
            item.setValue(value);

            item.ttl = ttl ? ttl : _._defaultTTL;

            item.isResetOnAccess = typeof isResetOnAccess !== 'undefined'
                ? isResetOnAccess
                : _._isResetOnAccess;
        }
    }


    /**
     * Remove a key value from the cache.
     *
     * @param key {string}  The key associated with the value to remove.
     */
    delete(key) {
        precon.string(key, 'key');

        const _ = this;
        const item = _._cache.lookup.get(key);
        if (item) {
            _._cache.lookup.delete(key);
            itemPool.recycleItem(item);
        }
    }


    /**
     * Clear all values from the cache.
     */
    clear() {
        const _ = this;
        for (const item of _._cache.lookup.values()) {
            itemPool.recycleItem(item);
        }
        _._cache.lookup.clear();
    }


    /**
     * Iterate over keys in the cache collection. Passes the key name as argument to the callback.
     *
     * @param iteratorFn {function(key:string)}
     */
    forEachKey(iteratorFn) {
        precon.funct(iteratorFn, 'iteratorFn');

        const _ = this;
        const nowMs = Date.now();
        for (const [key, item] of _._cache.lookup) {

            if (item.isExpired(nowMs))
                continue;

            iteratorFn(key);
        }
    }


    /**
     * Iterate over keys in the cache collection. Passes the key name and value as argument to the callback.
     *
     * @param iteratorFn {function(key:string, item:*)}
     */
    forEachEntry(iteratorFn) {
        precon.funct(iteratorFn, 'iteratorFn');

        const _ = this;
        const nowMs = Date.now();
        for (var [key, item] of _._cache.lookup.entries()) {

            if (item.isExpired(nowMs))
                continue;

            iteratorFn(key, item.getValueNoReset());
        }
    }


    /**
     * Get an iterable of all keys in the cache.
     *
     * @returns {IterableIterator}
     */
    keys() {
        const _ = this;
        return _._cache.lookup.keys();
    }


    /**
     * Get an iterable of all values in the cache.
     *
     * @returns {IterableIterator}
     */
    values() {
        const _ = this;
        return _._cache.lookup.values();
    }


    destroy() {
        const _ = this;
        _._cache.destroy();
    }
}


class Cache {

    constructor() {

        const _ = this;
        _._intervalHandle = null;
        _.lookup = new Map();
        _.checkInterval = 10 + Math.round(Math.random() * 10);
        _._isRemovingExpired = false;
        _._isDestroyed = false;

        _.setupCheck();
    }


    removeExpired() {
        const _ = this;

        if (_._isRemovingExpired)
            return;

        _._isRemovingExpired = true;

        const it = _.lookup.entries();
        let itResult = null;

        async.whilst(() => {
            itResult = it.next();
            return !itResult.done && !_._isDestroyed;
        }, wCallback => {

            const entry = itResult.value;
            const key = entry[0];
            const item = entry[1];

            if (item.isExpired()) {
                itemPool.recycleItem(item);
                _.lookup.delete(key);
            }

            setImmediate(wCallback);

        }, () => {
            _._isRemovingExpired = false;
            if (!_._isDestroyed)
                _._intervalHandle = setTimeout(_.removeExpired.bind(_), _.checkInterval * 1000);
        });
    }


    setupCheck() {
        const _ = this;
        clearTimeout(_._intervalHandle);
        _.removeExpired();
    }


    destroy() {
        const _ = this;
        _._isDestroyed = true;
        clearTimeout(_._intervalHandle);
    }
}


class CacheItem {

    constructor(value, ttl, isResetOnAccess) {
        const _ = this;
        _._value = value;
        _.ttl = ttl; // seconds
        _.isResetOnAccess = isResetOnAccess;
        _.ttlStartTimeMs = Date.now();
    }


    getValue() {
        const _ = this;
        // reset ttl on every access of value
        if (_.isResetOnAccess)
            _.ttlStartTimeMs = Date.now();

        return _._value;
    }


    getValueNoReset() {
        const _ = this;
        return _._value;
    }


    setValue(newValue) {
        const _ = this;
        _.ttlStartTimeMs = Date.now();
        _._value = newValue;
    }


    reset() {
        const _ = this;
        _._value = null;
    }


    isExpired(nowMs) {
        const _ = this;
        const expirationMs = _.ttlStartTimeMs + (_.ttl * 1000);
        return (nowMs ? nowMs : Date.now()) >= expirationMs;
    }
}

module.exports = TTLMemCache;