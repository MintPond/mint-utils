'use strict';

const precon = require('@mintpond/mint-precon');


class AdaptiveConfigValue {

    /**
     * Constructor.
     *
     * @param propertyValue
     * @param propertyValue.value {*}
     */
    constructor(propertyValue) {
        precon.obj(propertyValue, 'config');
        precon.defined(propertyValue.value, 'config.value');

        const _ = this;
        _._value = propertyValue.value;
        _._constraintsOMap = {};
        _._paramNamesArr = [];

        Object.keys(propertyValue).forEach(constraintName => {

            if (constraintName === 'value')
                return; // continue

            const baseName1 = constraintName.substr(3, 1).toLowerCase() + constraintName.substr(4);
            const baseName2 = constraintName.substr(3, 1).toUpperCase() + constraintName.substr(4);

            let constraints = _._constraintsOMap[baseName1] || _._constraintsOMap[baseName2];
            if (!constraints) {
                constraints = {};
                _._constraintsOMap[baseName1] = constraints;
                _._constraintsOMap[baseName2] = constraints;
                _._paramNamesArr.push(baseName1, baseName2);
            }

            if (constraintName.startsWith('min')) {
                constraints.min = propertyValue[constraintName];

                if (typeof constraints.min !== 'number')
                    throw new Error('"min" constraint must be a number');
            }
            else if (constraintName.startsWith('max')) {
                constraints.max = propertyValue[constraintName];

                if (typeof constraints.max !== 'number')
                    throw new Error('"max" constraint must be a number');
            }
            else if (constraintName.startsWith('val')) {
                constraints.val = propertyValue[constraintName];
            }
            else {
                throw new Error(`Invalid constraint prefix: ${constraintName.substr(0, 3)}`)
            }
        });
    }


    /**
     * Get the value
     * @returns {*}
     */
    get value() { return this._value; }


    /**
     * Determine if this property value is an active candidate.
     *
     * @param paramsOMap {object} An object map of parameter values.
     * @param [isStrictCompliance=false] When true, this value is only an active candidate if it can satisfy all
     * specified parameters. If a constraint is not specified for a parameter then it cannot be active.
     * When false, the property value is not required to have constraints for a supplied parameter.
     * @returns {boolean} True if parameters satisfy constraints, otherwise false.
     */
    isActive(paramsOMap, isStrictCompliance) {
        precon.obj(paramsOMap, 'paramsOMap');
        precon.opt_boolean(isStrictCompliance, 'isStrictCompliance');

        const _ = this;
        for (let i = 0; i < _._paramNamesArr.length; i += 2) {

            let paramName = _._paramNamesArr[i];

            if (!(paramName in paramsOMap)) {

                paramName = _._paramNamesArr[i + 1]

                if (!(paramName in paramsOMap)) {

                    if (isStrictCompliance)
                        return false;

                    continue;
                }
            }

            const constraints = _._constraintsOMap[paramName];
            const value = paramsOMap[paramName];

            if (typeof value === 'number') {

                if ('min' in constraints && value < constraints.min)
                    return false;

                if ('max' in constraints && value > constraints.max)
                    return false;
            }
            else if (isStrictCompliance) {

                if ('min' in constraints)
                    return false;

                if ('max' in constraints)
                    return false;
            }

            if ('val' in constraints && value !== constraints.val)
                return false;
        }

        return true;
    }
}

module.exports = AdaptiveConfigValue;