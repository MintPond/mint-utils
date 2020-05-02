'use strict';

const
    assert = require('assert'),
    MUEntryCounter = require('./../libs/class.EntryCounter');


describe('EntryCounter', () => {

    let counter;

    function globalBE() {
        counter = new MUEntryCounter();
    }

    beforeEach(globalBE);

    it('should return 0 from "count" property by default', () => {
        assert.strictEqual(counter.count, 0);
    });

    describe('increment function', () => {

        beforeEach(globalBE);

        it('should increment count by 1', () => {
            counter.increment();
            assert.strictEqual(counter.count, 1);
        });

        it('should increment count by specified amount', () => {
            counter.increment(3);
            assert.strictEqual(counter.count, 3);
        });
    });

    describe('clear function', () => {

        beforeEach(globalBE);

        it('should reset count to 0', () => {
            counter.increment();
            counter.clear();
            assert.strictEqual(counter.count, 0);
        });
    });


    context('filter function', () => {

        it('should receive correct arguments', done => {
            counter = new MUEntryCounter(null, (a, b, c) => {
                assert.strictEqual(a, 1);
                assert.strictEqual(b, 'b');
                assert.strictEqual(c, true);
                done();
            });

            counter.increment(1, 'b', true);
            assert.strictEqual(counter.count, 1);
        });

        it('should filter values', () => {
            counter = new MUEntryCounter(null, (a, b, c) => {
                return false;
            });

            counter.increment(1, 'b', true);
            assert.strictEqual(counter.count, 0);
        });
    });
});