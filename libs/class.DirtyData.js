'use strict';

const precon = require('@mintpond/mint-precon');

/**
 * This is used to track changes to data so that data can be filtered by modification.
 *
 * The original intent of this class is to allow sending JSON data to web clients in full initially, and sending only
 * modified data subsequently.
 */
class DirtyData {

    /**
     * Constructor.
     *
     * @param [propertyTranslatorFn] {function(key:string):string} A function to change a property name.
     */
    constructor(propertyTranslatorFn) {
        precon.opt_funct(propertyTranslatorFn, 'propertyTranslatorFn');

        const _ = this;
        _._propertyTranslatorFn = propertyTranslatorFn;
        _._jsonString = null;
        _._dirtyJsonString = null;
        _._isDirty = false;
        _._built = null;
        _._dataMap = new Map();
    }


    /**
     * Determine if the data has been modified since it was last cleaned.
     * @returns {boolean}
     */
    get isDirty() { return this._isDirty }

    /**
     * Get JSON string of data.
     * @returns {string}
     */
    get json() {
        const _ = this;
        _.buildData();
        return _._jsonString || (_._jsonString = JSON.stringify(_._built.all));
    }

    /**
     * Get JSON string of dirty data.
     * @returns {string}
     */
    get dirtyJson() {
        const _ = this;
        _.buildData();
        return _._dirtyJsonString || (_._dirtyJsonString = JSON.stringify(_._built.dirty));
    }


    /**
     * Build data into JSON object and mark as unmodified.
     *
     * The built data is available in the SSE methods and the "json" and "dirtyJson" properties.
     *
     * @param [force] {boolean}
     */
    buildData(force) {
        const _ = this;

        if (!force && _._built && !_.isDirty)
            return;

        _._built = _._build();

        _.clean();
    }


    /**
     * Get SSE (Server Side Event) JSON response string.
     *
     * @param eventName {string}
     * @returns {string}
     */
    getSseEventData(eventName) {
        const _ = this;
        return `event:${eventName}\ndata:${_.json}\n\n`;
    }


    /**
     * Get SSE (Server Side Event) JSON dirty data response string.
     *
     * @param eventName {string}
     * @returns {string}
     */
    getSseEventDirtyData(eventName) {
        const _ = this;
        return `event:${eventName}\ndata:${_.dirtyJson}\n\n`;
    }


    /**
     * Determine if the data of a path is modified.
     *
     * @param path {string}
     * @returns {boolean}
     */
    isDirtyPath(path) {
        precon.string(path, 'key');

        const _ = this;

        const d = _._dataMap.get(path);
        return !!(d && d.isDirty);
    }


    /**
     * Mark all data as unmodified.
     */
    clean() {
        const _ = this;
        _._jsonString = null;
        _._dirtyJsonString = null;
        _._isDirty = false;
        for (const d of _._dataMap.values()) {
            d.isDirty = false;
            d.delta = undefined;
        }
    }


    /**
     * Clear all data.
     */
    clear() {
        const _ = this;
        _._dataMap.clear();
    }


    /**
     * Remove data by exact path.
     *
     * @param path {string}
     */
    remove(path) {
        precon.string(path, 'path');

        const _ = this;

        if (_._dataMap.has(path)) {
            _._isDirty = true;
            _._dataMap.delete(path);
        }
    }


    /**
     * Remove all data that matches the path or is a child or descendant property of the specified path.
     *
     * @param path {string}
     */
    removeAll(path) {
        precon.string(path, 'path');

        const _ = this;

        for (const key of _._dataMap.keys()) {
            if (key[0] === path[0] && key.startsWith(path)) {
                _._isDirty = true;
                _._dataMap.delete(key);
            }
        }
    }


    /**
     * Get a property value by path.
     *
     * @param path {string}
     * @returns {*}
     */
    get(path) {
        precon.string(path, 'path');

        const _ = this;

        const d = _._dataMap.get(path);
        return d ? d.value : undefined;
    }


    /**
     * Set a property value.
     *
     * @param path {string}
     * @param value {null|string|number|boolean|[]}
     * @param [comparatorFn] {function(a:*, b:*):boolean} A function to compare two values for sameness.
     * @returns {boolean}
     */
    set(path, value, comparatorFn) {
        precon.string(path, 'key');
        precon.defined(value, 'value');
        precon.opt_funct(comparatorFn, 'comparer');

        const _ = this;

        if (value !== null &&
            typeof value !== 'string' &&
            typeof value !== 'number' &&
            typeof value !== 'boolean' &&
            !Array.isArray(value)) {

            throw new Error(`Invalid value type: ${typeof value}`)
        }

        const d = _._dataMap.get(path);
        if (!d) {
            _._dataMap.set(path, {
                isDirty: true,
                value: value
            });
            _._isDirty = true;
            return true;
        }
        else {

            if (comparatorFn) {
                d.isDirty = !!comparatorFn(d.value, value);
            }
            else {
                d.isDirty = d.isDirty || d.value !== value;
            }

            d.value = value;

            _._isDirty = _._isDirty || d.isDirty;

            return d.isDirty;
        }
    }

    /**
     * Set a special delta property of a value that indicates the unique differences of the main value. Intended to
     * indicate new items in an array value.
     *
     * @param path {string}
     * @param value {*[]}
     * @returns {boolean}
     */
    setDelta(path, value) {
        precon.string(path, 'key');
        precon.array(value, 'value');

        const _ = this;

        const d = _._dataMap.get(path);
        if (!d) {
            _.set(path, value);
        }
        else {
            d.isDirty = true;
            d.delta = value;
            _._isDirty = true;
        }

        return true;
    }


    /**
     * Convert the data into an array of key/value arrays.
     *
     * @returns {[string,*][]}
     */
    toArray() {

        const _ = this;
        const array = [];

        for (const [key, item] of _._dataMap) {
            array.push([key, item.value]);
        }

        return array;
    }


    /**
     * Restore data from an array of key/value arrays.
     *
     * @param array {Array}
     */
    setArray(array) {
        const _ = this;
        array.forEach(kv => {

            const key = kv[0];
            const value = kv[1];

            if (Array.isArray(value)) {
                const oldValue = _.get(key);

                if (!Array.isArray(oldValue) || !oldValue.length) {
                    _.set(key, value);
                }
                else {

                    const deltaArr = [];

                    for (let i = 0; i < value.length; i++) {
                        const element = value[i];
                        var hasMatch = false;
                        for (var j = 0; j < oldValue.length; j++) {
                            const oldElement = oldValue[j];
                            if (DirtyData._isMatch(oldElement, element)) {
                                hasMatch = true;
                                break;
                            }
                        }
                        if (!hasMatch) {
                            deltaArr.push(element);
                        }
                    }

                    _.setDelta(key, deltaArr);
                    _.set(key, value);
                }
            }
            else {
                _.set(key, value);
            }
        });
    }


    /*
     * Build data into 2 objects. An "all" object that contains all values and a "dirty" object that only
     * contains data values that were modified.
     */
    _build() {

        const _ = this;
        const result = {
            all : {}, // all data
            dirty : {} // modified data only
        };

        // regular key paths
        for (const [path, d] of _._dataMap.entries()) {

            let value = d.value;

            if (Array.isArray(value) && typeof d.start === 'number') {

                value = [];
                const fromEnd = d.isStartFromEnd;

                const start = fromEnd ? d.value.length - d.start : d.start;
                const end = fromEnd
                    ? Math.max(start - d.count + 1, 0)
                    : Math.min(start + d.count, d.value.length) - 1;

                for (let i = start; fromEnd ? i >= end : i <= end; fromEnd ? i-- : i++) {
                    value.push(d.value[i]);
                }
            }

            const isKVDirty = d.isDirty && (!Array.isArray(d.delta) || d.delta.length > 0);

            const compressedKey = _._translateKey(path);

            DirtyData._setKeyValue(compressedKey, value, d.delta || value, result.all, isKVDirty ? result.dirty : null);
        }

        return result;
    }


    _translateKey(key) {
        const _ = this;
        return _._propertyTranslatorFn ? _._propertyTranslatorFn(key) : key;
    }


    static _isMatch(obj1, obj2) {

        if (obj1 === obj2)
            return true;

        if (typeof obj1 !== typeof obj2)
            return false;

        if (typeof obj1 === 'object') {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);

            if (keys1.length !== keys2.length)
                return false;

            for (let i = 0; i < keys1.length; i++) {
                const k1 = keys1[i];
                if (!DirtyData._isMatch(obj1[k1], obj2[k1]))
                    return false;
            }
            return true;
        }
        else if (Array.isArray(obj1)) {

            if (obj1.length !== obj2.length)
                return false;

            for (let k = 0; k < obj1.length; k++) {
                if (!DirtyData._isMatch(obj1[k], obj2[k]))
                    return false;
            }
            return true;
        }
    }


    static _setKeyValue (key, value, delta, obj, dirtyObj) {

        // key needs to be an array so it can be shifted easily
        if (typeof key === 'string') {
            key = key.split('.');
        }
        else if (!Array.isArray(key)) {
            throw new Error('Invalid key type.');
        }

        const localKey = key.shift();

        // no more key left, assign value to the object
        if (key.length === 0 || !localKey) {
            obj[localKey] = value;
            dirtyObj && (dirtyObj[localKey] = delta);
            return;
        }

        // determine if local key is an array by detecting index getter
        const arrayKey = DirtyData._getArrayKey(localKey);
        let childObj;
        let dirtyChild;

        if (!arrayKey) {
            // local key is not an array

            childObj = obj[localKey];
            dirtyObj && (dirtyChild = dirtyObj[localKey]);

            if (!childObj)
                childObj = obj[localKey] = {};

            if (!dirtyChild)
                dirtyObj && (dirtyChild = dirtyObj ? dirtyObj[localKey] = {} : null);


            // recursively set value on object of the current local key
            DirtyData._setKeyValue(key, value, delta, childObj, dirtyChild);
            return;
        }

        // local key is for an array

        childObj = obj[arrayKey.key];
        dirtyObj && (dirtyChild = dirtyObj[arrayKey.key]);

        // ensure referenced array exists and is an array
        if (!Array.isArray(childObj))
            childObj = obj[arrayKey.key] = [];

        if (!Array.isArray(dirtyChild))
            dirtyObj && (dirtyChild = dirtyObj ? (dirtyObj[arrayKey.key] = []) : null);

        // get indexed array element
        let arrayObj = childObj[arrayKey.index];
        let dirtyArrayObj = dirtyObj ? dirtyChild[arrayKey.index] : null;

        // ensure indexed array element exists
        if (!arrayObj)
            arrayObj = childObj[arrayKey.index] = {};

        if (!dirtyArrayObj)
            dirtyObj && (dirtyArrayObj = dirtyObj ? (dirtyChild[arrayKey.index] = {}) : null);


        // recursively set value on array element
        DirtyData._setKeyValue(key, value, delta, arrayObj, dirtyArrayObj);
    }


    static _getArrayKey(localKey) {

        // assumes localKey for a indexed array getter path will be of the format: 'propertyName[index]'

        // detect index getter using fastest means
        if (localKey[localKey.length - 1] !== ']')
            return false;

        // get position of the index getter start
        const startIndex = localKey.lastIndexOf('[');
        if (startIndex === -1)
            return false;

        // parse the index number within the index getter brackets
        const index = parseInt(localKey.substr(startIndex + 1, (localKey.length - 2) - startIndex));
        if (isNaN(index))
            return false;

        // extract the property name
        localKey = localKey.substr(0, startIndex);

        return {
            key: localKey,
            index: index
        };
    }
}

module.exports = DirtyData;