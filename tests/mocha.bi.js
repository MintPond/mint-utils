'use strict';

const
    assert = require('assert'),
    bi = require('./../libs/service.bi');


describe('bi', () => {

    describe('toHexBE function', () => {

        it('should return a big-endian hex string of a BigInt value (1 bytes)', () => {
            const hex = bi.toHexBE(10n, 1);
            assert.strictEqual(hex, '0a');
        });

        it('should return a big-endian hex string of a BigInt value (2 bytes)', () => {
            const hex = bi.toHexBE(10n, 2);
            assert.strictEqual(hex, '000a');
        });

        it('should return a big-endian hex string of a BigInt value (3 bytes)', () => {
            const hex = bi.toHexBE(10n, 3);
            assert.strictEqual(hex, '00000a');
        });

        it('should return a big-endian hex string of a BigInt value (4 bytes)', () => {
            const hex = bi.toHexBE(10n, 4);
            assert.strictEqual(hex, '0000000a');
        });

        it('should return a big-endian hex string of a BigInt value (8 bytes)', () => {
            const hex = bi.toHexBE(10n, 8);
            assert.strictEqual(hex, '000000000000000a');
        });
    });

    describe('fromBufferLE function', () => {

        it('should return a BigInt from a little-endian Buffer value', () => {
            const buffer = Buffer.alloc(4);
            buffer.writeUInt32LE(10, 0);

            const result = bi.fromBufferLE(buffer);
            assert.strictEqual(result, 10n);
        });
    });

    describe('fromBits function', () => {

        it('should return a BigInt from a little-endian Buffer value', () => {
            const bitsBuffer = Buffer.from('1b0a83fb', 'hex');

            const result = bi.fromBits(bitsBuffer);
            assert.strictEqual(result.toString(10), '4325845829636524888355142773635293687657689947486055992458739712');
        });
    });

    describe('fromBitsHex function', () => {

        it('should return a BigInt from a hex value', () => {
            const result = bi.fromBitsHex('1b0a83fb');
            assert.strictEqual(result.toString(10), '4325845829636524888355142773635293687657689947486055992458739712');
        });
    });

});