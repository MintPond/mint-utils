'use strict';

const
    assert = require('assert'),
    mu = require('./../index');


describe('mint-utils (numbers)', () => {

    describe('isPowerOf2 function', () => {

        it('should correctly identify numbers that are powers of 2', () => {
            assert.strictEqual(mu.isPowerOf2(1), true);
            assert.strictEqual(mu.isPowerOf2(2), true);
            assert.strictEqual(mu.isPowerOf2(4), true);
            assert.strictEqual(mu.isPowerOf2(8), true);
            assert.strictEqual(mu.isPowerOf2(16), true);
            assert.strictEqual(mu.isPowerOf2(32), true);
            assert.strictEqual(mu.isPowerOf2(64), true);
            assert.strictEqual(mu.isPowerOf2(128), true);
            assert.strictEqual(mu.isPowerOf2(256), true);
            assert.strictEqual(mu.isPowerOf2(512), true);
            assert.strictEqual(mu.isPowerOf2(1024), true);
            assert.strictEqual(mu.isPowerOf2(2048), true);
            assert.strictEqual(mu.isPowerOf2(4096), true);
            assert.strictEqual(mu.isPowerOf2(8192), true);
        });

        it('should correctly identify numbers that are NOT powers of 2', () => {
            assert.strictEqual(mu.isPowerOf2(0), false);
            assert.strictEqual(mu.isPowerOf2(3), false);
            assert.strictEqual(mu.isPowerOf2(6), false);
            assert.strictEqual(mu.isPowerOf2(12), false);
            assert.strictEqual(mu.isPowerOf2(18), false);
            assert.strictEqual(mu.isPowerOf2(24), false);
            assert.strictEqual(mu.isPowerOf2(768), false);
            assert.strictEqual(mu.isPowerOf2(1536), false);
        });
    });
});