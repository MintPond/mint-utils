'use strict';

const
    assert = require('assert'),
    prototypes = require('./../libs/service.prototypes');


describe('mint-utils', () => {

    describe('isFunction function', () => {

        it('should return true for functions', () => {
            assert.strictEqual(prototypes.isFunction(function(){}), true);
        });

        it('should return false for non-functions', () => {
            assert.strictEqual(prototypes.isFunction(true), false);
            assert.strictEqual(prototypes.isFunction('string'), false);
            assert.strictEqual(prototypes.isFunction(1), false);
            assert.strictEqual(prototypes.isFunction(1.5), false);
            assert.strictEqual(prototypes.isFunction(2n), false);
        });
    });

    describe('hasGetters function', () => {

        it('should return true when all getters are present', () => {

            class MyClass {
                get property1() { throw new Error('Should not call') }
                get property2() { throw new Error('Should not call') }
            }
            const obj = new MyClass();

            assert.strictEqual(prototypes.hasGetters(obj, 'property1', 'property2'), true);
        });

        it('should return false if any of the getters are not present', () => {

            class MyClass {
                get property1() { throw new Error('Should not call') }
                get property2() { throw new Error('Should not call') }
            }
            const obj = new MyClass();

            assert.strictEqual(prototypes.hasGetters(obj, 'property1', 'property2', 'property3'), false);
        });

        it('should return true if the getters are in a parent prototype', () => {

            class MyClass {
                get property1() { throw new Error('Should not call') }
                get property2() { throw new Error('Should not call') }
            }
            class ExtendedClass extends MyClass {

            }
            const obj = new ExtendedClass();

            assert.strictEqual(prototypes.hasGetters(obj, 'property1', 'property2'), true);
        });
    });

    describe('hasSetters function', () => {

        it('should return true when all setters are present', () => {

            class MyClass {
                set property1(val) { throw new Error('Should not call') }
                set property2(val) { throw new Error('Should not call') }
            }
            const obj = new MyClass();

            assert.strictEqual(prototypes.hasSetters(obj, 'property1', 'property2'), true);
        });

        it('should return false if any of the getters are not present', () => {

            class MyClass {
                set property1(val) { throw new Error('Should not call') }
                set property2(val) { throw new Error('Should not call') }
            }
            const obj = new MyClass();

            assert.strictEqual(prototypes.hasSetters(obj, 'property1', 'property2', 'property3'), false);
        });

        it('should return true if the setters are in a parent prototype', () => {

            class MyClass {
                set property1(val) { throw new Error('Should not call') }
                set property2(val) { throw new Error('Should not call') }
            }
            class ExtendedClass extends MyClass {}
            const obj = new ExtendedClass();

            assert.strictEqual(prototypes.hasSetters(obj, 'property1', 'property2'), true);
        });
    });

    describe('isInstanceOfByName function', () => {

        it('should return false if the object is not named', () => {
            const fn = new (function() {});
            assert.strictEqual(prototypes.isInstanceOfByName(fn, 'fn'), false);
        });

        it('should return false if the object constructor is not the correct name', () => {
            class MyClass {}
            const obj = new MyClass();
            assert.strictEqual(prototypes.isInstanceOfByName(obj, 'NotMyClass'), false);
        });

        it('should return true if the object constructor is the correct name', () => {
            class MyClass {}
            const obj = new MyClass();
            assert.strictEqual(prototypes.isInstanceOfByName(obj, 'MyClass'), true);
        });

        it('should return true if the object extends a constructor with the correct name', () => {
            class MyClass {}
            class ExtendedClass extends MyClass {}
            const obj = new ExtendedClass();
            assert.strictEqual(prototypes.isInstanceOfByName(obj, 'MyClass'), true);
        });

        it('should return false if the object is null', () => {
            assert.strictEqual(prototypes.isInstanceOfByName(null, 'MyClass'), false);
        });

        it('should return false if the object is undefined', () => {
            assert.strictEqual(prototypes.isInstanceOfByName(undefined, 'MyClass'), false);
        });

        it('should return false if the object is true', () => {
            assert.strictEqual(prototypes.isInstanceOfByName(true, 'MyClass'), false);
        });
    });
});