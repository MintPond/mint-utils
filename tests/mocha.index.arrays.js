'use strict';

const
    assert = require('assert'),
    mu = require('./../index');


describe('mint-utils (arrays)', () => {

    describe('chunk function', () => {

        it('should return empty array if not array provided', () => {
            assert.strictEqual(Array.isArray(mu.chunk(null)), true);
            assert.strictEqual(mu.chunk(null).length, 0);
        });

        it('should return chunks of original array', () => {

            const array = [1, 2, 3, 4, 5, 6];
            const chunkArr = mu.chunk(array, 2);

            assert.strictEqual(chunkArr.length, 3);
            assert.strictEqual(chunkArr[0].length, 2);
            assert.strictEqual(chunkArr[1].length, 2);
            assert.strictEqual(chunkArr[2].length, 2);

            assert.strictEqual(chunkArr[0][0], 1);
            assert.strictEqual(chunkArr[0][1], 2);

            assert.strictEqual(chunkArr[1][0], 3);
            assert.strictEqual(chunkArr[1][1], 4);

            assert.strictEqual(chunkArr[2][0], 5);
            assert.strictEqual(chunkArr[2][1], 6);
        });

        it('should return chunks of original array with last chunk incomplete if divisions cannot be complete', () => {

            const array = [1, 2, 3, 4, 5, 6, 7];
            const chunkArr = mu.chunk(array, 2);

            assert.strictEqual(chunkArr.length, 4);
            assert.strictEqual(chunkArr[0].length, 2);
            assert.strictEqual(chunkArr[1].length, 2);
            assert.strictEqual(chunkArr[2].length, 2);
            assert.strictEqual(chunkArr[3].length, 1);

            assert.strictEqual(chunkArr[0][0], 1);
            assert.strictEqual(chunkArr[0][1], 2);

            assert.strictEqual(chunkArr[1][0], 3);
            assert.strictEqual(chunkArr[1][1], 4);

            assert.strictEqual(chunkArr[2][0], 5);
            assert.strictEqual(chunkArr[2][1], 6);

            assert.strictEqual(chunkArr[3][0], 7);
        });
    });

    describe('concat function', () => {

        it('should concatenated elements of arrays', () => {
            const array1 = [1, 2];
            const array2 = [3, 4, 5];
            const concatArr = mu.concat(array1, array2);

            assert.strictEqual(concatArr.length, 5);
            assert.strictEqual(concatArr[0], 1);
            assert.strictEqual(concatArr[1], 2);
            assert.strictEqual(concatArr[2], 3);
            assert.strictEqual(concatArr[3], 4);
            assert.strictEqual(concatArr[4], 5);
        });
    });

    describe('difference function', () => {

        it('should remove elements from source array contained in exclude array', () => {
            const sourceArr = [1, 2, 3, 4, 5, 6];
            const excludeArr = [4, 5];
            const diffArr = mu.difference(sourceArr, excludeArr);

            assert.strictEqual(diffArr.length, 4);
            assert.strictEqual(diffArr[0], 1);
            assert.strictEqual(diffArr[1], 2);
            assert.strictEqual(diffArr[2], 3);
            assert.strictEqual(diffArr[3], 6);
        });
    });

    describe('pushAll function', () => {

        it('should add all elements of arrays to a target array instance', () => {
            const targetArr = [1, 2];
            const array1 = [1, 2, 3];
            const array2 = [5, 6];

            mu.pushAll(targetArr, array1, array2);

            assert.strictEqual(targetArr.length, 7);
            assert.strictEqual(targetArr[0], 1);
            assert.strictEqual(targetArr[1], 2);
            assert.strictEqual(targetArr[2], 1);
            assert.strictEqual(targetArr[3], 2);
            assert.strictEqual(targetArr[4], 3);
            assert.strictEqual(targetArr[5], 5);
            assert.strictEqual(targetArr[6], 6);
        });
    });

    describe('toSet function', () => {

        it('should add all elements of arrays to a new Set instance', () => {
            const array1 = [2, 3, 4, 5];
            const array2 = [1, 2, 3];
            const array3 = [5, 6];

            const set = mu.toSet(array1, array2, array3);

            assert.strictEqual(set.size, 6);
            assert.strictEqual(set.has(1), true);
            assert.strictEqual(set.has(2), true);
            assert.strictEqual(set.has(3), true);
            assert.strictEqual(set.has(4), true);
            assert.strictEqual(set.has(5), true);
            assert.strictEqual(set.has(6), true);
        });
    });

    describe('sortAscending function', () => {

        it('should sort an array of numbers in ascending order', () => {
            const array = [2, 4, 1, 3];
            mu.sortAscending(array);

            assert.strictEqual(array[0], 1);
            assert.strictEqual(array[1], 2);
            assert.strictEqual(array[2], 3);
            assert.strictEqual(array[3], 4);
        });

        it('should sort an array of strings in ascending order', () => {
            const array = ['b', 'd', 'a', 'c'];
            mu.sortAscending(array);

            assert.strictEqual(array[0], 'a');
            assert.strictEqual(array[1], 'b');
            assert.strictEqual(array[2], 'c');
            assert.strictEqual(array[3], 'd');
        });

        it('should sort an array of objects using by property name', () => {
            const array = [{ p: 2 }, { p: 4 }, { p: 1}, { p: 3}];
            mu.sortAscending(array, 'p');

            assert.strictEqual(array[0].p, 1);
            assert.strictEqual(array[1].p, 2);
            assert.strictEqual(array[2].p, 3);
            assert.strictEqual(array[3].p, 4);
        });

        it('should sort an array of arrays using by index', () => {
            const array = [[null, 2], [null, 4], [null, 1], [null, 3]];
            mu.sortAscending(array, 1);

            assert.strictEqual(array[0][1], 1);
            assert.strictEqual(array[1][1], 2);
            assert.strictEqual(array[2][1], 3);
            assert.strictEqual(array[3][1], 4);
        });

        it('should sort using a converter function if provided', () => {
            const array = [{ p: 2 }, { p: 4 }, { p: 1}, { p: 3}];
            mu.sortAscending(array, (elem) => {
                return elem.p;
            });

            assert.strictEqual(array[0].p, 1);
            assert.strictEqual(array[1].p, 2);
            assert.strictEqual(array[2].p, 3);
            assert.strictEqual(array[3].p, 4);
        });
    });

    describe('sortDescending function', () => {

        it('should sort an array of numbers in descending order', () => {
            const array = [2, 4, 1, 3];
            mu.sortDescending(array);

            assert.strictEqual(array[0], 4);
            assert.strictEqual(array[1], 3);
            assert.strictEqual(array[2], 2);
            assert.strictEqual(array[3], 1);
        });

        it('should sort an array of strings in descending order', () => {
            const array = ['b', 'd', 'a', 'c'];
            mu.sortDescending(array);

            assert.strictEqual(array[0], 'd');
            assert.strictEqual(array[1], 'c');
            assert.strictEqual(array[2], 'b');
            assert.strictEqual(array[3], 'a');
        });

        it('should sort an array of objects using by property name', () => {
            const array = [{ p: 2 }, { p: 4 }, { p: 1}, { p: 3}];
            mu.sortDescending(array, 'p');

            assert.strictEqual(array[0].p, 4);
            assert.strictEqual(array[1].p, 3);
            assert.strictEqual(array[2].p, 2);
            assert.strictEqual(array[3].p, 1);
        });

        it('should sort an array of arrays using by index', () => {
            const array = [[null, 2], [null, 4], [null, 1], [null, 3]];
            mu.sortDescending(array, 1);

            assert.strictEqual(array[0][1], 4);
            assert.strictEqual(array[1][1], 3);
            assert.strictEqual(array[2][1], 2);
            assert.strictEqual(array[3][1], 1);
        });

        it('should sort using a converter function if provided', () => {
            const array = [{ p: 2 }, { p: 4 }, { p: 1}, { p: 3}];
            mu.sortDescending(array, (elem) => {
                return elem.p;
            });

            assert.strictEqual(array[0].p, 4);
            assert.strictEqual(array[1].p, 3);
            assert.strictEqual(array[2].p, 2);
            assert.strictEqual(array[3].p, 1);
        });
    });
});