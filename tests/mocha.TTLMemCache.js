'use strict';

const
    assert = require('assert'),
    MUTTLMemCache = require('./../libs/class.TTLMemCache');


describe('TTLMemCache', () => {

    let cache;

    function resetBE() {
        cache = new MUTTLMemCache({
            ttl: 1,
            isResetOnAccess: true
        });
    }

    function noResetBE() {
        cache = new MUTTLMemCache({
            ttl: 1,
            isResetOnAccess: false
        });
    }

    function globalAE() {
        cache.destroy();
    }

    context('general', () => {
        beforeEach(resetBE);
        afterEach(globalAE);

        it('should have correct defaultTTL property value', () => {
            assert.strictEqual(cache.defaultTTL, 1);
        });

        it('should have correct "isResetOnAccess" property value', () => {
            assert.strictEqual(cache.isResetOnAccess, true);
        });

        it('should have correct "size" property value', () => {
            assert.strictEqual(cache.isResetOnAccess, true);
        });

        it('should be able to get a value that is set', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            const value1 = cache.get('key1');
            const value2 = cache.get('key2');
            assert.strictEqual(value1, 'value1');
            assert.strictEqual(value2, 'value2');
        });

        it('should NOT be able to get a value after it expires', done => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2', 2);
            setTimeout(() => {
                const value1 = cache.get('key1');
                const value2 = cache.get('key2');
                assert.strictEqual(value1, undefined);
                assert.strictEqual(value2, 'value2');
                done();
            }, 1100);
        });

        it('should be able to delete a value', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.delete('key1');
            assert.strictEqual(cache.get('key1'), undefined);
            assert.strictEqual(cache.get('key2'), 'value2');
        });

        it('should be able to clear values', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');
            cache.clear();
            assert.strictEqual(cache.get('key1'), undefined);
            assert.strictEqual(cache.get('key2'), undefined);
            assert.strictEqual(cache.get('key3'), undefined);
        });
    });

    context('Reset on access', () => {
        beforeEach(resetBE);
        afterEach(globalAE);

        it('should be able to get a value whose TTL is reset', done => {
            cache.set('key', 'value');
            setTimeout(() => {
                cache.get('key');
            }, 500);
            setTimeout(() => {
                const value = cache.get('key');
                assert.strictEqual(value, 'value');
                done();
            }, 1100);
        });

        it('should NOT be able to get a value after it expires', done => {
            cache.set('key', 'value');
            setTimeout(() => {
                cache.get('key');
            }, 500);
            setTimeout(() => {
                const value = cache.get('key');
                assert.strictEqual(value, undefined);
                done();
            }, 1750);
        });
    });

    context('Do not reset on access', () => {
        beforeEach(noResetBE);
        afterEach(globalAE);

        it('should NOT reset TTL on access', done => {
            cache.set('key', 'value');
            setTimeout(() => {
                cache.get('key');
            }, 500);
            setTimeout(() => {
                const value = cache.get('key');
                assert.strictEqual(value, undefined);
                done();
            }, 1100);
        });
    });
});