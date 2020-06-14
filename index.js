'use strict';

const
    async = require('async'),
    crypto = require('crypto'),
    fs = require('fs'),
    os = require('os'),
    precon = require('@mintpond/mint-precon'),
    passwords = require('./libs/service.passwords');

const DATE = new Date();
const BIT_UNITS = ['b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'];
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const HASH_UNITS = ['h', 'Kh', 'Mh', 'Gh', 'Th', 'Ph'];
const TIME_UNITS = ['secs', 'mins', 'hrs'];


const mu = module.exports = {

    get STRONG_PASSWORD_CHARS() { return passwords.STRONG_PASSWORD_CHARS },
    get ALPHA_NUMERIC_CHARS() { return passwords.ALPHA_NUMERIC_CHARS },
    get BASE58_READABLE_CHARS() { return passwords.BASE58_READABLE_CHARS },
    get HEX_CHARS() { return passwords.HEX_CHARS },


    // Classes

    AdaptiveConfig: require('./libs/class.AdaptiveConfig'),
    CallbackBuffer: require('./libs/class.CallbackBuffer'),
    Counter: require('./libs/class.Counter'),
    DirtyData: require('./libs/class.DirtyData'),
    EntryCounter: require('./libs/class.EntryCounter'),
    HighLowAverage: require('./libs/class.HighLowAverage'),
    SimpleRingBuffer: require('./libs/class.SimpleRingBuffer'),
    StopWatch: require('./libs/class.StopWatch'),
    Timeouts: require('./libs/class.Timeouts'),
    TTLMemCache: require('./libs/class.TTLMemCache'),
    WorkTracker: require('./libs/class.WorkTracker'),


    // Services

    /**
     * BigInt conversion utilities.
     */
    bi: require('./libs/service.bi'),

    /**
     * Buffer builder and manipulation utilities.
     */
    buffers: require('./libs/service.buffers'),

    /**
     * Password hashing and matching utilities.
     */
    passwords: passwords,

    /**
     * Javascript Prototype utilities.
     */
    prototypes: require('./libs/service.prototypes'),


    // Functions

    /**
     * Async each function. Exceptions in iterator are caught and returned as an error.
     *
     * @returns {function}
     */
    each: each,

    /**
     * Async eachSeries function. Exceptions in iterator are caught and returned as an error.
     *
     * @returns {function}
     */
    eachSeries: eachSeries,

    /**
     * Async eachLimit function. Exceptions in iterator are caught and returned as an error.
     *
     * @returns {function}
     */
    eachLimit: eachLimit,

    /**
     * Async parallel function. Exceptions in functions are caught and returned as an error.
     *
     * @returns {function}
     */
    parallel: parallel,

    /**
     * Async series function. Exceptions in functions are caught and returned as an error.
     *
     * @returns {function}
     */
    series: series,

    /**
     * Async some function.
     *
     * @returns {function}
     */
    some: some,

    /**
     * Async waterfall function. Exceptions in functions are caught and returned as an error.
     *
     * @returns {function}
     */
    waterfall: waterfall,

    /**
     * Determine if a value is an object.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isObject: val => typeof val === 'object',

    /**
     * Determine if a value is a function.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isFunction: val => typeof val === 'function',

    /**
     * Determine if a value is a boolean.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isBoolean: val => typeof val === 'boolean',

    /**
     * Determine if a value is a string.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isString: val => typeof val === 'string',

    /**
     * Determine if a value is a non-empty string
     *
     * @param val {*}
     * @returns {boolean}
     */
    isFilledString: val => typeof val === 'string' && !!val,

    /**
     * Determine if a value is a number.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isNumber: val => typeof val === 'number',

    /**
     * Determine if a value is a BigInt.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isBigInt: val => typeof val === 'bigint',

    /**
     * Determine if a value is an integer.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isInteger: val => typeof val === 'number' && Number.isInteger(val),

    /**
     * Determine if a value is undefined.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isUndefined: val => typeof val === 'undefined',

    /**
     * Determine if a value is defined.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isDefined: val => typeof val !== 'undefined',

    /**
     * Determine if a value is null.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isNull: val => val === null,

    /**
     * Determine if a value is null or undefined.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isNotSet: val => val === null || typeof val === 'undefined',

    /**
     * Determine if a value is an Array.
     *
     * @param val {*}
     * @returns {boolean}
     */
    isArray: val => Array.isArray(val),

    /**
     * Throw an exception or, if available, put the error as the first argument of a callback.
     *
     * @param message {string|Error}
     * @param [callback] {function(err:Error)}
     */
    throw: throwFn,

    /**
     * Create an array containing evenly sized chunks (arrays) of an input array.
     *
     * The final chunk in the result may be smaller if the chunks cannot be divided evenly.
     *
     * @param array {*[]} The array to split into chunks.
     * @param size {number} The number of elements in each chunk.
     * @returns {*[]} An array of array chunks.
     */
    chunk: chunk,

    /**
     * Concat multiple arrays or iterables in to a single array.
     *
     * @param arrays {*[]|IterableIterator}
     * @returns {*[]}
     */
    concat: concat,

    /**
     * Return elements in array that are not found in the provided exclusion array.
     *
     * @param array {*[]}
     * @param excludeArr {*[]}
     * @param [comparatorFn] {function(a:*, b:*):boolean}
     * @returns {*[]}
     */
    difference: difference,

    /**
     * Push all elements of the specified source array into the target array.
     *
     * @param targetArr {*[]} The array to push into.
     * @param sourceArrs {*[]} Arrays whose elements should be pushed into the target array.
     * @returns {*[]} The target array
     */
    pushAll: pushAll,

    /**
     * Covert 1 or more arrays and/or IterableIterator's into a Set.
     *
     * @param arrays {*[]|IterableIterator<*>}
     * @returns {Set<*>}
     */
    toSet: toSet,

    /**
     * Sort an array in ascending order.
     *
     * @param array {*[]} The array to sort.
     * @param [propOrFn] {string|function(elem:*):*} The name of the property in elements to sort by or a function to
     * return the value to sort by of an element.
     */
    sortAscending: sortAscending,

    /**
     * Sort an array in descending order.
     *
     * @param array {*[]} The array to sort.
     * @param [propOrFn] {string|number|function(elem:*):*} The name of the property in elements to sort by,
     * or the index position in array elements to sort by, or a function to return the value to sort by from an element.
     */
    sortDescending: sortDescending,

    /**
     * Read a string for the path of an inline file and return the contents of the file as a string. If the str
     * argument is not an inline file path or the file cannot be read then the value passed into the str parameter
     * is returned.
     *
     * Example of an inline file path: "file:../path/to/file.name"
     *
     * A valid inline file path must begin with the prefix "file:" with the rest of the string being the path to
     * the file.
     *
     * @param str {string|*}
     * @param [ext] {string} A filename extension to try if the file is not found (include preceding period).
     * @param [callback] {function(err:*,result:string|*)} Callback for async operation. Exclude for a sync operation.
     * @returns {string|*|undefined} Returns result when the operation is synchronous. No result returned for async.
     */
    getInlineFile: getInlineFile,

    /**
     * Find and replace all inline file strings in an object with contents of the specified file if found.
     *
     * @param obj {object}
     * @param [callback] {function(err:*, obj:object)}
     */
    inlineAllFiles: inlineAllFiles,

    /**
     * Get the epoch time in seconds.
     *
     * @returns {number}
     */
    now: now,

    /**
     * Get the epoch time in milliseconds.
     *
     * @returns {number}
     */
    nowMs: nowMs,

    /**
     * Determine if an epoch time is in milliseconds.
     *
     * @param time {number} The epoch time to check.
     * @returns {boolean} True if milliseconds, false if seconds.
     */
    isTimeInMs: isTimeInMs,

    /**
     * Truncate epoch time seconds by minute.
     *
     * @param [time=now] {number} The time to truncate. Uses current time if not specified.
     * @returns {number}
     */
    truncTimeMinute: truncTimeMinute,

    /**
     * Get the start time (epoch seconds) of the day of the specified time (epoch seconds or milliseconds).
     *
     * @param [time=now] {number} The time in epoch seconds or milliseconds.
     * @param [offsetDays=0] {number} The number of days to offset the result.
     * @returns {number}
     */
    getDayStartTime: getDayStartTime,

    /**
     * Get the end time (epoch seconds) of the day of the specified time (epoch seconds or milliseconds).
     *
     * @param [time=now] {number} The time in epoch seconds or milliseconds.
     * @param [offsetDays=0] {number} The number of days to offset the result.
     * @returns {number}
     */
    getDayEndTime: getDayEndTime,

    /**
     * Get the start time (epoch seconds) of the week of the specified time (epoch seconds or milliseconds)
     *
     * @param [time=now] {number} The time in epoch seconds or milliseconds.
     * @param [weekOffset=0] {number} The number of weeks to offset the result.
     * @returns {number}
     */
    getWeekStartTime: getWeekStartTime,

    /**
     * Get the end time (epoch seconds) of the week of the specified time (epoch seconds or milliseconds)
     *
     * @param [time=now] {number} The time in epoch seconds or milliseconds.
     * @param [weekOffset=0] {number} The number of weeks to offset the result.
     * @returns {number}
     */
    getWeekEndTime: getWeekEndTime,

    /**
     * Get the start time (epoch seconds) of the month of the specified time (epoch seconds or milliseconds)
     *
     * @param [time=now] {number} The time in epoch seconds or milliseconds.
     * @param [monthOffset=0] {number} The number of months to offset the result.
     * @returns {number}
     */
    getMonthStartTime: getMonthStartTime,

    /**
     * Get the end time (epoch seconds) of the month of the specified time (epoch seconds or milliseconds)
     *
     * @param [time=now] {number} The time in epoch seconds or milliseconds.
     * @param [monthOffset=0] {number} The number of months to offset the result.
     * @returns {number}
     */
    getMonthEndTime: getMonthEndTime,

    /**
     * Convert timestamp (epoch seconds) to a string in local form: '2020-04-24'
     *
     * @param [time=now] {number}
     * @returns {string}
     */
    getW3CDateString: getW3CDateString,

    /**
     * Convert timestamp (epoch seconds) to a string in UTC form: '2020-04-24'
     *
     * @param [time=now] {number}
     * @returns {string}
     */
    getW3CDateUtcString: getW3CDateUtcString,

    /**
     * Convert timestamp (epoch seconds) to a string in local form: '2020-04-24T13:22:01-07:30'
     *
     * @param [time=now] {number}
     * @returns {string}
     */
    getW3CDateTimeString: getW3CDateTimeString,

    /**
     * Convert timestamp (epoch seconds) to a string in UTC form: '2020-04-24T13:22:01+00:00'
     *
     * @param [time=now] {number}
     * @returns {string}
     */
    getW3CDateTimeUtcString: getW3CDateTimeUtcString,

    /**
     * Get hours, minutes, and sign components of a timezone offset in minutes.
     *
     * @param offsetMin {number}
     * @returns {{hours: number, minutes: number, sign: string}}
     */
    getTimeZoneOffsetComponents: getTimeZoneOffsetComponents,

    /**
     * Get a Year-Month-Date string in local time using optional custom separator.
     *
     * Using default separator, output takes the form '2020_04_24'
     *
     * @param dateTime {Date|number}
     * @param [separator='_'] {string}
     * @returns {string}
     */
    getYmdString: getYmdString,

    /**
     * Get a Year-Month-Date string in UTC time using optional custom separator.
     *
     * Using default separator, output takes the form '2020_04_24'
     *
     * @param dateTime {Date|number}
     * @param [separator='_'] {string}
     * @returns {string}
     */
    getUtcYmdString: getUtcYmdString,

    /**
     * Convert a number to string and prefix with 0's so that it is at least a minimum number of digits long.
     * Decimal places are ignored.
     *
     * @param number {string|number}
     * @param minLen {number}
     * @returns {string}
     */
    padNum: padNum,

    /**
     * Convert a number to string and prefix with 0's so that it is at least 2 digits long.
     * Decimal places are ignored.
     *
     * @param number {string|number}
     * @returns {string}
     */
    padNum2: padNum2,

    /**
     * Simple formatter for bit unit values. Finds the largest unit to display value for readability.
     *
     * @param bytes {number} The number of bytes
     * @param [decimalPlaces=2] The number of decimal places to use.
     * @returns {{number: string, units: string, toJSON(): string, toString(): string}}
     */
    formatBits: formatBits,

    /**
     * Simple formatter for byte unit values. Finds the largest unit to display value for readability.
     *
     * @param bytes {number} The number of bytes
     * @param [decimalPlaces=2] The number of decimal places to use.
     * @returns {{number: string, units: string, toJSON(): string, toString(): string}}
     */
    formatBytes: formatBytes,

    /**
     * Simple formatter for hash unit values. Finds the largest unit to display value for readability.
     *
     * @param hashes {number} The number of hashes.
     * @param [decimalPlaces=2] The number of decimal places to use.
     * @returns {{number: string, units: string, toJSON(): string, toString(): string}}
     */
    formatHashes: formatHashes,

    /**
     * Simple formatter for seconds unit values. Finds the largest unit to display value for readability.
     *
     * @param seconds {number} The number of seconds.
     * @param [decimalPlaces=2] The number of decimal places to use.
     * @returns {{number: string, units: string, toJSON(): string, toString(): string}}
     */
    formatSeconds: formatSeconds,

    /**
     * Customizable number formatter used to make large numbers more readable by using larger units.
     *
     * @param num {number} The number in the smallest unit scale.
     * @param [decimalPlaces=2] {number} The number of decimal places in the result number.
     * @param unitNamesArr {string[]} An array of unit names from smallest unit to largest unit.
     * @param divArr {number|number[]} The division of units. Can be a single number or an array of divisions for each
     * unit scale.
     * @returns {{number:string, units:string, toJSON():string, toString():string}}
     */
    formatUnits: formatUnits,

    /**
     * Replace char in string at specified index with a replacement string.
     *
     * @param str
     * @param index
     * @param replacement
     * @returns {string}
     */
    replaceCharAt: replaceCharAt,

    /**
     * Determine if a number is a power of 2.
     *
     * @param num {number}
     * @returns {boolean}
     */
    isPowerOf2: isPowerOf2,

    /**
     * Parse hex value to number.
     *
     * @param hex {string}
     * @returns {number}
     */
    parseHex: parseHex,

    /**
     * Parse hex value to BigInt.
     *
     * @param hex {string}
     * @returns {BigInt}
     */
    parseHexToBi: parseHexToBi,

    /**
     * Expand number of bytes in a big endian hex value.
     * A "0x" prefix will be stripped.
     * If the hex is larger than the specified size then the hex is returned without changing its byte size.
     *
     * @param hex {string}
     * @param size {number} The number of bytes the hex should be.
     * @returns {string}
     */
    expandHex: expandHex,

    /**
     * Get a pseudo random integer (fast random).
     *
     * @param min {number} The minimum acceptable value.
     * @param max {number} The maximum acceptable value.
     * @returns {number}
     */
    randInteger: randInteger,

    /**
     * Get a cryptographically strong random integer.
     *
     * @param min {number} The minimum acceptable value.
     * @param max {number} The maximum acceptable value.
     * @returns {number}
     */
    cryptoRandInteger: cryptoRandInteger,

    /**
     * Get a pseudo random number (fast random).
     *
     * @param min {number} The minimum acceptable value.
     * @param max {number} The maximum acceptable value.
     * @returns {number}
     */
    randNumber: randNumber,

    /**
     * Get a cryptographically strong random number.
     *
     * @param min {number} The minimum acceptable value.
     * @param max {number} The maximum acceptable value.
     * @returns {number}
     */
    cryptoRandNumber: cryptoRandNumber,

    /**
     * Generate a string of pseudo random characters (fast random).
     *
     * @param length {number} The number of characters to generate.
     * @param [chars] {string} The whitelist of valid characters. Default is BASE58_READABLE_CHARS
     *
     * @returns {string}
     */
    randChars: randChars,

    /**
     * Generate a string of cryptographically strong random characters.
     *
     * @param length {number} The number of characters to generate.
     * @param [chars] {string} The whitelist of valid characters. Default is BASE58_READABLE_CHARS
     *
     * @returns {string}
     */
    cryptoRandChars: cryptoRandChars,

    /**
     * Get an array of the local machines IPv4 addresses.
     *
     * @returns {string[]}
     */
    getIPv4Arr: getIPv4Arr,

    /**
     * Get an array of the local machines IPv6 addresses.
     *
     * @returns {string[]}
     */
    getIPv6Arr: getIPv6Arr,

    /**
     * Get local machine IP address.
     *
     * @returns {string|null}
     */
    getIPv4: getIPv4,

    /**
     * Get local machine IP address.
     *
     * @returns {string|null}
     */
    getIPv6: getIPv6
};


function each(arr, iteratorFn, callback) {
    iteratorFn = _wrapAsyncFn(iteratorFn);
    async.each(arr, iteratorFn, callback);
}


function eachSeries(arr, iteratorFn, callback) {
    iteratorFn = _wrapAsyncFn(iteratorFn);
    async.eachSeries(arr, iteratorFn, callback);
}


function eachLimit(arr, limit, iteratorFn, callback) {
    iteratorFn = _wrapAsyncFn(iteratorFn);
    async.eachLimit(arr, limit, iteratorFn, callback);
}


function parallel(fnArr, callback) {
    fnArr = fnArr.map(_wrapAsyncFn);
    async.parallel(fnArr, callback);
}


function series(fnArr, callback) {
    fnArr = fnArr.map(_wrapAsyncFn);
    async.series(fnArr, callback);
}


function some(arr, iteratorFn, callback) {
    async.some(arr, iteratorFn, callback);
}


function waterfall(fnArr, callback) {
    fnArr = fnArr.map(_wrapAsyncFn);
    async.waterfall(fnArr, callback);
}


function throwFn(message, callback) {
    precon.opt_funct(callback, 'callback');

    let error;

    if (typeof message === 'string') {
        error = new Error(message);
    }
    else if (message instanceof Error) {
        error = message;
    }
    else if (typeof message === 'object') {
        if (message.toJSON) {
            message = message.toJSON();
        }
        error = new Error(message.toString());
        Object.keys(message).forEach(key => {
            error[key] = message[key];
        });
    }
    else {
        error = new Error('unspecified error');
    }

    if (callback) {
        setImmediate(callback.bind(null, error));
    }
    else {
        throw error;
    }
}


function chunk(array, size) {
    precon.opt_array(array, 'array');
    precon.opt_number(size, 'size');

    if (!array || !array.length)
        return [];

    size = size || 1;

    let index = 0,
        resIndex = 0,
        result = Array(Math.ceil(array.length / size));

    while (index < array.length) {
        result[resIndex++] = array.slice(index, index += size);
    }

    return result;
}


function concat(...arrays) {

    for (let i = 0; i < arrays.length; i++) {
        if (!Array.isArray(arrays[i]))
            arrays[i] = Array.from(arrays[i]);
    }
    return [].concat(...arrays);
}


function difference(array, excludeArr, comparatorFn) {
    precon.array(array, 'array');
    precon.array(excludeArr, 'excludeArr');
    precon.opt_funct(comparatorFn, 'comparatorFn');

    let index = 0;
    const resultArr = [];

    if (!array.length)
        return resultArr;

    if (!comparatorFn) {
        comparatorFn = (a, b) => {
            return a === b;
        };
    }

    start:
        while (index < array.length) {

            const value = array[index];
            index++;

            let excludeIndex = excludeArr.length;
            while (excludeIndex--) {

                if (comparatorFn(excludeArr[excludeIndex], value))
                    continue start;
            }
            resultArr.push(value);
        }

    return resultArr;
}


function pushAll(targetArr, ...sourceArrs) {
    precon.array(targetArr, 'targetArray');

    sourceArrs.forEach(array => {
        targetArr.push.apply(targetArr, array);
    });

    return targetArr;
}


function toSet(...arrays) {

    const set = new Set();
    arrays.forEach(array => {

        if (!Array.isArray(array))
            array = Array.from(array);

        array.forEach(element => {
            set.add(element);
        });
    });

    return set;
}


function sortAscending(array, propOrFn) {
    precon.array(array, 'array');

    let fn = propOrFn;
    if (mu.isString(propOrFn) || mu.isNumber(propOrFn)) {
        fn = element => {
            return element[propOrFn];
        }
    }

    array.sort((a, b) => {
        const aValue = mu.isFunction(fn) ? fn(a) : a;
        const bValue = mu.isFunction(fn) ? fn(b) : b;
        if (!mu.isNumber(aValue) || !mu.isNumber(bValue)) {
            if (aValue > bValue) return 1;
            if (aValue < bValue) return -1;
            return 0;
        }
        return aValue - bValue;
    });
}


function sortDescending(array, propOrFn) {
    precon.array(array, 'array');

    let fn = propOrFn;
    if (mu.isString(propOrFn) || mu.isNumber(propOrFn)) {
        fn = element => {
            return element[propOrFn];
        }
    }

    array.sort((a, b) => {
        const aValue = mu.isFunction(fn) ? fn(a) : a;
        const bValue = mu.isFunction(fn) ? fn(b) : b;
        if (!mu.isNumber(aValue) || !mu.isNumber(bValue)) {
            if (aValue > bValue) return -1;
            if (aValue < bValue) return 1;
            return 0;
        }
        return bValue - aValue;
    });
}


function getInlineFile(str, ext, callback) {

    if (typeof callback === 'function') {

        if (typeof str !== 'string' || !str.startsWith('file:')) {
            setImmediate(callback.bind(null, null, str));
            return;
        }

        const filePath = str.slice(5);
        _readAsync(filePath, ext);

        function _readAsync(filePath, ext) {
            fs.readFile(filePath, 'utf8', (err, contents) => {
                if (err) {
                    if (ext) {
                        _readAsync(filePath + ext);
                    }
                    else {
                        callback(err, str);
                    }
                }
                else {
                    callback(null, contents);
                }
            });
        }
    }
    else {

        if (typeof str !== 'string' || !str.startsWith('file:'))
            return str;

        const filePath = str.slice(5);
        return _read(filePath, ext);

        function _read(filePath, ext) {
            let contents;
            try {
                contents = fs.readFileSync(filePath, 'utf8');
            }
            catch (err) {
                if (ext) {
                    return _read(filePath + ext);
                }
                else {
                    return str;
                }
            }
            return contents;
        }
    }
}


function inlineAllFiles(obj, callback) {
    precon.obj(obj, 'obj');
    precon.opt_funct(callback, 'callback');

    const keys = Object.keys(obj);

    if (!callback) {
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = obj[key];

            if (mu.isString(value)) {
                obj[key] = mu.getInlineFile(value);
            }
            else if (mu.isObject(value) && value.constructor === Object) {
                mu.inlineAllFiles(value);
            }
        }
        return obj;
    }
    else {
        async.each(keys, (key, eCallback) => {
            const value = obj[key];

            if (mu.isString(value)) {
                mu.getInlineFile(value, null, (err, str) => {
                    obj[key] = str;
                    eCallback();
                });
            }
            else if (mu.isObject(value) && value.constructor === Object) {
                mu.inlineAllFiles(value, eCallback);
            }
            else {
                setImmediate(eCallback);
            }
        }, () => {
            callback(null, obj);
        });
    }
}


function now() {
    return Math.floor(Date.now() / 1000);
}


function nowMs() {
    return Date.now();
}


function isTimeInMs(time) {
    precon.positiveInteger(time, 'time');

    return time > 999999999999;
}


function truncTimeMinute(time) {
    precon.opt_positiveInteger(time, 'time');

    if (!time) {
        time = mu.now();
    }
    else if (mu.isTimeInMs(time)) {
        time = Math.floor(time / 1000);
    }

    return time - (time % 60);
}


function getDayStartTime(time, offsetDays) {
    precon.opt_positiveInteger(time, 'time');
    precon.opt_integer(offsetDays, 'offsetDays');

    if (time && isTimeInMs(time))
        time = Math.floor(time / 1000);

    if (!time)
        time = now();

    return (time - (time % 86400)) + ((offsetDays || 0) * 86400);
}


function getDayEndTime(time, offsetDays) {
    precon.opt_positiveInteger(time, 'time');
    precon.opt_integer(offsetDays, 'offsetDays');

    if (time && isTimeInMs(time))
        time = Math.floor(time / 1000);

    if (!time)
        time = now();

    return (time - (time % 86400)) + 86400 + ((offsetDays || 0) * 86400);
}


function getWeekStartTime(time, weekOffset) {
    precon.opt_positiveInteger(time, 'time');
    precon.opt_integer(weekOffset, 'weekOffset');

    if (time && !isTimeInMs(time))
        time = time * 1000;

    if (!time)
        time = nowMs();

    DATE.setTime(time);

    const day = DATE.getUTCDay();

    DATE.setUTCDate(DATE.getUTCDate() - day);
    DATE.setUTCMilliseconds(0);
    DATE.setUTCSeconds(0);
    DATE.setUTCMinutes(0);
    DATE.setUTCHours(0);

    if (weekOffset)
        DATE.setUTCDate(DATE.getUTCDate() + (weekOffset * 7));

    return Math.floor(DATE.getTime() / 1000);
}


function getWeekEndTime(time, weekOffset) {
    precon.opt_positiveInteger(time, 'time');
    precon.opt_integer(weekOffset, 'weekOffset');

    if (time && !isTimeInMs(time))
        time = time * 1000;

    if (!time)
        time = nowMs();

    DATE.setTime(time);

    const day = DATE.getUTCDay();

    DATE.setUTCDate(DATE.getUTCDate() + (7 - day) + 1);
    DATE.setUTCMilliseconds(0);
    DATE.setUTCSeconds(0);
    DATE.setUTCMinutes(0);
    DATE.setUTCHours(0);

    if (weekOffset)
        DATE.setUTCDate(DATE.getUTCDate() + (weekOffset * 7));

    DATE.setUTCMilliseconds(-1);

    return Math.floor(DATE.getTime() / 1000);
}


function getMonthStartTime(time, monthOffset) {
    precon.opt_positiveInteger(time, 'time');
    precon.opt_integer(monthOffset, 'monthOffset');

    if (time && !isTimeInMs(time))
        time = time * 1000;

    if (!time)
        time = nowMs();

    DATE.setTime(time);
    DATE.setUTCMilliseconds(0);
    DATE.setUTCSeconds(0);
    DATE.setUTCMinutes(0);
    DATE.setUTCHours(0);
    DATE.setUTCDate(1);
    if (monthOffset)
        DATE.setUTCMonth(DATE.getUTCMonth() + monthOffset);

    return Math.floor(DATE.getTime() / 1000);
}


function getMonthEndTime(time, monthOffset) {
    precon.opt_positiveInteger(time, 'time');
    precon.opt_integer(monthOffset, 'monthOffset');

    if (time && !isTimeInMs(time))
        time = time * 1000;

    if (!time)
        time = nowMs();

    DATE.setTime(time);
    DATE.setUTCMilliseconds(0);
    DATE.setUTCSeconds(0);
    DATE.setUTCMinutes(0);
    DATE.setUTCHours(0);
    DATE.setUTCDate(1);
    DATE.setUTCMonth(DATE.getUTCMonth() + 1 + (monthOffset || 0));
    DATE.setUTCMilliseconds(-1);

    return Math.floor(DATE.getTime() / 1000);
}


function getW3CDateString(time) {
    precon.opt_positiveInteger(time, 'time');

    if (time && !isTimeInMs(time))
        time = time * 1000;

    if (!time)
        time = nowMs();

    DATE.setTime(time);

    const month = padNum2(DATE.getMonth() + 1);
    const date = padNum2(DATE.getDate());

    return `${DATE.getFullYear()}-${month}-${date}`;
}


function getW3CDateUtcString(time) {
    precon.opt_positiveInteger(time, 'time');

    if (time && !isTimeInMs(time))
        time = time * 1000;

    if (!time)
        time = nowMs();

    DATE.setTime(time);

    const month = padNum2(DATE.getUTCMonth() + 1);
    const date = padNum2(DATE.getUTCDate());

    return `${DATE.getUTCFullYear()}-${month}-${date}`;
}


function getW3CDateTimeString(time) {
    precon.opt_positiveInteger(time, 'time');

    if (time && !mu.isTimeInMs(time))
        time = time * 1000;

    if (!time)
        time = nowMs();

    DATE.setTime(time);

    const month = padNum2(DATE.getMonth() + 1);
    const date = padNum2(DATE.getDate());
    const hours = padNum2(DATE.getHours());
    const minutes = padNum2(DATE.getMinutes());
    const seconds = padNum2(DATE.getSeconds());
    const offset = getTimeZoneOffsetComponents(DATE.getTimezoneOffset());
    const offsetHours = padNum2(offset.hours);
    const offsetMins = padNum2(offset.minutes);

    return `${DATE.getFullYear()}-${month}-${date}T${hours}:${minutes}:${seconds}${offset.sign}${offsetHours}:${offsetMins}`;
}


function getW3CDateTimeUtcString(time) {
    precon.opt_positiveInteger(time, 'time');

    if (time && !isTimeInMs(time))
        time = time * 1000;

    if (!time)
        time = nowMs();

    DATE.setTime(time);

    const month = padNum2(DATE.getUTCMonth() + 1);
    const date = padNum2(DATE.getUTCDate());
    const hours = padNum2(DATE.getUTCHours());
    const minutes = padNum2(DATE.getUTCMinutes());
    const seconds = padNum2(DATE.getUTCSeconds());

    return `${DATE.getUTCFullYear()}-${month}-${date}T${hours}:${minutes}:${seconds}+0:00`;
}


function getTimeZoneOffsetComponents(offsetMin) {
    const hours = Math.floor(Math.abs(offsetMin) / 60);
    const minutes = Math.floor((Math.abs(offsetMin) % (hours * 60)));
    return {
        hours: hours,
        minutes: minutes,
        sign: offsetMin < 0 ? '-' : '+'
    };
}


function getYmdString(dateTime, separator) {

    if (!mu.isString(separator))
        separator = '_';

    let date;
    if (dateTime instanceof Date) {
        date = dateTime;
    }
    else if (mu.isNumber(dateTime)) {
        if (mu.isTimeInMs(dateTime)) {
            date = new Date(dateTime);
        }
        else {
            date = new Date(dateTime * 1000)
        }
    }
    else {
        date = new Date();
    }

    return (date.year || date.getFullYear()) + separator
        + padNum2((mu.isDefined(date.month) ? date.month : date.getMonth()) + 1) + separator
        + padNum2(date.date || date.getDate());
}


function getUtcYmdString(dateTime, separator) {
    precon.opt_string(separator, 'separator');

    if (!mu.isString(separator))
        separator = '_';

    let date;
    if (dateTime instanceof Date) {
        date = dateTime;
    }
    else if (mu.isNumber(dateTime)) {
        if (mu.isTimeInMs(dateTime)) {
            date = new Date(dateTime);
        }
        else {
            date = new Date(dateTime * 1000)
        }
    }
    else {
        date = new Date();
    }

    return (date.year || date.getUTCFullYear()) + separator
        + padNum2((mu.isDefined(date.month) ? date.month : date.getUTCMonth()) + 1) + separator
        + padNum2(date.date || date.getUTCDate());
}


function padNum(number, minLen) {
    precon.positiveInteger(minLen, 'minLen');

    const parsed = parseInt(number);
    if (isNaN(parsed))
        return 'NaN';

    let asString = parsed.toString();
    let result = number.toString();

    const padLen = minLen - asString.length;
    if (padLen <= 0)
        return result;

    return '0'.repeat(padLen) + result;
}


function padNum2(number) {
    return parseFloat(number) < 10 ? `0${number}` : number.toString();
}


function formatBits(bytes, decimalPlaces) {
    return formatUnits(bytes * 8, decimalPlaces, BIT_UNITS, 1024);
}


function formatBytes(bytes, decimalPlaces) {
    return formatUnits(bytes, decimalPlaces, BYTE_UNITS, 1024);
}


function formatHashes(hashes, decimalPlaces) {
    return formatUnits(hashes, decimalPlaces, HASH_UNITS, 1000);
}


function formatSeconds(seconds, decimalPlaces) {
    return formatUnits(seconds, decimalPlaces, TIME_UNITS, 60);
}


function formatUnits(num, decimalPlaces, unitNamesArr, divArr) {
    precon.integer(num, 'seconds');
    precon.opt_positiveInteger(decimalPlaces, 'decimalPlaces');
    precon.arrayOf(unitNamesArr, 'string', 'unitNamesArr');

    if (mu.isNumber(divArr))
        divArr = unitNamesArr.map(() => divArr);

    precon.arrayOf(divArr, 'number', 'divArr');

    if (!mu.isNumber(decimalPlaces))
        decimalPlaces = 2;

    let i = 0;

    while (i < unitNamesArr.length - 1 && num >= divArr[i]) {
        num = num / divArr[i];
        i++;
    }

    const number = num.toFixed(decimalPlaces);
    const units = unitNamesArr[i];
    const str = `${number} ${units}`;

    return {
        number: number,
        units: units,
        toString() { return str },
        toJSON() { return str }
    };
}


function replaceCharAt(str, index, replacement) {
    precon.string(str, 'str');
    precon.positiveInteger(index, 'index');
    precon.string(replacement, 'replacement');

    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}


function isPowerOf2(num) {
    const bi = BigInt(num);
    if (bi === 0n)
        return false;

    return Number(bi & (bi - 1n)) === 0;
}


function parseHex(hex) {
    precon.string(hex, 'hex');

    if (hex.startsWith('0x'))
        hex = hex.substr(2);

    return parseInt(hex, 16);
}


function parseHexToBi(hex) {
    precon.string(hex, 'hex');

    if (!hex.startsWith('0x'))
        hex = `0x${hex}`;

    return BigInt(hex);
}


function expandHex(hex, size) {
    precon.string(hex, 'hex');
    precon.positiveInteger(size, 'size');

    if (hex.startsWith('0x'))
        hex = hex.substr(2);

    const charLen = size * 2;
    const padLen = charLen - hex.length;

    if (padLen <= 0)
        return hex;

    return '0'.repeat(padLen) + hex;
}


function randInteger(min, max) {
    precon.integer(min, 'min');
    precon.integer(max, 'max');

    return min + Math.round(Math.random() * (max - min))
}


function cryptoRandInteger(min, max) {
    precon.integer(min, 'min');
    precon.integer(max, 'max');

    return min + Math.round((crypto.randomBytes(1)[0] / 256) * (max - min))
}


function randNumber(min, max) {
    precon.number(min, 'min');
    precon.number(max, 'max');

    return min + Math.random() * (max - min);
}


function cryptoRandNumber(min, max) {
    precon.number(min, 'min');
    precon.number(max, 'max');

    return min + (crypto.randomBytes(1)[0] / 256) * (max - min);
}


function randChars(length, chars) {
    precon.positiveInteger(length, 'length');
    precon.opt_string(chars, 'chars');

    let result = '';
    chars = chars || mu.BASE58_READABLE_CHARS;
    for (let i = length; i > 0; --i) {
        const randIndex = Math.floor(Math.random() * chars.length);
        result += chars[randIndex];
    }
    return result;
}


function cryptoRandChars(length, chars) {
    precon.positiveInteger(length, 'length');
    precon.opt_string(chars, 'chars');

    let result = '';
    chars = chars || mu.BASE58_READABLE_CHARS;
    for (let i = length; i > 0; --i) {
        const randIndex = Math.floor(crypto.randomBytes(1)[0] / 256 * chars.length);
        result += chars[randIndex];
    }
    return result;
}


function getIPv4Arr() {
    const interfaces = os.networkInterfaces();
    const ipv4Arr = [];

    Object.keys(interfaces).forEach(adapterName => {

        const array = interfaces[adapterName];
        array.forEach(entry => {

            if (entry.internal)
                return; //continue;

            if (entry.family === 'IPv4')
                ipv4Arr.push(entry.address);
        });
    });

    return ipv4Arr;
}


function getIPv6Arr() {
    const interfaces = os.networkInterfaces();
    const ipv6Arr = [];

    Object.keys(interfaces).forEach(adapterName => {

        const array = interfaces[adapterName];
        array.forEach(entry => {

            if (entry.internal)
                return; //continue;

            if (entry.family === 'IPv6')
                ipv6Arr.push(entry.address);
        });
    });

    return ipv6Arr;
}


function getIPv4() {

    const ifaces = os.networkInterfaces();

    for (const adapterName in ifaces) {

        const adapter = ifaces[adapterName];
        for (let i = 0, iface; (iface = adapter[i]); i++) {

            if (iface.family !== 'IPv4' || iface.internal)
                continue;

            return iface.address;
        }
    }

    return null;
}


function getIPv6() {

    const ifaces = os.networkInterfaces();

    for (const adapterName in ifaces) {

        const adapter = ifaces[adapterName];
        for (let i = 0, iface; (iface = adapter[i]); i++) {

            if (iface.family !== 'IPv6' || iface.internal)
                continue;

            return iface.address;
        }
    }

    return null;
}


function _wrapAsyncFn(fn) {
    return (...args) => {
        try {
            fn(...args);
        }
        catch(err) {
            args[args.length - 1](err);
        }
    };
}