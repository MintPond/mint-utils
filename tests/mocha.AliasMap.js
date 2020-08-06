'use strict';

const
    assert = require('assert'),
    AliasMap = require('./../libs/class.AliasMap');

let map;

function globalBe() {
    map = new AliasMap();
}


describe('AliasMap', () => {

    beforeEach(globalBe);

    it('should return 0 from size property', () => {
        assert.strictEqual(map.size, 0);
    });

    it('should return 1 from size property after adding 1 value', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        assert.strictEqual(map.size, 1);
    });

    it('should return 2 from size property after adding 2 values', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        map.set({ name: 'value2', aliasArr: ['v2']});
        assert.strictEqual(map.size, 2);
    });

    it('should return false from "has" function if not exists', () => {
        assert.strictEqual(map.has('value1'), false);
    });

    it('should return false from "has" function if alias not exists', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        assert.strictEqual(map.has('v2'), false);
    });

    it('should return true from "has" function by name', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        assert.strictEqual(map.has('value1'), true);
    });

    it('should return true from "has" function by alias', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        assert.strictEqual(map.has('v1'), true);
    });

    it('should return value from "get" function by name', () => {
        const value = { name: 'value1', aliasArr: ['v1']};
        map.set(value);
        assert.strictEqual(map.get('value1'), value);
    });

    it('should return value from "get" function by alias', () => {
        const value = { name: 'value1', aliasArr: ['v1']};
        map.set(value);
        assert.strictEqual(map.get('v1'), value);
    });

    it('should return undefined from "get" function if not exists', () => {
        const value = { name: 'value1', aliasArr: ['v1']};
        map.set(value);
        assert.strictEqual(map.get('value2'), undefined);
    });

    it('should return alternate value from "get" function if set', () => {
        const key = { name: 'value1', aliasArr: ['v1']};
        map.set(key, 'value');
        assert.strictEqual(map.get('value1'), 'value');
    });

    it('should return true from "delete" function if deleted', () => {
        const value = { name: 'value1', aliasArr: ['v1']};
        map.set(value);
        assert.strictEqual(map.delete(value), true);
    });

    it('should return false from "delete" function if not deleted', () => {
        const value = { name: 'value1', aliasArr: ['v1']};
        assert.strictEqual(map.delete(value), false);
    });

    it('should return correct size after "delete" function', () => {
        const value = { name: 'value1', aliasArr: ['v1']};
        map.set(value);
        map.delete(value);
        assert.strictEqual(map.size, 0);
    });

    it('should return false from "has" after "delete" with name', () => {
        const value = { name: 'value1', aliasArr: ['v1']};
        map.set(value);
        map.delete(value);
        assert.strictEqual(map.has('value1'), false);
    });

    it('should return false from "has" after "delete" with alias', () => {
        const value = { name: 'value1', aliasArr: ['v1']};
        map.set(value);
        map.delete(value);
        assert.strictEqual(map.has('v1'), false);
    });

    it('should clear all values after "clear" function', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        map.set({ name: 'value2', aliasArr: ['v2']});
        map.clear();
        assert.strictEqual(map.size, 0);
    });

    it('should not "has" item by name after "clear" function', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        map.clear();
        assert.strictEqual(map.has('value1'), false);
    });

    it('should not "has" item by alias after "clear" function', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        map.clear();
        assert.strictEqual(map.has('v1'), false);
    });

    it('should not "get" item by name after "clear" function', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        map.clear();
        assert.strictEqual(map.get('value1'), undefined);
    });

    it('should not "get" item by alias after "clear" function', () => {
        map.set({ name: 'value1', aliasArr: ['v1']});
        map.clear();
        assert.strictEqual(map.get('v1'), undefined);
    });

    it('should iterate with "forEach" function', () => {

        const v1 = { name: 'value1', aliasArr: ['v1']};
        const v2 = { name: 'value2', aliasArr: ['v2']};

        map.set(v1);
        map.set(v2, 'alternate2');

        const valArr = [];

        map.forEach(val => {
            valArr.push(val);
        });

        assert.strictEqual(valArr[0], v1);
        assert.strictEqual(valArr[1], 'alternate2');
    });

    it('should return name iterator from "keys" function', () => {

        const v1 = { name: 'value1', aliasArr: ['v1']};
        const v2 = { name: 'value2', aliasArr: ['v2']};

        map.set(v1);
        map.set(v2, 'alternate2');

        const nameArr = [];

        for (const name of map.keys()) {
            nameArr.push(name);
        }

        assert.strictEqual(nameArr[0], 'value1');
        assert.strictEqual(nameArr[1], 'value2');
    });

    it('should return value iterator from "values" function', () => {

        const v1 = { name: 'value1', aliasArr: ['v1']};
        const v2 = { name: 'value2', aliasArr: ['v2']};

        map.set(v1);
        map.set(v2, 'alternate2');

        const valArr = [];
        console.log(map.keys());

        for (const name of map.values()) {
            valArr.push(name);
        }

        assert.strictEqual(valArr[0], v1);
        assert.strictEqual(valArr[1], 'alternate2');
    });

    it('should have name/value iterator', () => {

        const v1 = { name: 'value1', aliasArr: ['v1']};
        const v2 = { name: 'value2', aliasArr: ['v2']};

        map.set(v1);
        map.set(v2, 'alternate2');

        const nameArr = [];
        const valArr = [];

        for (const [name, value] of map) {
            nameArr.push(name);
            valArr.push(value);
        }

        assert.strictEqual(nameArr[0], 'value1');
        assert.strictEqual(nameArr[1], 'value2');
        assert.strictEqual(valArr[0], v1);
        assert.strictEqual(valArr[1], 'alternate2');
    });
});