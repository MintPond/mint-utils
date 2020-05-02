'use strict';

const precon = require('@mintpond/mint-precon');


module.exports = {

    /**
     * Determine if an object is a function.
     *
     * Note: This is a duplicate of the isFunction function in the index script. The purpose of this duplicate is so
     * that isFunction can be used internally without creating a circular reference where Classes require the index
     * script and the index script requires the Classes for external usage.
     *
     * @param obj {function}
     * @returns {boolean}
     */
    isFunction: isFunction,

    /**
     * Determine if an objects prototype contains all of the specified getter properties. If any of the specified
     * properties are not found then the function will return false.
     *
     * @param obj {*}
     * @param propNames {...string} Names of the properties to check for.
     * @returns {boolean}
     */
    hasGetters: hasGetters,

    /**
     * Determine if an objects prototype contains all of the specified setter properties. If any of the specified
     * properties are not found then the function will return false.
     *
     * @param obj {*}
     * @param propNames {...string} Names of the properties to check for.
     * @returns {boolean}
     */
    hasSetters: hasSetters,

    /**
     * Determine if an object is an instance of a Class by looking at the name of the constructor as well as the
     * name of any parent prototype constructors.
     *
     * @param obj {*}
     * @param name {string}
     * @returns {boolean}
     */
    isInstanceOfByName: isInstanceOfByName,


    /**
     * Determine if an object is an instance of a Class by looking at the value of the static CLASS_ID property in
     * the class itself as well as any parent prototypes.
     *
     * @param obj {*}
     * @param id {string} Expected CLASS_ID value
     * @returns {boolean}
     */
    isInstanceOfById: isInstanceOfById
}


function isFunction(obj) {
    return typeof obj === 'function';
}


function hasGetters(obj, ...propNames) {
    return _hasGetterSetter(obj, 'get', ...propNames);
}


function hasSetters(obj, ...propNames) {
    return _hasGetterSetter(obj, 'set', ...propNames);
}


function isInstanceOfByName(obj, name) {
    precon.string(name, 'name');

    if (!obj || typeof obj !== 'object')
        return false;

    let constructor = obj.constructor;

    while (constructor) {
        if (constructor.name === name)
            return true;

        const prototype = Object.getPrototypeOf(constructor.prototype);
        if (!prototype)
            return false;

        constructor = prototype.constructor;
    }

    return false;
}


function _hasGetterSetter(obj, descrPropName, ...propNames) {

    let i = 0;

    start:
    for (; i < propNames.length; i++) {

        let constructor = obj.constructor;

        while (constructor) {

            const descr = Object.getOwnPropertyDescriptor(constructor.prototype, propNames[i]);
            if (descr && typeof descr[descrPropName] === 'function')
                continue start;

            const prototype = Object.getPrototypeOf(constructor.prototype);
            if (!prototype)
                return false;

            constructor = prototype.constructor;
        }

        return false;
    }
    return true;
}


function isInstanceOfById(obj, id) {

    if (!obj || typeof obj !== 'object')
        return false;

    let constructor = obj.constructor;

    while (constructor) {
        if (constructor.CLASS_ID === id)
            return true;

        const prototype = Object.getPrototypeOf(constructor.prototype);
        if (!prototype)
            return false;

        constructor = prototype.constructor;
    }

    return false;
}