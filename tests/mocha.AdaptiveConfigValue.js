'use strict';

const
    assert = require('assert'),
    AdaptiveConfigValue = require('./../libs/class.AdaptiveConfigValue');

describe('AdaptiveConfigValue', () => {

    it('should retain value property in config as the value', () => {
        const configVal = new AdaptiveConfigValue({ value: 'abc' });
        assert.strictEqual(configVal.value, 'abc');
    });

    it('should strip "min" prefix from constraint name', () => {
        const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 10 });
        assert.strictEqual('paramValue' in configVal._constraintsOMap, true);
    });

    it('should strip "max" prefix from constraint name', () => {
        const configVal = new AdaptiveConfigValue({ value: 'abc', maxParamValue: 10 });
        assert.strictEqual('paramValue' in configVal._constraintsOMap, true);
    });

    it('should strip "val" prefix from constraint name', () => {
        const configVal = new AdaptiveConfigValue({ value: 'abc', valParamValue: 10 });
        assert.strictEqual('paramValue' in configVal._constraintsOMap, true);
    });

    describe('isActive function', () => {

        it('should return false if "val" constraint is NOT equal to the matching parameter', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', valParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 11 }), false);
            assert.strictEqual(configVal.isActive({ paramValue: 11 }), false);
        });

        it('should return true if "val" constraint is equal to the matching parameter', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', valParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 10 }), true);
            assert.strictEqual(configVal.isActive({ paramValue: 10 }), true);
        });

        it('should return false if "min" constraint is more than matching parameter', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 5 }), false);
            assert.strictEqual(configVal.isActive({ paramValue: 5 }), false);
        });

        it('should return true if "min" constraint is less than matching parameter', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 15 }), true);
            assert.strictEqual(configVal.isActive({ paramValue: 15 }), true);
        });

        it('should return true if "min" constraint is equal to matching parameter', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 10 }), true);
            assert.strictEqual(configVal.isActive({ paramValue: 10 }), true);
        });

        it('should return false if "max" constraint is less than matching parameter', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', maxParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 15 }), false);
            assert.strictEqual(configVal.isActive({ paramValue: 15 }), false);
        });

        it('should return true if "max" constraint is greater than matching parameter', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', maxParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 5 }), true);
            assert.strictEqual(configVal.isActive({ paramValue: 5 }), true);
        });

        it('should return true if "max" constraint is equal to matching parameter', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', maxParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 10 }), true);
            assert.strictEqual(configVal.isActive({ paramValue: 10 }), true);
        });

        it('should return true if parameter is within "min" and "max" constraints', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 5, maxParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 7 }), true);
            assert.strictEqual(configVal.isActive({ paramValue: 7 }), true);
        });

        it('should return false if parameter is less than "min" and "max" constraints', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 5, maxParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 4 }), false);
            assert.strictEqual(configVal.isActive({ paramValue: 4 }), false);
        });

        it('should return false if parameter is greater than "min" and "max" constraints', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 5, maxParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 12 }), false);
            assert.strictEqual(configVal.isActive({ paramValue: 12 }), false);
        });

        it('should return false if any parameter is not within constraint', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 5, maxParamValue: 10, minParam2Value: 12 });
            assert.strictEqual(configVal.isActive({ ParamValue: 7, Param2Value: 9 }), false);
            assert.strictEqual(configVal.isActive({ paramValue: 7, param2Value: 9 }), false);
        });

        it('should return true if all parameters are within constraints', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 5, maxParamValue: 10, minParam2Value: 12 });
            assert.strictEqual(configVal.isActive({ ParamValue: 7, Param2Value: 15 }), true);
            assert.strictEqual(configVal.isActive({ paramValue: 7, param2Value: 15 }), true);
        });

        it('should return true if there is no parameter value for a constraint', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 5, maxParamValue: 10, minParam2Value: 12 });
            assert.strictEqual(configVal.isActive({ ParamValue: 7 }), true);
            assert.strictEqual(configVal.isActive({ paramValue: 7 }), true);
        });

        it('should return false if there is no parameter value for a constraint when compliance is strict', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 5, maxParamValue: 10, minParam2Value: 12 });
            assert.strictEqual(configVal.isActive({ ParamValue: 7 }, true/*isStrictCompliance*/), false);
            assert.strictEqual(configVal.isActive({ paramValue: 7 }, true/*isStrictCompliance*/), false);
        });

        it('should return true if the parameter value is not compatible with a constraint', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 5, maxParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 'string' }), true);
            assert.strictEqual(configVal.isActive({ paramValue: 'string' }), true);
        });

        it('should return false if the parameter value is not compatible with a constraint when compliance is strict', () => {
            const configVal = new AdaptiveConfigValue({ value: 'abc', minParamValue: 5, maxParamValue: 10 });
            assert.strictEqual(configVal.isActive({ ParamValue: 'string' }, true/*isStrictCompliance*/), false);
            assert.strictEqual(configVal.isActive({ paramValue: 'string' }, true/*isStrictCompliance*/), false);
        });
    });
});
