'use strict';

const
    assert = require('assert'),
    MUHighLowAverage = require('./../libs/class.HighLowAverage');


describe('HighLowAverage', () => {

    let hla;

    function globalBE() {
        hla = new MUHighLowAverage();
    }

    beforeEach(globalBE);

    it('should return 0 from "count" property by default', () => {
        assert.strictEqual(hla.count, 0);
    });

    it('should return 0 from "high" property by default', () => {
        assert.strictEqual(hla.high, 0);
    });

    it('should return 0 from "average" property by default', () => {
        assert.strictEqual(hla.average, 0);
    });

    it('should return 0 from "low" property by default', () => {
        assert.strictEqual(hla.low, 0);
    });

    describe('add function', () => {
        beforeEach(globalBE);

        it('should change "count" value', () => {
            hla.add(2);
            hla.add(1n);
            hla.add('3');
            assert.strictEqual(hla.count, 3);
        });

        it('should change "high" value', () => {
            hla.add(2);
            hla.add(1n);
            hla.add('3');
            assert.strictEqual(hla.high, 3);
        });

        it('should change "low" value', () => {
            hla.add(2);
            hla.add(1n);
            hla.add('3');
            assert.strictEqual(hla.low, 1);
        });

        it('should change "average" value', () => {
            hla.add(2);
            hla.add(1n);
            hla.add('3');
            assert.strictEqual(hla.average, 2);
        });
    });

    describe('clear function', () => {
        beforeEach(globalBE);

        it('should change "count" value', () => {
            hla.add(2);
            hla.add(1n);
            hla.add('3');
            hla.clear();
            assert.strictEqual(hla.count, 0);
        });

        it('should change "high" value', () => {
            hla.add(2);
            hla.add(1n);
            hla.add('3');
            hla.clear();
            assert.strictEqual(hla.high, 0);
        });

        it('should change "low" value', () => {
            hla.add(2);
            hla.add(1n);
            hla.add('3');
            hla.clear();
            assert.strictEqual(hla.low, 0);
        });

        it('should change "average" value', () => {
            hla.add(2);
            hla.add(1n);
            hla.add('3');
            hla.clear();
            assert.strictEqual(hla.average, 0);
        });
    });

    context('filter function', () => {

        it('should receive correct arguments', done => {
            hla = new MUHighLowAverage(null, (a, b, c) => {
                assert.strictEqual(a, 0);
                assert.strictEqual(b, 'b');
                assert.strictEqual(c, true);
                done();
            });

            hla.add(0, 'b', true);
            assert.strictEqual(hla.count, 1);
        });

        it('should filter values', () => {
            hla = new MUHighLowAverage(null, (a, b, c) => {
                return false;
            });

            hla.add(0, 'b', true);
            assert.strictEqual(hla.count, 0);
        });
    });

    describe('instanceof handling', () => {
        beforeEach(globalBE);

        it('should return true when the instance is exact', () => {
            assert.strictEqual(hla instanceof MUHighLowAverage, true);
        });

        it('should return false when the instance is NOT exact', () => {

            class NotHighLowAverage {}
            const not = new NotHighLowAverage();

            assert.strictEqual(not instanceof MUHighLowAverage, false);
        });

        it('should return true when the instance extends the valid class', () => {

            class ExtendedHighLowAverage extends MUHighLowAverage {}
            const extended = new ExtendedHighLowAverage();

            assert.strictEqual(extended instanceof MUHighLowAverage, true);
        });

        it('should return true if the instance meets all of the API criteria', () => {

            class HighLowAverage {
                add() {}
                clear() {}
                get count() {}
                get high() {}
                get average() {}
                get low() {}
            }

            const substitute = new HighLowAverage();

            assert.strictEqual(substitute instanceof MUHighLowAverage, true);
        });
    });
});