'use strict';

const
    assert = require('assert'),
    mu = require('./../index');


describe('mint-utils', () => {

    describe('throw function', () => {

        it('should throw exception when a string message is used', () => {
            let isThrown = false;
            try {
                mu.throw('error');
            }
            catch (err) {
                assert.strictEqual(err.message, 'error');
                isThrown = true;
            }
            assert.strictEqual(isThrown, true);
        });

        it('should throw exception when an object message is used', () => {
            let isThrown = false;
            try {
                mu.throw({});
            }
            catch (err) {
                isThrown = true;
            }
            assert.strictEqual(isThrown, true);
        });

        it('should throw exception when an Error object is used', () => {
            let isThrown = false;
            try {
                mu.throw(new Error('error instance'));
            }
            catch (err) {
                assert.strictEqual(err.message, 'error instance');
                isThrown = true;
            }
            assert.strictEqual(isThrown, true);
        });

        it('should NOT throw exception when a callback is used', () => {
            let isThrown = false;
            try {
                mu.throw('error', () => {});
            }
            catch (err) {
                isThrown = true;
            }
            assert.strictEqual(isThrown, false);
        });

        it('should pass exception as error in callback', done => {
            mu.throw('error', (err) => {
                assert.strictEqual(err instanceof Error, true);
                assert.strictEqual(err.message, 'error');
                done();
            });
        });
    });
});