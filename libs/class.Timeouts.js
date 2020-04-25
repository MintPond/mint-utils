'use strict';

const
    async = require('async'),
    precon = require('@mintpond/mint-precon'),
    pu = require('./service.prototypes');


/**
 * Timeout function manager.
 */
class Timeouts {

    /**
     * Constructor.
     *
     * @param [maxStack] {number} The maximum number of functions that can be executed in a single named
     * timeout operation. Omit or set value to 0 to allow infinite functions.
     */
    constructor(maxStack) {
        precon.opt_positiveInteger(maxStack, 'maxStack');

        const _ = this;
        _._maxStack = maxStack || 0;

        _._map = new Map();
    }


    /**
     * Stop and clear all timeout operations.
     */
    stopAll() {
        const _ = this;
        for (const entry of _._map.values()) {
            clearTimeout(entry.handle);
        }
        _._map.clear();
    }


    /**
     * Stop and clear a timeout by name.
     *
     * @param name {string}
     */
    stop(name) {
        precon.string(name, 'name')
        const _ = this;

        const entry = _._map.get(name);
        if (entry) {
            clearTimeout(entry.handle);
            _._map.delete(name);
        }
    }


    /**
     * Set or add a timeout function to an existing timeout operation. Existing timer is not reset.
     *
     * Multiple timeout functions for the same operation will be executed in series once the timer ends.
     * Async function will be passed a function argument which must be called before the next timeout function
     * in the series can be called.
     *
     * @param name {string} - Unique ID of the timeout operation.
     * @param fn {function(done:function())} - The function to execute.
     * @param delayMs {number} - The amount of time to delay the function execution.
     */
    addAsync(name, fn, delayMs) {
        precon.string(name, 'name')
        precon.funct(fn, 'fn');
        precon.positiveInteger(delayMs, 'delayMs');

        const _ = this;
        fn._isAsyncTimeout = true;
        _.add(name, fn, delayMs);
    }


    /**
     * Set or add a timeout function to an existing timeout operation. Existing timer is not reset.
     *
     * @param name {string} - Unique ID of the timeout operation.
     * @param fn {function()} - The function to execute.
     * @param delayMs {number} - The amount of time to delay the function execution.
     */
    add(name, fn, delayMs) {
        precon.string(name, 'name')
        precon.funct(fn, 'fn');
        precon.positiveInteger(delayMs, 'delayMs');

        const _ = this;

        let entry = _._map.get(name);
        if (entry) {
            _._pushStack(entry.stack, fn);
        }
        else {
            entry = {
                name: name,
                stack: [fn],
                handle: null
            };
            _._map.set(name, entry);

            entry.handle = setTimeout(() => {
                _._map.delete(name);
                _._execute(entry.stack);
            }, delayMs);
        }
    }


    /**
     * Set or replace an existing timeout operation.
     *
     * Multiple timeout functions for the same operation will be executed in series once the timer ends.
     * Async function will be passed a function argument which must be called before the next timeout function
     * in the series can be called.
     *
     * @param name {string} - Unique ID of the timeout operation.
     * @param fn {function(done:function())} - The function to execute.
     * @param delayMs {number} - The amount of time to delay the function execution.
     */
    setAsync(name, fn, delayMs) {
        precon.string(name, 'name')
        precon.funct(fn, 'fn');
        precon.positiveInteger(delayMs, 'delayMs');

        const _ = this;
        fn._isAsyncTimeout = true;
        _.set(name, fn, delayMs);
    }


    /**
     * Set or replace an existing timeout operation.
     *
     * @param name {string} - Unique ID of the timeout operation.
     * @param fn {function()} - The function to execute.
     * @param delayMs {number} - The amount of time to delay the function execution.
     */
    set(name, fn, delayMs) {
        precon.string(name, 'name')
        precon.funct(fn, 'fn');
        precon.positiveInteger(delayMs, 'delayMs');

        const _ = this;

        let entry = _._map.get(name);
        if (!entry) {
            entry = {
                name: name,
                stack: [fn],
                handle: null
            };
            _._map.set(name, entry);
        }
        else {
            entry.stack.length = 0;
            _._pushStack(entry.stack, fn);
            clearTimeout(entry.handle);
        }

        entry.handle = setTimeout(() => {
            _._map.delete(name);
            _._execute(entry.stack);
        }, delayMs);
    }


    /**
     * Create a new timeout operation or add function to an existing timeout operation and reset time.
     *
     * Multiple timeout functions for the same operation will be executed in series once the timer ends.
     * Async function will be passed a function argument which must be called before the next timeout function
     * in the series can be called.
     *
     * @param name {string} - Unique ID of the timeout operation.
     * @param fn {function(done:function())} - The function to execute.
     * @param delayMs {number} - The amount of time to delay the function execution.
     */
    stackAsync(name, fn, delayMs) {
        precon.string(name, 'name')
        precon.funct(fn, 'fn');
        precon.positiveInteger(delayMs, 'delayMs');

        const _ = this;
        fn._isAsyncTimeout = true;
        _.stack(name, fn, delayMs);
    }


    /**
     * Create a new timeout operation or add function to an existing timeout operation and reset time.
     *
     * @param name {string} - Unique ID of the timeout operation.
     * @param fn {function()} - The function to execute.
     * @param delayMs {number} - The amount of time to delay the function execution.
     */
    stack(name, fn, delayMs) {
        precon.string(name, 'name')
        precon.funct(fn, 'fn');
        precon.positiveInteger(delayMs, 'delayMs');

        const _ = this;

        let entry = _._map.get(name);
        if (entry) {
            _._pushStack(entry.stack, fn);
        }
        else {
            entry = {
                name: name,
                stack: [fn],
                handle: null
            };
            _._map.set(name, entry);
        }

        entry.handle = setTimeout(() => {
            _._map.delete(name);
            _._execute(entry.stack);
        }, delayMs);
    }


    _execute(stack) {

        if (stack.length === 1) {
            const fn = stack[0];
            fn._isAsyncTimeout ? fn(function () {}) : fn();
            return;
        }

        async.eachSeries(stack, (fn, eCallback) => {

            if (!fn._isAsyncTimeout) {
                setImmediate(() => {
                    fn();
                    eCallback();
                });
            }
            else {
                fn(eCallback);
            }
        });
    }


    _pushStack(stack, fn) {
        const _ = this;

        stack.push(fn);

        if (_._maxStack && stack.length > _._maxStack)
            stack.shift();
    }


    static [Symbol.hasInstance](obj) {
        return pu.isInstanceOfByName(obj, 'Timeouts') &&
            pu.isFunction(obj.stopAll) &&
            pu.isFunction(obj.stop) &&
            pu.isFunction(obj.addAsync) &&
            pu.isFunction(obj.add) &&
            pu.isFunction(obj.setAsync) &&
            pu.isFunction(obj.set) &&
            pu.isFunction(obj.stackAsync) &&
            pu.isFunction(obj.stack);
    }
}

module.exports = Timeouts;