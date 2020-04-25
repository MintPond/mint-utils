'use strict';

const
    assert = require('assert'),
    passwords = require('../libs/service.passwords');


describe('service.passwords', () => {

    describe('hash', () => {
        it ('should return correct result', () => {
            const hashData = passwords.hash('123321', '4efc8a');
            assert.strictEqual(hashData.saltHex, '4efc8a');
            assert.strictEqual(hashData.hashHex, '4498177a988ae43534d195a8bdaa54a51e3a93df0be7bc070fd28ac18ed28512b2d99072f2ef1574291b9bd3eaea1e73822131ca179a917cbf828aac2664f7dd');
        });
    });

    describe('isMatch', () => {
        it ('should match hash result', () => {
            const hashData = passwords.hash('123321');
            const isMatch = passwords.isMatch(
                '123321',
                hashData.hashHex,
                hashData.saltHex);

            assert.strictEqual(isMatch, true);
        });
        it('should return true if password is matched', () => {
            const isMatch = passwords.isMatch(
                '123321',
                '4498177a988ae43534d195a8bdaa54a51e3a93df0be7bc070fd28ac18ed28512b2d99072f2ef1574291b9bd3eaea1e73822131ca179a917cbf828aac2664f7dd',
                '4efc8a');

            assert.strictEqual(isMatch, true);
        });
        it('should return false if salt is incorrect', () => {
            const isMatch = passwords.isMatch(
                '123321',
                '4498177a988ae43534d195a8bdaa54a51e3a93df0be7bc070fd28ac18ed28512b2d99072f2ef1574291b9bd3eaea1e73822131ca179a917cbf828aac2664f7dd',
                'bbbbbb');

            assert.strictEqual(isMatch, false);
        });
        it('should return false if password is incorrect', () => {
            const isMatch = passwords.isMatch(
                'abcdefg',
                '4498177a988ae43534d195a8bdaa54a51e3a93df0be7bc070fd28ac18ed28512b2d99072f2ef1574291b9bd3eaea1e73822131ca179a917cbf828aac2664f7dd',
                'bbbbbb');

            assert.strictEqual(isMatch, false);
        });
    });
});