'use strict';

const
    assert = require('assert'),
    MUDirtyData = require('./../libs/class.DirtyData');


describe('DirtyData', () => {

    let data;

    function globalBE() {
        data = new MUDirtyData();
    }

    context('general', () => {
        beforeEach(globalBE);

        it('should return false from "isDirty" property by default', () => {
            assert.strictEqual(data.isDirty, false);
        });

        it('should return empty JSON string from "json" property by default', () => {
            assert.strictEqual(data.json, '{}');
        });

        it('should return empty JSON string from "dirtyJson" property by default', () => {
            assert.strictEqual(data.dirtyJson, '{}');
        });
    });

    context('data', () => {
        beforeEach(globalBE);

        it('should be able to set a path string value', () => {
            data.set('basePath.key1', 'string1');
            data.set('basePath.key2', 'string2');
            const value = data.get('basePath.key1');
            assert.strictEqual(value, 'string1');
        });

        it('should be able to set a path number value', () => {
            data.set('basePath.key1', 10);
            data.set('basePath.key2', 11);
            const value = data.get('basePath.key1');
            assert.strictEqual(value, 10);
        });

        it('should be able to set a path boolean value', () => {
            data.set('basePath.key1', true);
            data.set('basePath.key2', false);
            const value1 = data.get('basePath.key1');
            const value2 = data.get('basePath.key2');
            assert.strictEqual(value1, true);
            assert.strictEqual(value2, false);
        });

        it('should be able to set a path array value', () => {
            const array = [1, 2];
            data.set('basePath.key', array);
            const value = data.get('basePath.key');
            assert.strictEqual(value, array);
        });
    });

    context('dirty', () => {
        beforeEach(globalBE);

        it('should change "isDirty" property to true when a value is set', () => {
            data.set('basePath.key1', 10);
            assert.strictEqual(data.isDirty, true);
        });

        it('should change "isDirty" property to false when "clean" function is called', () => {
            data.set('basePath.key1', 10);
            data.clean();
            assert.strictEqual(data.isDirty, false);
        });

        it('should change "isDirty" property to true when a value is changed', () => {
            data.set('basePath.key1', 10);
            data.clean();
            data.set('basePath.key1', 11);
            assert.strictEqual(data.isDirty, true);
        });
    });

    context('toArray function', () => {
        beforeEach(globalBE);

        it('should convert data to array for serialization', () => {
            data.set('basePath.key1', 10);
            data.set('basePath.key2', true);
            data.set('basePath.key3', 'string');
            data.set('basePath.key4', ['string', false, 1.1]);
            const array = data.toArray();
            assert.strictEqual(array.length, 4);
            assert.strictEqual(array[0][0], 'basePath.key1');
            assert.strictEqual(array[0][1], 10);
            assert.strictEqual(array[1][0], 'basePath.key2');
            assert.strictEqual(array[1][1], true);
            assert.strictEqual(array[2][0], 'basePath.key3');
            assert.strictEqual(array[2][1], 'string');
            assert.strictEqual(array[3][0], 'basePath.key4');
            assert.strictEqual(array[3][1].length, 3);
        });

        it('should set data from array', () => {
            const array = [
                ['basePath.key1', 10],
                ['basePath.key2', true],
                ['basePath.key3', 'string'],
                ['basePath.key4', ['string', false, 1.1]]
            ];
            data.setArray(array);
            assert.strictEqual(data.get('basePath.key1'), 10);
            assert.strictEqual(data.get('basePath.key2'), true);
            assert.strictEqual(data.get('basePath.key3'), 'string');

            const arrayVal = data.get('basePath.key4');

            assert.strictEqual(arrayVal.length, 3);
            assert.strictEqual(arrayVal[0], 'string');
            assert.strictEqual(arrayVal[1], false);
            assert.strictEqual(arrayVal[2], 1.1);
        });

        it('should change values when data from array is set', () => {
            data.set('basePath.key1', 7);
            data.set('basePath.key2', false);
            data.set('basePath.key3', 's');
            data.set('basePath.key4', []);
            data.set('basePath.key5', 99);

            const array = [
                ['basePath.key1', 10],
                ['basePath.key2', true],
                ['basePath.key3', 'string'],
                ['basePath.key4', ['string', false, 1.1]]
            ];
            data.setArray(array);
            assert.strictEqual(data.get('basePath.key1'), 10);
            assert.strictEqual(data.get('basePath.key2'), true);
            assert.strictEqual(data.get('basePath.key3'), 'string');
            assert.strictEqual(data.get('basePath.key5'), 99);

            const arrayVal = data.get('basePath.key4');

            assert.strictEqual(arrayVal.length, 3);
            assert.strictEqual(arrayVal[0], 'string');
            assert.strictEqual(arrayVal[1], false);
            assert.strictEqual(arrayVal[2], 1.1);
        });
    });


    context('delta', () => {
        beforeEach(globalBE);

        it('should change "isDirty" property to true when a value is set', () => {
            data.set('basePath.key1', ['a', 'b']);
            data.clean();
            data.setDelta('basePath.key1', ['c']);
            assert.strictEqual(data.isDirty, true);
        });
    });


    context('json', () => {
        beforeEach(globalBE);

        it('should create correct json string', () => {
            data.set('basePath.key1', 10);
            data.set('basePath.key2', true);
            data.set('basePath.key3', 'string');
            data.set('basePath.key4', ['string', false, 1.1]);
            data.set('basePath.key4', ['string', false, 1.1, 2]);
            data.clean();
            assert.strictEqual(data.json, '{"basePath":{"key1":10,"key2":true,"key3":"string","key4":["string",false,1.1,2]}}');
        });

        it('should create correct dirty json string', () => {
            data.set('basePath.key1', 10);
            data.set('basePath.key2', true);
            data.set('basePath.key3', 'string');
            data.set('basePath.key4', ['string', false, 1.1]);
            data.clean();
            data.set('basePath.key4', ['string', false, 1.1, 2]);
            assert.strictEqual(data.dirtyJson, '{"basePath":{"key4":["string",false,1.1,2]}}');
        });

        it('should only include array deltas in dirty json when array is set', () => {
            data.set('basePath.key1', 7);
            data.set('basePath.key2', ['string', false]);

            const array = [
                ['basePath.key1', 10],
                ['basePath.key2', ['string', false, 1.1]]
            ];
            data.setArray(array);

            assert.strictEqual(data.dirtyJson, '{"basePath":{"key1":10,"key2":[1.1]}}');
        });

        it('should only include array deltas in dirty json when delta value is set', () => {
            data.set('basePath.key1', 10);
            data.set('basePath.key2', ['string', false, 1.1]);
            data.setDelta('basePath.key2', [1.1]);

            assert.strictEqual(data.dirtyJson, '{"basePath":{"key1":10,"key2":[1.1]}}');
        });

        it('should include all array elements in json when array is set', () => {
            data.set('basePath.key1', 7);
            data.set('basePath.key2', ['string', false]);

            const array = [
                ['basePath.key1', 10],
                ['basePath.key2', ['string', false, 1.1]]
            ];
            data.setArray(array);

            assert.strictEqual(data.json, '{"basePath":{"key1":10,"key2":["string",false,1.1]}}');
        });

        it('should include all array elements in json when delta value is set', () => {
            data.set('basePath.key1', 10);
            data.set('basePath.key2', ['string', false, 1.1]);
            data.setDelta('basePath.key2', [1.1]);

            assert.strictEqual(data.json, '{"basePath":{"key1":10,"key2":["string",false,1.1]}}');
        });
    });


    context('property converter', () => {
        beforeEach(() => {
            data = new MUDirtyData((path) => {
                return path.split('.').join('A.') + 'A';
            });
        });

        it('should not affect property names when using get function', () => {
            data.set('basePath.key1', 10);
            const value = data.get('basePath.key1');
            assert.strictEqual(value, 10);
        });

        it('should change property names in json', () => {
            data.set('basePath.key1', 10);
            assert.strictEqual(data.json, '{"basePathA":{"key1A":10}}');
        });

        it('should change property names in dirty json', () => {
            data.set('basePath.key1', 10);
            assert.strictEqual(data.dirtyJson, '{"basePathA":{"key1A":10}}');
        });
    });
});