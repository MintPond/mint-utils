'use strict';

const
    precon = require('@mintpond/mint-precon'),
    AdaptiveConfigValue = require('./class.AdaptiveConfigValue'),
    pu = require('./service.prototypes');


/**
 * This is a helper wrapper for a configuration that can specify different values for the same property depending on
 * current parameters.
 *
 * __Terminology__
 * - _Property_ - Represents the context of a value in the configuration.
 * - _Property Value_ - One of possibly many values that are assigned to a Property in the configuration.
 * - _Parameter_ - An external value that may affect which Property Values are returned.
 * - _Constraint_ - A constraint on a Parameter that must be satisfied for a Property Value to be an
 * Active Candidate.
 * - _Active Candidate_ - A Property value that is eligible to be returned via "getValue" function due to its
 * constraints being satisfied by the current Parameters.
 *
 * A configuration, passed in through the constructor, should look similar to the following:
 *
 * ```javascript
 * const config = {
 *
 *     staticValue: 'abc', // The property "staticValue" will always return the same value
 *
 *     adaptValue: [ // The property "adaptValue" will return the first value whose constraints are satisfied.
 *         { value: 'abc', minCount: 0, maxCount: 10 }, // "minCount" and "maxCount" are constraints of "Count" parameter.
 *         { value: 'def', minCount: 11, maxCount: 20 },
 *         { value: 'ghi', minCount: 21, maxCount: 30 },
 *         { value: 'jkl', minCount: 31 }
 *     ]
 * };
 *
 * const adaptConfig = new AdaptiveConfig(config);
 * const value = adaptConfig.getValue('adaptValue', { Count: 12 }); // returns 'def'
 * ```
 *
 * There are specific rules for the the property names within the adaptive value object:
 * - The object must have a "value" property containing the value. This is the only required property.
 * - All other properties in the object specify constraints and must have one of 3 prefixes: "min", "max", and "val".
 * - "min" and "max" constraints must have number values.
 * - If you use "min" or "max" constraints, the "value" type must also be a number.
 * - "val" constraints can be any type so long as it can be strict equality compared (===).
 * - You can use more than 1 parameter for constraints (eg "Count" and "Time")
 *
 * The "Count" parameter can also be specified as "count". The first character of the parameter name is
 * not case sensitive. Avoid using similar named parameters where case sensitivity is required on the
 * first character to distinguish them.
 *
 */
class AdaptiveConfig {

    /**
     * Constructor.
     *
     * @param config {object} Object map of configuration values.
     */
    constructor(config) {
        const _ = this;
        _._config = {};
        _._paramsOMap = {};
        _._valuesOMap = {};

        Object.keys(config).forEach(propertyName => {

            const raw = config[propertyName];
            if (!Array.isArray(raw)) {
                _._config[propertyName] = raw;
                return; // continue
            }

            _._config[propertyName] = [];

            raw.forEach(constrained => {
                _._config[propertyName].push(new AdaptiveConfigValue(constrained));
            });
        });
    }


    /**
     * Get config value.
     *
     * @param propertyName {string} The name of the configuration property.
     * @param [paramsOMap] {object} An object map of parameter values.
     * @param [isStrictCompliance=false] {boolean} When true, a property value is only an active candidate if it can
     * satisfy all specified parameters. If a constraint is not specified for a parameter then it cannot be active.
     * When false, a property value is not required to have constraints for a supplied parameter.
     */
    getValue(propertyName, paramsOMap, isStrictCompliance) {
        precon.string(propertyName, 'propertyName');
        precon.opt_obj(paramsOMap, 'paramsOMap');
        precon.opt_boolean(isStrictCompliance, 'isStrictCompliance');

        const _ = this;

        if (propertyName in _._valuesOMap)
            return _._valuesOMap[propertyName];

        const entry = _._config[propertyName];
        if (Array.isArray(entry)) {

            const activeParamsOMap = paramsOMap
                ? { ..._._paramsOMap, ...paramsOMap }
                : _._paramsOMap

            for (let i = 0; i < entry.length; i++) {
                if (entry[i].isActive(activeParamsOMap, isStrictCompliance)) {
                    return entry[i].value;
                }
            }

            return undefined;
        }
        else {
            return entry;
        }
    }


    /**
     * Set a value to override adaptive config. The value will be returned as a static value regardless of specified
     * parameters.
     *
     * @param propertyName {string} The name of the configuration property.
     * @param value {*} Any value besides undefined.
     */
    setValue(propertyName, value) {
        precon.string(propertyName, 'propertyName');
        precon.defined(value, 'value');

        const _ = this;
        _._valuesOMap[propertyName] = value;
    }


    /**
     * Clear a set value and return to using adaptive config if available.
     *
     * @param propertyName {string} The name of the configuration property.
     */
    clearValue(propertyName) {
        precon.string(propertyName, 'propertyName');

        const _ = this;
        delete _._valuesOMap[propertyName];
    }


    /**
     * Set a default parameter value for use when one is not specified.
     *
     * @param paramName {string} The name of the parameter.
     * @param value {*} Any value besides undefined.
     */
    setParam(paramName, value) {
        precon.string(paramName, 'paramName');
        precon.defined(value, 'value');

        const _ = this;
        _._paramsOMap[paramName] = value;
    }


    /**
     * Clear default parameter value.
     *
     * @param paramName {string} The name of the parameter.
     */
    clearParam(paramName) {
        precon.string(paramName, 'constraintName');

        const _ = this;
        delete _._paramsOMap[paramName];
    }


    static [Symbol.hasInstance](obj) {
        return pu.isInstanceOfByName(obj, 'AdaptiveConfig') &&
            pu.isFunction(obj.getValue) &&
            pu.isFunction(obj.setValue) &&
            pu.isFunction(obj.clearValue) &&
            pu.isFunction(obj.setParam) &&
            pu.isFunction(obj.clearParam);
    }
}

module.exports = AdaptiveConfig;