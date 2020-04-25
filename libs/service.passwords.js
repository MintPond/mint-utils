'use strict';

const
    crypto = require('crypto'),
    precon = require('@mintpond/mint-precon');

const STRONG_PASSWORD_CHARS = '0123456789abcdefgijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!#@$&*-_+|\\/?<>';
const ALPHA_NUMERIC_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE58_READABLE_CHARS = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';


module.exports = {

    get STRONG_PASSWORD_CHARS() { return STRONG_PASSWORD_CHARS },
    get ALPHA_NUMERIC_CHARS() { return ALPHA_NUMERIC_CHARS },
    get BASE58_READABLE_CHARS() { return BASE58_READABLE_CHARS },

    /**
     * Hash a password using sha512 and a salt.
     *
     * @param password {string} The password to hash.
     * @param [saltHex]  {string} Hash salt hex.
     *
     * @returns {{salt: string, hash: string}}
     */
    hash: hash,

    /**
     * Determine if a password matches a hash and salt string.
     *
     * @param password {string} The password to check.
     * @param hashHex  {string} The hash string.
     * @param saltHex  {string} The salt string.
     *
     * @returns {boolean} True if match, otherwise false.
     */
    isMatch: isMatch,

    /**
     * Make a random salt hex string of the specified byte length.
     *
     * @param len {number} The length in bytes.
     *
     * @returns {string}  The salt hex string.
     */
    makeSaltHex: makeSaltHex
};


function hash(password, saltHex) {
    precon.string(password, 'password');
    precon.opt_string(saltHex, 'salt');

    saltHex = saltHex || makeSaltHex(6);
    const hash = crypto.createHmac('sha512', saltHex);
    hash.update(password);

    return {
        saltHex: saltHex,
        hashHex: hash.digest('hex')
    };
}


function isMatch(password, hashHex, saltHex) {
    precon.string(password, 'password');
    precon.string(hashHex, 'hashHex');
    precon.string(saltHex, 'saltHex');

    const hashed = hash(password, saltHex);
    return hashed.hashHex === hashHex;
}


function makeSaltHex(len) {
    return crypto.randomBytes(len)
        .toString('hex')
        .slice(0,len * 2);
}