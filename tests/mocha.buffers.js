'use strict';

const
    assert = require('assert'),
    buffers = require('./../libs/service.buffers');


describe('buffers', () => {

    describe('sha256 function', () => {

        it('should return sha256 hash Buffer', () => {
            const inputBuf = Buffer.from('Input data', 'utf8');

            const hashBuf = buffers.sha256(inputBuf);
            assert.strictEqual(hashBuf.toString('hex'), '9a732b7b43a6af29dbc6f80a6dfbf9707713323aa0729700aabf5f519078c1e3');
        });
    });

    describe('sha256d function', () => {

        it('should return sha256d hash Buffer', () => {
            const inputBuf = Buffer.from('Input data', 'utf8');

            const hashBuf = buffers.sha256d(inputBuf);
            assert.strictEqual(hashBuf.toString('hex'), 'c42c6e661bdab2487848e887169f5d9ad229b17a1df892189ea34f0798175758');
        });
    });

    describe('reverseBytes function', () => {

        it('should reverse bytes of a buffer', () => {
            const inputBuf = Buffer.from('0a0b0c0d', 'hex');

            const reversedBuf = buffers.reverseBytes(inputBuf);
            assert.strictEqual(reversedBuf.toString('hex'), '0d0c0b0a');
        });

        it('should modify original buffer', () => {
            const inputBuf = Buffer.from('0a0b0c0d', 'hex');
            buffers.reverseBytes(inputBuf);
            assert.strictEqual(inputBuf.toString('hex'), '0d0c0b0a');
        });

        it('should NOT modify original buffer if alternative output is provided', () => {
            const inputBuf = Buffer.from('0a0b0c0d', 'hex');
            const outputBuf = Buffer.alloc(inputBuf.length);
            buffers.reverseBytes(inputBuf, outputBuf);
            assert.strictEqual(inputBuf.toString('hex'), '0a0b0c0d');
            assert.strictEqual(outputBuf.toString('hex'), '0d0c0b0a');
        });
    });

    describe('reverseDWords function', () => {

        it('should reverse 4-byte chunks of a buffer', () => {
            const inputBuf = Buffer.from('8899aabbccddeeff', 'hex');
            const reversedBuf = buffers.reverseDWords(inputBuf);
            assert.strictEqual(reversedBuf.toString('hex'), 'bbaa9988ffeeddcc');
        });

        it('should modify original buffer', () => {
            const inputBuf = Buffer.from('8899aabbccddeeff', 'hex');
            buffers.reverseDWords(inputBuf);
            assert.strictEqual(inputBuf.toString('hex'), 'bbaa9988ffeeddcc');
        });

        it('should NOT modify original buffer if alternative output is provided', () => {
            const inputBuf = Buffer.from('8899aabbccddeeff', 'hex');
            const outputBuf = Buffer.alloc(inputBuf.length);
            buffers.reverseDWords(inputBuf, outputBuf);
            assert.strictEqual(inputBuf.toString('hex'), '8899aabbccddeeff');
            assert.strictEqual(outputBuf.toString('hex'), 'bbaa9988ffeeddcc');
        });
    });

    describe('leToHex function', () => {

        it('should return big-endian hex from little-endian buffer', () => {
            const buffer = Buffer.from('89abcdef', 'hex');
            const hex = buffers.leToHex(buffer);
            assert.strictEqual(hex, 'efcdab89');
        });
    });

    describe('hexToLE function', () => {

        it('should return little-endian buffer from big-endian hex', () => {
            const buffer = buffers.hexToLE('efcdab89');
            assert.strictEqual(buffer.toString('hex'), '89abcdef');
        });
    });

    describe('packVarInt function', () => {

        it('should return Buffer from integer (< 0xfd)', () => {
            const buffer = buffers.packVarInt(10);
            assert.strictEqual(buffer.toString('hex'), '0a');
        });

        it('should return Buffer from integer (<= 0xffff)', () => {
            const buffer = buffers.packVarInt(0xffaa);
            assert.strictEqual(buffer.toString('hex'), 'fdaaff');
        });

        it('should return Buffer from integer (<= 0xffffffff)', () => {
            const buffer = buffers.packVarInt(0xffffffaa);
            assert.strictEqual(buffer.toString('hex'), 'feaaffffff');
        });

        it('should return Buffer from integer (> 0xffffffff)', () => {
            const buffer = buffers.packVarInt(0xffffffffaabb);
            assert.strictEqual(buffer.toString('hex'), 'ffbbaaffffffff0000');
        });
    });

    describe('packUInt16LE function', () => {

        it('should return 2-byte little-endian Buffer from integer', () => {
            const buffer = buffers.packUInt16LE(10);
            assert.strictEqual(buffer.toString('hex'), '0a00');
        });

        it('should return result in output Buffer if provided', () => {
            const outputBuf = Buffer.alloc(2);
            const buffer = buffers.packUInt16LE(10, outputBuf);
            assert.strictEqual(outputBuf.toString('hex'), '0a00');
            assert.strictEqual(outputBuf, buffer);
        });
    });

    describe('packInt32LE function', () => {

        it('should return 4-byte little-endian Buffer from integer', () => {
            const buffer = buffers.packInt32LE(-10);
            assert.strictEqual(buffer.toString('hex'), 'f6ffffff');
        });

        it('should return result in output Buffer if provided', () => {
            const outputBuf = Buffer.alloc(4);
            const buffer = buffers.packInt32LE(-10, outputBuf);
            assert.strictEqual(outputBuf.toString('hex'), 'f6ffffff');
            assert.strictEqual(outputBuf, buffer);
        });
    });

    describe('packUInt32LE function', () => {

        it('should return 4-byte little-endian Buffer from integer', () => {
            const buffer = buffers.packUInt32LE(10);
            assert.strictEqual(buffer.toString('hex'), '0a000000');
        });

        it('should return result in output Buffer if provided', () => {
            const outputBuf = Buffer.alloc(4);
            const buffer = buffers.packUInt32LE(10, outputBuf);
            assert.strictEqual(outputBuf.toString('hex'), '0a000000');
            assert.strictEqual(outputBuf, buffer);
        });
    });

    describe('packInt32BE function', () => {

        it('should return 4-byte big-endian Buffer from integer', () => {
            const buffer = buffers.packInt32BE(-10);
            assert.strictEqual(buffer.toString('hex'), 'fffffff6');
        });

        it('should return result in output Buffer if provided', () => {
            const outputBuf = Buffer.alloc(4);
            const buffer = buffers.packInt32BE(-10, outputBuf);
            assert.strictEqual(outputBuf.toString('hex'), 'fffffff6');
            assert.strictEqual(outputBuf, buffer);
        });
    });

    describe('packUInt32BE function', () => {

        it('should return 4-byte big-endian Buffer from integer', () => {
            const buffer = buffers.packUInt32BE(10);
            assert.strictEqual(buffer.toString('hex'), '0000000a');
        });

        it('should return result in output Buffer if provided', () => {
            const outputBuf = Buffer.alloc(4);
            const buffer = buffers.packUInt32BE(10, outputBuf);
            assert.strictEqual(outputBuf.toString('hex'), '0000000a');
            assert.strictEqual(outputBuf, buffer);
        });
    });

    describe('packInt64LE function', () => {

        it('should return 8-byte little-endian Buffer from integer', () => {
            const buffer = buffers.packInt64LE(-10);
            assert.strictEqual(buffer.toString('hex'), 'f6ffffffffffffff');
        });

        it('should return result in output Buffer if provided', () => {
            const outputBuf = Buffer.alloc(8);
            const buffer = buffers.packInt64LE(-10, outputBuf);
            assert.strictEqual(outputBuf.toString('hex'), 'f6ffffffffffffff');
            assert.strictEqual(outputBuf, buffer);
        });
    });

    describe('readInt64LE function', () => {

        it('should read value serialized by packInt64LE (0)', () => {
            const buffer = buffers.packInt64LE(0);
            const num = buffers.readInt64LE(buffer, 0);
            assert.strictEqual(num, 0);
        });

        it('should read value serialized by packInt64LE (-10)', () => {
            const buffer = buffers.packInt64LE(-10);
            const num = buffers.readInt64LE(buffer, 0);
            assert.strictEqual(num, -10);
        });

        it('should read value serialized by packInt64LE (-4294967296‬)', () => {
            const buffer = buffers.packInt64LE(-4294967296);
            const num = buffers.readInt64LE(buffer, 0);
            assert.strictEqual(num, -4294967296);
        });

        it('should read value serialized by packInt64LE (8589934592‬)', () => {
            const buffer = buffers.packInt64LE(8589934592);
            const num = buffers.readInt64LE(buffer, 0);
            assert.strictEqual(num, 8589934592);
        });
    });

    describe('packUInt64LE function', () => {

        it('should return 8-byte little-endian Buffer from integer', () => {
            const buffer = buffers.packUInt64LE(10);
            assert.strictEqual(buffer.toString('hex'), '0a00000000000000');
        });

        it('should return result in output Buffer if provided', () => {
            const outputBuf = Buffer.alloc(8);
            const buffer = buffers.packUInt64LE(10, outputBuf);
            assert.strictEqual(outputBuf.toString('hex'), '0a00000000000000');
            assert.strictEqual(outputBuf, buffer);
        });
    });

    describe('readUInt64LE function', () => {

        it('should read value serialized by packUInt64LE (0)', () => {
            const buffer = buffers.packUInt64LE(0);
            const num = buffers.readUInt64LE(buffer, 0);
            assert.strictEqual(num, 0);
        });

        it('should read value serialized by packUInt64LE (10)', () => {
            const buffer = buffers.packUInt64LE(10);
            const num = buffers.readUInt64LE(buffer, 0);
            assert.strictEqual(num, 10);
        });

        it('should read value serialized by packUInt64LE (4294967296‬)', () => {
            const buffer = buffers.packUInt64LE(4294967296);
            const num = buffers.readUInt64LE(buffer, 0);
            assert.strictEqual(num, 4294967296);
        });

        it('should read value serialized by packUInt64LE (9007199254740991‬)', () => {
            const buffer = buffers.packUInt64LE(9007199254740991);
            const num = buffers.readUInt64LE(buffer, 0);
            assert.strictEqual(num, 9007199254740991);
        });
    });

    describe('packUInt256LE function', () => {

        it('should return 32-byte little-endian Buffer from integer', () => {
            const buffer = buffers.packUInt256LE(10);
            assert.strictEqual(buffer.toString('hex'), '0a00000000000000000000000000000000000000000000000000000000000000');
        });

        it('should return result in output Buffer if provided', () => {
            const outputBuf = Buffer.alloc(32);
            const buffer = buffers.packUInt256LE(10, outputBuf);
            assert.strictEqual(outputBuf.toString('hex'), '0a00000000000000000000000000000000000000000000000000000000000000');
            assert.strictEqual(outputBuf, buffer);
        });
    });
});