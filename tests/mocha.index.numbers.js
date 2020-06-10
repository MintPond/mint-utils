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

    describe('parseHex function', () => {

        it('should return number type', () => {
            const num = mu.parseHex('0xFE');
            assert.strictEqual(typeof num, 'number');
        });

        it('should parse hex with "0x" prefix', () => {
            const num = mu.parseHex('0xFE');
            assert.strictEqual(num, 254);
        });

        it('should parse hex without "0x" prefix', () => {
            const num = mu.parseHex('FE');
            assert.strictEqual(num, 254);
        });

        it('should return NaN for invalid hex', () => {
            const num = mu.parseHex('hello');
            assert.strictEqual(isNaN(num), true);
        });
    });

    describe('parseHexToBi function', () => {

        it('should return bigint type', () => {
            const bi = mu.parseHexToBi('0xFE');
            assert.strictEqual(typeof bi, 'bigint');
        });

        it('should parse hex with "0x" prefix', () => {
            const bi = mu.parseHexToBi('0xFE');
            assert.strictEqual(bi.toString(10), '254');
        });

        it('should parse hex without "0x" prefix', () => {
            const bi = mu.parseHexToBi('FE');
            assert.strictEqual(bi.toString(10), '254');
        });

        it('should throw SyntaxError for invalid hex', () => {
            try {
                mu.parseHexToBi('hello');
            }
            catch(err) {
                if (err instanceof SyntaxError)
                    return;
            }
            throw new Error('SyntaxError expected');
        });
    });


    describe('expandHex function', () => {

        it('should correctly expand hex byte size (with "0x" prefix)', () => {
            const expanded = mu.expandHex('0xFE', 4);
            assert.strictEqual(expanded, '000000FE');
        });

        it('should correctly expand hex byte size (without "0x" prefix)', () => {
            const expanded = mu.expandHex('FE', 4);
            assert.strictEqual(expanded, '000000FE');
        });

        it('should NOT expand hex byte size if already larger than specified (with "0x" prefix)', () => {
            const expanded = mu.expandHex('0x0000FE', 2);
            assert.strictEqual(expanded, '0000FE');
        });

        it('should NOT expand hex byte size if already equal to specified (with "0x" prefix)', () => {
            const expanded = mu.expandHex('0x00FE', 2);
            assert.strictEqual(expanded, '00FE');
        });

        it('should NOT expand hex byte size if already larger than specified (without "0x" prefix)', () => {
            const expanded = mu.expandHex('0000FE', 2);
            assert.strictEqual(expanded, '0000FE');
        });

        it('should NOT expand hex byte size if already equal to specified (without "0x" prefix)', () => {
            const expanded = mu.expandHex('00FE', 2);
            assert.strictEqual(expanded, '00FE');
        });
    });
});