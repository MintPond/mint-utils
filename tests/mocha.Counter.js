'use strict';

const
    assert = require('assert'),
    MUCounter = require('./../libs/class.Counter');


describe('Counter', () => {

    let counter;

    context('Empty constructor', () => {

        describe('next function', () => {
            beforeEach(() => { counter = new MUCounter(); });

            it ('should start at 0', () => {
                const c = counter.next();
                assert.strictEqual(c, 0);
            });

            it ('should increment by 1 each call.', () => {
                for (let i = 0; i < 10; i++) {
                    const c = counter.next();
                    assert.strictEqual(c, i);
                }
            });

            it ('should loop to 0 when it exceeds 4294967295', () => {
                counter._counter = 4294967295;
                const c1 = counter.next();
                assert.strictEqual(c1, 4294967295);

                const c2 = counter.next();
                assert.strictEqual(c2, 0);
            });
        });

        describe('nextHex32 function', () => {
            beforeEach(() => { counter = new MUCounter(); });

            it ('should start at 0x00000000', () => {
                const hex = counter.nextHex32();
                assert.strictEqual(hex, '00000000');
            });

            it ('should increment by 1 each call.', () => {
                let hex = counter.nextHex32();
                assert.strictEqual(hex, '00000000');
                hex = counter.nextHex32();
                assert.strictEqual(hex, '00000001');
                hex = counter.nextHex32();
                assert.strictEqual(hex, '00000002');
            });

            it ('should loop to 0 when it exceeds 0xffffffff', () => {
                counter._counter = 4294967295;
                const c1 = counter.nextHex32();
                assert.strictEqual(c1, 'ffffffff');

                const c2 = counter.nextHex32();
                assert.strictEqual(c2, '00000000');
            });
        });

        describe('reset function', () => {
            beforeEach(() => { counter = new MUCounter(); });

            it ('should reset value to 0', () => {
                counter.next();
                counter.next();
                counter.next();
                const c1 = counter.next();
                assert.strictEqual(c1, 3);

                counter.reset();
                const c2 = counter.next();
                assert.strictEqual(c2, 0);
            });
        });
    });


    context('Non empty constructor', () => {

        describe('next function', () => {
            beforeEach(() => { counter = new MUCounter(10, -10, 12); });

            it ('should start at 10', () => {
                const c = counter.next();
                assert.strictEqual(c, 10);
            });

            it ('should loop to -10 when it exceeds 12', () => {
                counter._counter = 12;
                const c1 = counter.next();
                assert.strictEqual(c1, 12);

                const c2 = counter.next();
                assert.strictEqual(c2, -10);
            });
        });

        describe('nextHex32 function', () => {
            beforeEach(() => { counter = new MUCounter(10, -10, 12); });

            it ('should start at 0x0000000a', () => {
                const hex = counter.nextHex32();
                assert.strictEqual(hex, '0000000a');
            });

            it ('should loop to 0x0000000a when it exceeds 0xffffffff', () => {
                counter._counter = 4294967295;
                const c1 = counter.nextHex32();
                assert.strictEqual(c1, 'ffffffff');

                const c2 = counter.nextHex32();
                assert.strictEqual(c2, '0000000a');
            });
        });

        describe('reset function', () => {
            beforeEach(() => { counter = new MUCounter(10, -10, 12); });

            it ('should reset value to 10', () => {
                counter.next();
                counter.next();
                const c1 = counter.next();
                assert.strictEqual(c1, 12);

                counter.reset();
                const c2 = counter.next();
                assert.strictEqual(c2, 10);
            });
        });
    });
});