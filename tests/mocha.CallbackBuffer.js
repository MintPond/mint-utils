'use strict';

const
    assert = require('assert'),
    MUCallbackBuffer = require('./../libs/class.CallbackBuffer');


describe('CallbackBuffer', () => {

    let callbacks;

    describe('addCallback function', () => {
        beforeEach(() => { callbacks = new MUCallbackBuffer(); });

        it('should not call callback', () => {
            callbacks.addCallback('key', () => {
                throw new Error('called');
            });
        });

        it('should allow no callback', () => {
            callbacks.addCallback('key');
        });

        it('should return true for first callback', () => {
            const shouldContinue = callbacks.addCallback('key', () => {});
            assert.strictEqual(shouldContinue, true);
        });

        it('should return true for first callback of a unique key', () => {
            callbacks.addCallback('key1', () => {});
            const shouldContinue = callbacks.addCallback('key2', () => {});
            assert.strictEqual(shouldContinue, true);
        });

        it('should return false after first callback', () => {
            callbacks.addCallback('key', () => {});
            const shouldContinue = callbacks.addCallback('key', () => {});
            assert.strictEqual(shouldContinue, false);
        });

        it('should return false after first callback of a unique key', () => {
            callbacks.addCallback('key1', () => {});
            callbacks.addCallback('key2', () => {});
            const shouldContinue = callbacks.addCallback('key2', () => {});
            assert.strictEqual(shouldContinue, false);
        });

        it('should return true after for first callback after "callback" function called', () => {
            callbacks.addCallback('key1', () => {});
            callbacks.addCallback('key2', () => {});
            callbacks.callback('key2');
            const shouldContinue = callbacks.addCallback('key2', () => {});
            assert.strictEqual(shouldContinue, true);
        });
    });


    describe('callback function', () => {
        beforeEach(() => { callbacks = new MUCallbackBuffer(); });

        it('should only run callbacks with same key', () => {
            const array = [];
            callbacks.addCallback('wrongKey', () => { throw new Error('called'); });
            callbacks.addCallback('wrongKey', () => { throw new Error('called'); });
            callbacks.addCallback('key', () => { array.push(1); });
            callbacks.addCallback('key', () => { array.push(2); });
            callbacks.callback('key');
            assert.strictEqual(array.length, 2);
        });

        it('should call callbacks in same order they were added', () => {
            const array = [];
            callbacks.addCallback('key', () => { assert.strictEqual(array.length, 0); array.push(1); });
            callbacks.addCallback('key', () => { assert.strictEqual(array.length, 1); array.push(2); });
            callbacks.addCallback('key', () => { assert.strictEqual(array.length, 2); array.push(3); });
            callbacks.addCallback('key', () => { assert.strictEqual(array.length, 3); array.push(4); });
            callbacks.callback('key');
            assert.strictEqual(array.length, 4);
        });

        it('should clear callbacks before calling them', () => {
            let isCalled = false;
            callbacks.addCallback('key', () => {
                assert.strictEqual(callbacks._callbackMap.size, 0);
                isCalled = true;
            });

            assert.strictEqual(callbacks._callbackMap.size, 1);
            callbacks.callback('key');
            assert.strictEqual(isCalled, true);
        });

        it('should pass arguments to callbacks', () => {
            let isCalled = false;
            callbacks.addCallback('key', (a, b, c) => {
                assert.strictEqual(a, 1);
                assert.strictEqual(b, 2);
                assert.strictEqual(c, 3);
                isCalled = true;
            });

            callbacks.callback('key', 1, 2, 3);
            assert.strictEqual(isCalled, true);
        });
    });
});