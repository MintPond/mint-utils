'use strict';

const
    assert = require('assert'),
    MUSimpleRingBuffer = require('./../libs/class.SimpleRingBuffer');


describe('SimpleRingBuffer', () => {

    let buffer;

    function globalBE() {
        buffer = new MUSimpleRingBuffer(3);
    }

    beforeEach(globalBE);

    it('should return 0 from "size" property by default', () => {
        assert.strictEqual(buffer.size, 0);
    });

    it('should return correct value from "capacity" property', () => {
        assert.strictEqual(buffer.capacity, 3);
    });


    describe('push function', () => {
        beforeEach(globalBE);

        it('should change "size" property value', () => {
            buffer.push('item');
            assert.strictEqual(buffer.size, 1);
        });

        it('should not add more than capacity', () => {
            buffer.push('item1');
            buffer.push('item2');
            buffer.push('item3');
            buffer.push('item4');
            assert.strictEqual(buffer.size, 3);
        });

        it('should return item discarded due to overflow on a first-in-first-out basis', () => {
            buffer.push('item1');
            buffer.push('item2');
            buffer.push('item3');
            const removed = buffer.push('item4');
            assert.strictEqual(removed, 'item1');
        });
    });

    describe('toArray function', () => {
        beforeEach(globalBE);

        it('should return items in buffer in an array', () => {
            buffer.push('item1');
            buffer.push('item2');
            buffer.push('item3');
            buffer.push('item4');
            const array = buffer.toArray();
            assert.strictEqual(array.length, 3);
            assert.strictEqual(array[0], 'item2');
            assert.strictEqual(array[1], 'item3');
            assert.strictEqual(array[2], 'item4');
        });
    });


    describe('clear function', () => {
        beforeEach(globalBE);

        it('should remove all items in buffer', () => {
            buffer.push('item1');
            buffer.push('item2');
            buffer.push('item3');
            buffer.push('item4');
            buffer.clear();
            assert.strictEqual(buffer.size, 0);
        });
    });

    describe('forEach function', () => {
        beforeEach(globalBE);

        it('should iterate items in buffer', () => {
            const expectedArr = ['item1', 'item2'];
            buffer.push('item1');
            buffer.push('item2');
            buffer.forEach(item => {
                assert.strictEqual(item, expectedArr.shift());
            });
            assert.strictEqual(expectedArr.length, 0);
        });

        it('should iterate items in buffer (overflow)', () => {
            const expectedArr = ['item2', 'item3', 'item4'];
            buffer.push('item1');
            buffer.push('item2');
            buffer.push('item3');
            buffer.push('item4');
            buffer.forEach(item => {
                assert.strictEqual(item, expectedArr.shift());
            });
            assert.strictEqual(expectedArr.length, 0);
        });

        it('should return itself', () => {

            const returned = buffer.forEach(()=> {});
            assert.strictEqual(returned, buffer);
        });
    });

    describe('map function', () => {
        beforeEach(globalBE);

        it('should iterate items in buffer', () => {
            const expectedArr = ['item1', 'item2'];
            buffer.push('item1');
            buffer.push('item2');
            buffer.map(item => {
                assert.strictEqual(item, expectedArr.shift());
                return item;
            });
            assert.strictEqual(expectedArr.length, 0);
        });

        it('should iterate items in buffer (overflow)', () => {
            const expectedArr = ['item2', 'item3', 'item4'];
            buffer.push('item1');
            buffer.push('item2');
            buffer.push('item3');
            buffer.push('item4');
            buffer.map(item => {
                assert.strictEqual(item, expectedArr.shift());
                return item;
            });
            assert.strictEqual(expectedArr.length, 0);
        });

        it('should return mapped array', () => {
            buffer.push('item1');
            buffer.push('item2');
            buffer.push('item3');
            buffer.push('item4');
            const mappedArr = buffer.map(item => {
                return item + 'B';
            });
            assert.strictEqual(mappedArr.length, 3);
            assert.strictEqual(mappedArr[0], 'item2B');
            assert.strictEqual(mappedArr[1], 'item3B');
            assert.strictEqual(mappedArr[2], 'item4B');
        });
    });

    describe('reduce function', () => {
        beforeEach(globalBE);

        it('should iterate items in buffer', () => {
            const expectedArr = ['item1', 'item2'];
            buffer.push('item1');
            buffer.push('item2');
            buffer.reduce((a, item) => {
                assert.strictEqual(item, expectedArr.shift());
                return a;
            }, 0);
            assert.strictEqual(expectedArr.length, 0);
        });

        it('should iterate items in buffer (overflow)', () => {
            const expectedArr = ['item2', 'item3', 'item4'];
            buffer.push('item1');
            buffer.push('item2');
            buffer.push('item3');
            buffer.push('item4');
            buffer.reduce((a, item) => {
                assert.strictEqual(item, expectedArr.shift());
                return a;
            }, 0);
            assert.strictEqual(expectedArr.length, 0);
        });

        it('should return reduced value', () => {
            buffer.push('item1');
            buffer.push('item2');
            buffer.push('item3');
            buffer.push('item4');
            const reduced = buffer.reduce((a, item) => {
                return a + item;
            }, '');
            assert.strictEqual(reduced, 'item2item3item4');
        });
    });
});