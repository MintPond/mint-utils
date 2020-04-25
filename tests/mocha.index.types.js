'use strict';

const
    assert = require('assert'),
    mu = require('./../index');


describe('mint-utils (types)', () => {

    describe('isObject function', () => {

        it('should return true for objects', () => {
            assert.strictEqual(mu.isObject({}), true);
            assert.strictEqual(mu.isObject([]), true);
            assert.strictEqual(mu.isObject(new function(){}), true);
        });

        it('should return false for non-objects', () => {
            assert.strictEqual(mu.isObject(true), false);
            assert.strictEqual(mu.isObject('string'), false);
            assert.strictEqual(mu.isObject(1), false);
            assert.strictEqual(mu.isObject(1.5), false);
            assert.strictEqual(mu.isObject(2n), false);
        });
    });

    describe('isFunction function', () => {

        it('should return true for functions', () => {
            assert.strictEqual(mu.isFunction(function(){}), true);
        });

        it('should return false for non-functions', () => {
            assert.strictEqual(mu.isFunction(true), false);
            assert.strictEqual(mu.isFunction('string'), false);
            assert.strictEqual(mu.isFunction(1), false);
            assert.strictEqual(mu.isFunction(1.5), false);
            assert.strictEqual(mu.isFunction(2n), false);
        });
    });

    describe('isBoolean function', () => {

        it('should return true for booleans', () => {
            assert.strictEqual(mu.isBoolean(true), true);
            assert.strictEqual(mu.isBoolean(false), true);
        });

        it('should return false for non-booleans', () => {
            assert.strictEqual(mu.isBoolean([]), false);
            assert.strictEqual(mu.isBoolean(''), false);
            assert.strictEqual(mu.isBoolean(0), false);
            assert.strictEqual(mu.isBoolean(1), false);
            assert.strictEqual(mu.isBoolean(1.5), false);
            assert.strictEqual(mu.isBoolean(0n), false);
            assert.strictEqual(mu.isBoolean(1n), false);
        });
    });

    describe('isString function', () => {

        it('should return true for strings', () => {
            assert.strictEqual(mu.isString('string'), true);
            assert.strictEqual(mu.isString(''), true);
        });

        it('should return false for non-strings', () => {
            assert.strictEqual(mu.isString([]), false);
            assert.strictEqual(mu.isString(1), false);
            assert.strictEqual(mu.isString(1.5), false);
            assert.strictEqual(mu.isString(1n), false);
            assert.strictEqual(mu.isString(true), false);
        });
    });

    describe('isFilledString function', () => {

        it('should return true for strings that have content', () => {
            assert.strictEqual(mu.isFilledString('string'), true);
        });

        it('should return false for empty strings', () => {
            assert.strictEqual(mu.isFilledString(''), false);
        });

        it('should return false for non-strings', () => {
            assert.strictEqual(mu.isFilledString([]), false);
            assert.strictEqual(mu.isFilledString(1), false);
            assert.strictEqual(mu.isFilledString(1.5), false);
            assert.strictEqual(mu.isFilledString(1n), false);
            assert.strictEqual(mu.isFilledString(true), false);
        });
    });

    describe('isNumber function', () => {

        it('should return true for numbers', () => {
            assert.strictEqual(mu.isNumber(1), true);
            assert.strictEqual(mu.isNumber(1.5), true);
        });

        it('should return false for non-numbers', () => {
            assert.strictEqual(mu.isNumber([]), false);
            assert.strictEqual(mu.isNumber(true), false);
            assert.strictEqual(mu.isNumber('1'), false);
            assert.strictEqual(mu.isNumber(2n), false);
        });
    });

    describe('isBigInt function', () => {

        it('should return true for bigints', () => {
            assert.strictEqual(mu.isBigInt(1n), true);
        });

        it('should return false for non-bigints', () => {
            assert.strictEqual(mu.isBigInt([]), false);
            assert.strictEqual(mu.isBigInt(true), false);
            assert.strictEqual(mu.isBigInt('1'), false);
            assert.strictEqual(mu.isBigInt(2), false);
            assert.strictEqual(mu.isBigInt(2.5), false);
        });
    });

    describe('isInteger function', () => {

        it('should return true for integer numbers', () => {
            assert.strictEqual(mu.isInteger(1), true);
        });

        it('should return false for floating point numbers', () => {
            assert.strictEqual(mu.isInteger(1.5), false);
        });

        it('should return false for non-numbers', () => {
            assert.strictEqual(mu.isInteger([]), false);
            assert.strictEqual(mu.isInteger(true), false);
            assert.strictEqual(mu.isInteger('1'), false);
            assert.strictEqual(mu.isInteger(null), false);
        });
    });

    describe('isUndefined function', () => {

        it('should return true for undefined values', () => {
            assert.strictEqual(mu.isUndefined(undefined), true);
        });

        it('should return false for defined values', () => {
            assert.strictEqual(mu.isUndefined(1.5), false);
            assert.strictEqual(mu.isUndefined([]), false);
            assert.strictEqual(mu.isUndefined(true), false);
            assert.strictEqual(mu.isUndefined('1'), false);
            assert.strictEqual(mu.isUndefined(2), false);
            assert.strictEqual(mu.isUndefined(null), false);
        });
    });

    describe('isNull function', () => {

        it('should return true for null values', () => {
            assert.strictEqual(mu.isNull(null), true);
        });

        it('should return false for non-null values', () => {
            assert.strictEqual(mu.isNull(1.5), false);
            assert.strictEqual(mu.isNull([]), false);
            assert.strictEqual(mu.isNull(true), false);
            assert.strictEqual(mu.isNull('1'), false);
            assert.strictEqual(mu.isNull(2), false);
            assert.strictEqual(mu.isNull(undefined), false);
        });
    });

    describe('isNotSet function', () => {

        it('should return true for null and undefined values', () => {
            assert.strictEqual(mu.isNotSet(null), true);
            assert.strictEqual(mu.isNotSet(undefined), true);
        });

        it('should return false for non-null and defined values', () => {
            assert.strictEqual(mu.isNotSet(1.5), false);
            assert.strictEqual(mu.isNotSet([]), false);
            assert.strictEqual(mu.isNotSet(true), false);
            assert.strictEqual(mu.isNotSet('1'), false);
            assert.strictEqual(mu.isNotSet(2), false);
        });
    });

    describe('isArray function', () => {

        it('should return true for arrays', () => {
            assert.strictEqual(mu.isArray([]), true);
        });

        it('should return false for non-null and defined values', () => {
            assert.strictEqual(mu.isArray(1.5), false);
            assert.strictEqual(mu.isArray(null), false);
            assert.strictEqual(mu.isArray(true), false);
            assert.strictEqual(mu.isArray('1'), false);
            assert.strictEqual(mu.isArray(2), false);
        });
    });
});