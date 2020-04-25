'use strict';

const
    assert = require('assert'),
    mu = require('./../index');


describe('mint-utils (random)', () => {

    describe('randInteger function', () => {

        it('should not return a value less than specified min', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.randInteger(25, 35);
                assert.strictEqual(n < 25, false);
            }
        });

        it('should not return a value more than specified max', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.randInteger(25, 35);
                assert.strictEqual(n > 35, false);
            }
        });

        it('should only return integer values', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.randInteger(25, 35);
                assert.strictEqual(Number.isInteger(n), true);
            }
        });
    });

    describe('cryptoRandInteger function', () => {

        it('should not return a value less than specified min', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.cryptoRandInteger(25, 35);
                assert.strictEqual(n < 25, false);
            }
        });

        it('should not return a value more than specified max', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.cryptoRandInteger(25, 35);
                assert.strictEqual(n > 35, false);
            }
        });

        it('should only return integer values', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.cryptoRandInteger(25, 35);
                assert.strictEqual(Number.isInteger(n), true);
            }
        });
    });

    describe('randNumber function', () => {

        it('should not return a value less than specified min', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.randNumber(25, 35);
                assert.strictEqual(n < 25, false);
            }
        });

        it('should not return a value more than specified max', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.randNumber(25, 35);
                assert.strictEqual(n > 35, false);
            }
        });
    });

    describe('cryptoRandNumber function', () => {

        it('should not return a value less than specified min', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.cryptoRandNumber(25, 35);
                assert.strictEqual(n < 25, false);
            }
        });

        it('should not return a value more than specified max', () => {
            for (let i = 0; i < 1000; i++) {
                const n = mu.cryptoRandNumber(25, 35);
                assert.strictEqual(n > 35, false);
            }
        });
    });

    describe('randChars function', () => {

        it('should return a string of the specified length', () => {
            const str = mu.randChars(128);
            assert.strictEqual(typeof str, 'string');
            assert.strictEqual(str.length, 128);
        });

        it('should only return characters in the Base58 character set', () => {
            const str = mu.randChars(4096);
            for (let i = 0; i < str.length; i++) {
                const char = str.charAt(i);
                assert.strictEqual(mu.BASE58_READABLE_CHARS.indexOf(char) !== -1, true);
            }
        });

        it('should only return characters in specified character set (when specified)', () => {
            const str = mu.randChars(4096, 'ABCDEFG');
            for (let i = 0; i < str.length; i++) {
                const char = str.charAt(i);
                assert.strictEqual('ABCDEFG'.indexOf(char) !== -1, true);
            }
        });
    });

    describe('cryptoRandChars function', () => {

        it('should return a string of the specified length', () => {
            const str = mu.cryptoRandChars(128);
            assert.strictEqual(typeof str, 'string');
            assert.strictEqual(str.length, 128);
        });

        it('should only return characters in the Base58 character set', () => {
            const str = mu.cryptoRandChars(4096);
            for (let i = 0; i < str.length; i++) {
                const char = str.charAt(i);
                assert.strictEqual(mu.BASE58_READABLE_CHARS.indexOf(char) !== -1, true);
            }
        });

        it('should only return characters in specified character set (when specified)', () => {
            const str = mu.cryptoRandChars(4096, 'ABCDEFG');
            for (let i = 0; i < str.length; i++) {
                const char = str.charAt(i);
                assert.strictEqual('ABCDEFG'.indexOf(char) !== -1, true);
            }
        });
    });
});