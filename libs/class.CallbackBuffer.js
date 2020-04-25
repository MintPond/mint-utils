'use strict';

const
    precon = require('@mintpond/mint-precon'),
    pu = require('./service.prototypes');


/**
 * The purpose of this class is to prevent an async operation from running more than once using the same parameters
 * if the operation is requested again while the operation is already currently running.
 *
 * Additional callbacks from requested operations are buffered so that when the first operation completes, the
 * buffered callbacks will also receive the result.
 *
 * Callbacks are called in the order they are added.
 */
class CallbackBuffer {

    /**
     * Constructor.
     */
    constructor() {
        const _ = this;
        _._callbackMap = new Map();
    }

    
    /**
     * Add a callback to a job key. The return value indicates if execution should continue to perform the job or
     * return due to the job already being in progress.
     *
     * @param key {string} The job key.
     * @param [callback] {function} The callback to call when the job is complete. Arguments are whatever is
     *                              passed when called.
     * @returns {boolean}  True if execution should continue and perform the job. False if the job is already being
     * run and should not be started again.
     */
    addCallback(key, callback) {
        precon.string(key, 'key');
        precon.opt_funct(callback, 'callback');

        const _ = this;

        let callbackArr = _._callbackMap.get(key);
        if (!callbackArr) {
            callbackArr = [];
            _._callbackMap.set(key, callbackArr);
        }

        callbackArr.push(callback);

        return callbackArr.length <= 1/* shouldContinue */;
    }


    /**
     * Call when a job is completed to pass result arguments to buffered callbacks.
     *
     * Job and buffered callbacks are cleared after execution.
     *
     * @param key {string} The job key of the job that is completed.
     * @param args {*} Arguments to pass to the callbacks.
     */
    callback(key, ...args) {
        precon.string(key, 'key');

        const _ = this;
        const callbackArr = _._callbackMap.get(key);
        if (!callbackArr)
            throw new Error(`Unrecognized key: ${key}`);

        const cbArr = callbackArr.slice(0);
        callbackArr.length = 0;
        _._callbackMap.delete(key);

        cbArr.forEach(cb => {
            cb && cb(...args);
        });
    }


    static [Symbol.hasInstance](obj) {
        return pu.isInstanceOfByName(obj, 'CallbackBuffer') &&
            pu.isFunction(obj.addCallback) &&
            pu.isFunction(obj.callback);
    }
}

module.exports = CallbackBuffer;