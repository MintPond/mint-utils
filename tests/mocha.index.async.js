'use strict';

const
    assert = require('assert'),
    mu = require('./../index');


describe('mint-utils (async)', () => {

    describe('each function', () => {

        it('should absorb exceptions into a callback error', done => {
            const array = [1, 2, 3];
            mu.each(array, (num, eCallback) => {
                throw new Error('error');
            }, err => {
                assert.strictEqual(err instanceof Error, true);
                done();
            });
        });
    });

    describe('eachSeries function', () => {

        it('should absorb exceptions into a callback error', done => {
            const array = [1, 2, 3];
            mu.eachSeries(array, (num, eCallback) => {
                throw new Error('error');
            }, err => {
                assert.strictEqual(err instanceof Error, true);
                done();
            });
        });
    });

    describe('eachLimit function', () => {

        it('should absorb exceptions into a callback error', done => {
            const array = [1, 2, 3];
            mu.eachLimit(array, 1, (num, eCallback) => {
                throw new Error('error');
            }, err => {
                assert.strictEqual(err instanceof Error, true);
                done();
            });
        });
    });

    describe('parallel function', () => {

        it('should absorb exceptions into a callback error', done => {
            const taskArr = [
                pCallback => {
                    setImmediate(pCallback);
                },
                pCallback => {
                    throw new Error('error');
                }
            ];
            mu.parallel(taskArr, err => {
                assert.strictEqual(err instanceof Error, true);
                done();
            });
        });
    });

    describe('series function', () => {

        it('should absorb exceptions into a callback error', done => {
            const taskArr = [
                sCallback => {
                    setImmediate(sCallback);
                },
                sCallback => {
                    throw new Error('error');
                }
            ];
            mu.series(taskArr, err => {
                assert.strictEqual(err instanceof Error, true);
                done();
            });
        });
    });

    describe('waterfall function', () => {

        it('should absorb exceptions into a callback error', done => {
            const taskArr = [
                wCallback => {
                    setImmediate(wCallback);
                },
                wCallback => {
                    throw new Error('error');
                }
            ];
            mu.waterfall(taskArr, err => {
                assert.strictEqual(err instanceof Error, true);
                done();
            });
        });
    });
});