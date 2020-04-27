'use strict';

const
    assert = require('assert'),
    MUAdaptiveConfig = require('./../libs/class.AdaptiveConfig');

let adaptiveConfig = null;


describe('AdaptiveConfig', () => {

    function globalBe() {

        adaptiveConfig = new MUAdaptiveConfig({

            staticStringVal: 'string',
            staticNumVal: 0,

            adaptStringVal: [
                { value: 'string1', valParamValue: 1 },
                { value: 'string2', valParamValue: 1 },
                { value: 'string3', valParamValue: 'abc' }
            ],

            adaptNumVal: [
                { value: 0, minPV1: 0, maxPV1: 2, minPV2: 20, maxPV2: 29 },
                { value: 1, minPV1: 3, maxPV1: 5, maxPV2: 29 },
                { value: 2, minPV1: 3, maxPV1: 5 },
                { value: 3 }
            ]
        });
    }


    describe('getValue function', () => {
        beforeEach(globalBe);

        it('should return static values', () => {
            assert.strictEqual(adaptiveConfig.getValue('staticStringVal'), 'string');
            assert.strictEqual(adaptiveConfig.getValue('staticStringVal', { ParamValue: 1 }), 'string');
            assert.strictEqual(adaptiveConfig.getValue('staticNumVal'), 0);
        });

        it('should return undefined when all values are inactive due to constraints', () => {
            assert.strictEqual(adaptiveConfig.getValue('adaptStringVal', { ParamValue: 99 }), undefined);
        });

        it('should return value that matches exact "val" constraint', () => {
            assert.strictEqual(adaptiveConfig.getValue('adaptStringVal', { ParamValue: 'abc' }), 'string3');
        });

        it('should return first value that is active', () => {
            assert.strictEqual(adaptiveConfig.getValue('adaptStringVal', { ParamValue: 1 }), 'string1');
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 1, PV2: 25 }), 0);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 4, PV2: 1 }), 1);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 4, PV2: 100 }), 2);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 100, PV2: 100 }), 3);
        });
    });

    describe('setValue function', () => {
        beforeEach(globalBe);

        it('should force a static value to be returned regardless of parameter values', () => {
            adaptiveConfig.setValue('adaptNumVal', 'xyz');
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 1, PV2: 25 }), 'xyz');
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 4, PV2: 1 }), 'xyz');
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 4, PV2: 100 }), 'xyz');
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 100, PV2: 100 }), 'xyz');
        });

        it('should not affect other config properties', () => {
            adaptiveConfig.setValue('adaptNumVal', 'xyz');
            assert.strictEqual(adaptiveConfig.getValue('adaptStringVal', { ParamValue: 'abc' }), 'string3');
        });
    });

    describe('clearValue function', () => {
        beforeEach(globalBe);

        it('should remove static value from a config property', () => {
            adaptiveConfig.setValue('adaptNumVal', 'xyz');
            adaptiveConfig.clearValue('adaptNumVal');
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 1, PV2: 25 }), 0);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 4, PV2: 1 }), 1);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 4, PV2: 100 }), 2);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV1: 100, PV2: 100 }), 3);
        });

        it('should not affect other config properties', () => {
            adaptiveConfig.setValue('adaptNumVal', 'xyz');
            adaptiveConfig.setValue('adaptStringVal', '123');
            adaptiveConfig.clearValue('adaptNumVal');
            assert.strictEqual(adaptiveConfig.getValue('adaptStringVal', { ParamValue: 'abc' }), '123');
        });
    });

    describe('setParam function', () => {
        beforeEach(globalBe);

        it('should set a default parameter value', () => {
            adaptiveConfig.setParam('PV1', 4);
            adaptiveConfig.setParam('PV2', 100);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal'), 2);
        });

        it('should not force parameter value when one is specified', () => {
            adaptiveConfig.setParam('PV1', 4);
            adaptiveConfig.setParam('PV2', 100);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', { PV2: 1 }), 1);
        });
    });

    describe('clearParam function', () => {
        beforeEach(globalBe);

        it('should clear a default parameter value', () => {
            adaptiveConfig.setParam('PV1', 4);
            adaptiveConfig.setParam('PV2', 100);
            adaptiveConfig.clearParam('PV1');
            adaptiveConfig.clearParam('PV2');
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal'), 0);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', null, true/*isStrictCompliance*/), 3);
        });

        it('should NOT clear other default parameter values', () => {
            adaptiveConfig.setParam('PV1', 4);
            adaptiveConfig.setParam('PV2', 100);
            adaptiveConfig.clearParam('PV1');
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal'), 2);
            assert.strictEqual(adaptiveConfig.getValue('adaptNumVal', null, true/*isStrictCompliance*/), 3);
        });
    });

    describe('instanceof handling', () => {
        beforeEach(globalBe);

        it('should return true when the instance is exact', () => {
            assert.strictEqual(adaptiveConfig instanceof MUAdaptiveConfig, true);
        });

        it('should return false when the instance is NOT exact', () => {

            class NotAdaptiveConfig {}
            const not = new NotAdaptiveConfig();

            assert.strictEqual(not instanceof MUAdaptiveConfig, false);
        });

        it('should return true when the instance extends the valid class', () => {

            class ExtendedAdaptiveConfig extends MUAdaptiveConfig {}
            const extended = new ExtendedAdaptiveConfig({});

            assert.strictEqual(extended instanceof MUAdaptiveConfig, true);
        });

        it('should return true if the instance meets all of the API criteria', () => {

            class AdaptiveConfig {
                getValue() {}
                setValue() {}
                clearValue() {}
                setParam() {}
                clearParam() {}
            }

            const substitute = new AdaptiveConfig();

            assert.strictEqual(substitute instanceof MUAdaptiveConfig, true);
        });
    });
});