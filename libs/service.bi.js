'use strict';

const
    precon = require('@mintpond/mint-precon'),
    buffers = require('./service.buffers');

const BUFFER1 = Buffer.alloc(1);
const BUFFER2 = Buffer.alloc(2);
const BUFFER4 = Buffer.alloc(4);
const BUFFER8 = Buffer.alloc(8);
const BUFFER16 = Buffer.alloc(16);
const BUFFER32 = Buffer.alloc(32);
const BUFFER64 = Buffer.alloc(64);


/**
 * BigInt conversion utilities.
 */
module.exports = {

    /**
     * Convert BigInt to hex string in big-endian format.
     *
     * @param bi   {BigInt} The BigInt value to convert.
     * @param size {number} The size in bytes of the hex value.
     * @returns {string} Big-endian hex value.
     */
    toHexBE: toHexBE,

    /**
     * Convert difficulty bits to target. https://en.bitcoin.it/wiki/Target
     *
     * @param bitsBuff {Buffer} The buffer containing bits value.
     * @returns {BigInt}
     */
    fromBits: fromBits,

    /**
     * Convert difficulty bits hex into target. https://en.bitcoin.it/wiki/Target
     *
     * @param bitsHex {string} The hex bits to convert.
     * @returns {BigInt}
     */
    fromBitsHex: fromBitsHex,

    /**
     * Convert a Buffer containing a little-endian number to BigInt.
     *
     * @param buffer {Buffer} The buffer to convert.
     * @returns {BigInt}
     */
    fromBufferLE: fromBufferLE,

    /**
     * Convert a Buffer containing a big-endian number to BigInt.
     *
     * @param buffer {Buffer} The buffer to convert.
     * @returns {BigInt}
     */
    fromBufferBE: fromBufferBE,

    /**
     * Convert a BigInt value to a postive value.
     *
     * @param bi {BigInt}
     * @returns bi {BigInt}
     */
    abs: abs,

    /**
     * Convert a number object map to an object map with BigInt numbers in satoshi units.
     *
     * @param oMap {object}
     * @returns {object} biStOMap
     */
    oMapToBiStOMap: oMapToBiStOMap,

    /**
     * Convert a BigInt object map to an object map with string values.
     *
     * @param biStOMap {object}
     * @returns {object} oMap
     */
    biStOMapToOMap: biStOMapToOMap
};


function toHexBE(bi, size) {
    precon.bigint(bi, 'bi');
    precon.positiveInteger(size, 'size');

    size *= 2;
    const hex = bi.toString(16);
    const padLen = size - hex.length;
    if (padLen < 0) {
        throw new Error(`BigInt value is too large to fit in ${size} bytes.`);
    }
    else if (padLen > 0) {
        return '0'.repeat(padLen) + hex;
    }
    else {
        return hex;
    }
}


function fromBits(bitsBuff) {
    precon.buffer(bitsBuff, 'bitsBuff');

    const numBytes = bitsBuff.readUInt8(0);
    const bitsBi = BigInt('0x' + bitsBuff.slice(1).toString('hex'));
    return bitsBi * (2n ** (8n * (BigInt(numBytes) - 3n)));
}


function fromBitsHex(bitsHex) {
    precon.string(bitsHex, 'bitsHex');

    const buffer = Buffer.from(bitsHex, 'hex');
    return fromBits(buffer);
}


function fromBufferLE(buffer) {
    precon.buffer(buffer, 'buffer');

    return BigInt('0x' + buffers.reverseBytes(buffer, _getTempBuffer(buffer.length)).toString('hex'));
}


function fromBufferBE(buffer) {
    precon.buffer(buffer, 'buffer');

    return BigInt('0x' + buffer.toString('hex'));
}


function abs(bi) {
    precon.bigint(bi, 'bi');

    return bi < 0 ? bi * -1n : bi;
}


function oMapToBiStOMap(oMap) {
    const biOMap = {};
    Object.keys(oMap).forEach(key => {
        let value = oMap[key];
        if (typeof value === 'number') {
            value = value * 100000000;
        }
        else if (typeof value === 'string') {
            value = parseFloat(value);
            if (isNaN(value)) {
                value = 0;
            }
            value = value * 100000000;
        }
        else {
            throw new Error(`Unexpected value type: ${typeof value}`);
        }
        biOMap[key] = BigInt(value);
    });
    return biOMap;
}


function biStOMapToOMap(biStOMap) {
    const oMap = {};
    Object.keys(biStOMap).forEach(key => {
        oMap[key] = (Number(biStOMap[key]) / 100000000).toString();
    });
    return oMap;
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
