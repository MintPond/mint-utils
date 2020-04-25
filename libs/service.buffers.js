'use strict';

const
    crypto = require('crypto'),
    precon = require('@mintpond/mint-precon');

const BUFFER1 = Buffer.alloc(1);
const BUFFER2 = Buffer.alloc(2);
const BUFFER4 = Buffer.alloc(4);
const BUFFER8 = Buffer.alloc(8);
const BUFFER16 = Buffer.alloc(16);
const BUFFER32 = Buffer.alloc(32);
const BUFFER64 = Buffer.alloc(64);
const BUFFER2_ZERO = Buffer.alloc(2, 0);


module.exports = {

    /**
     * Perform SHA256 hashing operation on buffer.
     *
     * @param buffer {Buffer} The Buffer to hash.
     * @returns {Buffer} The hash result.
     */
    sha256: sha256,

    /**
     * Perform SHA256d hashing operation on buffer.
     *
     * @param buffer {Buffer} The buffer to hash.
     * @returns {Buffer} The hash result.
     */
    sha256d: sha256d,

    /**
     * Reverse the bytes in a buffer.
     *
     * @param buffer   {Buffer} The input buffer.
     * @param [output] {Buffer} Optional output buffer. If not specified then the input buffer is the output.
     * @returns {Buffer}
     */
    reverseBytes: reverseBytes,

    /**
     * Reverse every 4-bytes in a buffer.
     *
     * @param buffer   {Buffer} The input buffer.
     * @param [output] {Buffer} Optional output buffer. If not specified then the input buffer is the output.
     * @returns {Buffer}
     */
    reverseDWords: reverseDWords,

    /**
     * Convert little endian buffer to big endian hex string.
     *
     * @param buffer {Buffer} The buffer to convert
     * @returns {string} Big endian hex string.
     */
    leToHex: leToHex,

    /**
     * Convert big endian hex string to little endian buffer.
     *
     * @param hex {string} The hex string to convert.
     * @returns {Buffer} Little endian buffer.
     */
    hexToLE: hexToLE,

    /**
     * Pack number into var length Buffer according to bitcoin variable length integer.
     * https://en.bitcoin.it/wiki/Protocol_specification#Variable_length_integer
     *
     * @param num {number} The number to pack.
     * @returns {Buffer}
     */
    packVarInt: packVarInt,

    /**
     * Pack number into 2-byte unsigned little-endian Buffer.
     *
     * @param num {number} The number to pack.
     * @param [output] {Buffer} Optional output buffer.
     * @returns {Buffer}
     */
    packUInt16LE: packUInt16LE,

    /**
     * Pack number into 2-byte little-endian Buffer.
     *
     * @param num  {number} The number to pack.
     * @param [output] {Buffer} Optional output buffer.
     * @returns {Buffer}
     */
    packInt32LE: packInt32LE,

    /**
     * Pack number into 4-byte big-endian Buffer.
     *
     * @param num {number} The number to pack.
     * @param [output] {Buffer} Optional output buffer.
     * @returns {Buffer}
     */
    packInt32BE: packInt32BE,

    /**
     * Pack number into 4-byte unsigned little-endian Buffer.
     *
     * @param num {number} The number to pack.
     * @param [output] {Buffer} Optional output buffer.
     * @returns {Buffer}
     */
    packUInt32LE: packUInt32LE,

    /**
     * Pack number into 4-byte unsigned big-endian Buffer.
     *
     * @param num {number} The number to pack.
     * @param [output] {Buffer} Optional output buffer.
     * @returns {Buffer}
     */
    packUInt32BE: packUInt32BE,

    /**
     * Pack number into 8-byte little-endian Buffer.
     *
     * @param num {number} The number to pack.
     * @param [output] {Buffer} Optional output buffer.
     * @returns {Buffer}
     */
    packInt64LE: packInt64LE,

    /**
     * Read 8-byte signed little-endian number.
     *
     * @param buffer {Buffer} The buffer to read.
     * @param [offset=0] {number} The offset in the buffer to start reading at.
     * @returns {number}
     */
    readInt64LE: readInt64LE,

    /**
     * Pack number into 8-byte unsigned little-endian Buffer.
     *
     * @param num {number} The number to pack.
     * @param [output] {Buffer} Optional output buffer.
     * @returns {Buffer}
     */
    packUInt64LE: packUInt64LE,

    /**
     * Read 8-byte unsigned little-endian number.
     *
     * @param buffer {Buffer} The buffer to read.
     * @param [offset=0] {number} The offset in the buffer to start reading at.
     * @returns {number}
     */
    readUInt64LE: readUInt64LE,

    /**
     * Pack number into 32-byte unsigned little-endian Buffer.
     *
     * @param hex      {number|string} The number to pack. Can be a Number type or a string hex value.
     * @param [output] {Buffer} Optional output buffer.
     *
     * @returns {Buffer}
     */
    packUInt256LE: packUInt256LE,

    /**
     * Convert bitcoin target buffer to bits.
     *
     * @param targetBuff {Buffer} The buffer containing target value.
     * @returns {Buffer}
     */
    targetToBits: targetToBits,

    /**
     * Convert bitcoin bits buffer to target.
     *
     * @param bitsBuff {Buffer} The buffer containing bits value.
     * @returns {Buffer}
     */
    bitsToTarget: bitsToTarget
};


function sha256(buffer) {
    precon.buffer(buffer, 'buffer');

    const hash1 = crypto.createHash('sha256');
    hash1.update(buffer);
    return hash1.digest();
}


function sha256d(buffer) {
    return sha256(sha256(buffer));
}


function reverseBytes(buffer, output) {
    precon.buffer(buffer, 'buffer');
    precon.opt_buffer(output, 'output');

    output = output || buffer;
    const halfLen = buffer.length / 2;
    for (let i = 0; i < halfLen; i++) {
        const byte = buffer[i];
        output[i] = buffer[buffer.length - i - 1];
        output[buffer.length - i - 1] = byte;
    }
    return output;
}


function reverseDWords(buffer, output) {
    precon.buffer(buffer, 'buffer');
    precon.opt_buffer(output, 'output');

    output = output || buffer;
    for (let i = 0; i < buffer.length; i+=4) {
        output.writeUInt32LE(buffer.readUInt32BE(i), i);
    }
    return output;
}


function leToHex(buffer) {
    precon.buffer(buffer, 'buffer');

    return reverseBytes(buffer, _getTempBuffer(buffer.length)).toString('hex');
}


function hexToLE(hex) {
    precon.string(hex, 'hex');

    return reverseBytes(Buffer.from(hex, 'hex'));
}


function packVarInt(num) {
    precon.positiveInteger(num, 'n');

    if (num < 0xFD) {
        return Buffer.alloc(1, num);
    }
    else if (num <= 0xFFFF) {

        const buff = Buffer.alloc(3, 0);
        buff.writeUInt8(0xFD, 0);
        buff.writeUInt16LE(num, 1);
        return buff;
    }
    else if (num <= 0xFFFFFFFF) {

        const buff = Buffer.alloc(5, 0);
        buff.writeUInt8(0xFE, 0);
        buff.writeUInt32LE(num, 1);
        return buff;
    }
    else {

        const buff = Buffer.alloc(9, 0);
        buff.writeUInt8(0xFF, 0);
        buff.writeInt32LE(num & -1, 1);
        buff.writeUInt32LE(Math.floor(num / 0x100000000), 5);
        return buff;
    }
}


function packUInt16LE(num, output) {
    precon.positiveInteger(num, 'num');
    precon.opt_buffer(output, 'output');

    output = output || Buffer.alloc(2);
    output.writeUInt16LE(num, 0);
    return output;
}


function packInt32LE(num, output) {
    precon.integer(num, 'num');
    precon.opt_buffer(output, 'output');

    output = output || Buffer.alloc(4);
    output.writeInt32LE(num, 0);
    return output;
}


function packInt32BE(num, output) {
    precon.integer(num, 'num');
    precon.opt_buffer(output, 'output');

    output = output || Buffer.alloc(4);
    output.writeInt32BE(num, 0);
    return output;
}


function packUInt32LE(num, output) {
    precon.integer(num, 'num');
    precon.opt_buffer(output, 'output');

    output = output || Buffer.alloc(4);
    output.writeUInt32LE(num, 0);
    return output;
}


function packUInt32BE(num, output) {
    precon.positiveInteger(num, 'num');
    precon.opt_buffer(output, 'output');

    output = output || Buffer.alloc(4);
    output.writeUInt32BE(num, 0);
    return output;
}


function packInt64LE(num, output) {
    precon.integer(num, 'num');
    precon.opt_buffer(output, 'output');

    const max32 = Math.pow(2, 32);
    output = output || Buffer.alloc(8);

    output.writeInt32LE(num % max32, 0);
    output.writeInt32LE(Math.floor(num / max32), 4);
    return output;
}


function readInt64LE(buffer, offset) {
    precon.buffer(buffer, 'buffer');
    precon.opt_positiveInteger(offset, 'offset');

    offset = offset || 0;

    let rightBi = BigInt(buffer.readInt32LE(offset));
    let leftBi = BigInt(buffer.readInt32LE(offset + 4));
    leftBi <<= 32n;

    return Number(leftBi | rightBi);
}


function packUInt64LE(num, output) {
    precon.positiveInteger(num, 'num');
    precon.opt_buffer(output, 'output');

    const max32 = Math.pow(2, 32);
    output = output || Buffer.alloc(8);

    output.writeUInt32LE(num % max32, 0);
    output.writeUInt32LE(Math.floor(num / max32), 4);
    return output;
}


function readUInt64LE(buffer, offset) {
    precon.buffer(buffer, 'buffer');
    precon.opt_positiveInteger(offset, 'offset');

    offset = offset || 0;

    let rightBi = BigInt(buffer.readUInt32LE(offset));
    let leftBi = BigInt(buffer.readUInt32LE(offset + 4));
    leftBi <<= 32n;

    return Number(leftBi | rightBi);
}


function packUInt256LE(hex, output) {
    precon.opt_buffer(output, 'output', 32);

    if (typeof hex === 'number')
        hex = _toFixedHex(hex, 32);

    precon.string(hex, 'hex');

    const buffer = reverseBytes(Buffer.from(hex, 'hex'));

    if (buffer.length !== 32) {
        const resized = output || Buffer.alloc(32, 0);
        buffer.copy(resized, 0);
        return resized;
    }

    output && buffer.copy(output);
    return output || buffer;
}


function targetToBits(targetBuff) {
    precon.buffer(targetBuff, 'targetBuff');

    const buffer = targetBuff.readUInt8(0) > 0x7F
        ? Buffer.concat([BUFFER2_ZERO, targetBuff])
        : targetBuff;

    BUFFER64.writeUInt8(buffer.length, 0);
    buffer.copy(BUFFER64, 1);

    const resultBuf = Buffer.alloc(4);
    BUFFER64.copy(resultBuf,0);

    return resultBuf;
}


function bitsToTarget(bitsBuff) {
    precon.buffer(bitsBuff, 'bitsBuff');

    const numBytes = bitsBuff.readUInt8(0);

    BUFFER4.writeUInt8(0, 0);
    bitsBuff.copy(BUFFER4, 1, 1);

    let bitsBi = BigInt(BUFFER4.readUInt32BE(0));
    bitsBi = bitsBi * (2n ** (8n * BigInt(numBytes - 3)));

    const bitsHex = bitsBi.toString(16).padStart(numBytes * 2, '0');
    return Buffer.from(bitsHex, 'hex');
}


function _toFixedHex(number, sizeBytes) {

    const hex = number.toString(16);
    const zeroPadLen = sizeBytes * 2 - hex.length;

    if (zeroPadLen <= 0) {
        return hex;
    }
    else {
        return '0'.repeat(zeroPadLen) + hex;
    }
}


function _getTempBuffer(size) {
    switch (size) {
        case 64:
            return BUFFER64;
        case 32:
            return BUFFER32;
        case 16:
            return BUFFER16;
        case 8:
            return BUFFER8;
        case 4:
            return BUFFER4;
        case 2:
            return BUFFER2;
        case 1:
            return BUFFER1;
        default:
            return Buffer.alloc(size);
    }
}