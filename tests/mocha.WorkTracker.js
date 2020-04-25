'use strict';

const
    assert = require('assert'),
    WorkTracker = require('./../libs/class.WorkTracker');


describe('WorkTracker', () => {

    let workTracker;

    function globalBe() {
        workTracker = new WorkTracker('contextName');
    }

    beforeEach(globalBe);

    it('should return correct value from "contextName" property', () => {
        assert.strictEqual(workTracker.contextName, 'contextName');
    });

    it('should return false by default from "timingsEnabled" property', () => {
        assert.strictEqual(workTracker.timingsEnabled, false);
    });

    it('should return false by default from "isWorking" property', () => {
        assert.strictEqual(workTracker.isWorking, false);
    });

    describe('createChild function', () => {
        beforeEach(globalBe);

        it('should return a WorkTracker instance', () => {
            const child = workTracker.createChild('childName');
            assert.strictEqual(child instanceof WorkTracker, true);
        });

        it('should return a WorkTracker instance with correct context name', () => {
            const child = workTracker.createChild('childName');
            assert.strictEqual(child.contextName, 'childName');
        });
    });

    describe('increment function', () => {
        beforeEach(globalBe);

        it('should increment count by 1', () => {
            workTracker.increment('count');

            const tracker = workTracker._trackerMap.get('count');
            assert.strictEqual(tracker.count, 1);
        });
    });

    describe('start function', () => {
        beforeEach(globalBe);

        it('should increment count by 1', () => {
            workTracker.start('tracker');

            const tracker = workTracker._trackerMap.get('tracker');
            assert.strictEqual(tracker.count, 1);
        });

        it('should increment inProgress by 1', () => {
            workTracker.start('tracker');

            const tracker = workTracker._trackerMap.get('tracker');
            assert.strictEqual(tracker.inProgress, 1);
        });

        it('should cause "isWorking" property to return true', () => {
            workTracker.start('tracker');

            assert.strictEqual(workTracker.isWorking, true);
        });

        it('should return a function', () => {
            const funct = workTracker.start('tracker');

            assert.strictEqual(typeof funct, 'function');
        });
    });


    describe('start function return value', () => {
        beforeEach(globalBe);

        it('should call stop function when called', () => {
            let isStopCalled = false;
            workTracker.stop = function() {
                isStopCalled = true;
            };

            const done = workTracker.start('tracker');

            assert.strictEqual(isStopCalled, false);

            done();

            assert.strictEqual(isStopCalled, true);
        });

        it('should call stop function with correct tracker name when called', () => {

            workTracker.stop = function(trackerName) {
                assert.strictEqual(trackerName, 'tracker');
            };

            const done = workTracker.start('tracker');
            done();
        });
    });


    describe('stop function', () => {
        beforeEach(globalBe);

        it('should not change count', () => {
            workTracker.start('tracker');

            const tracker = workTracker._trackerMap.get('tracker');
            assert.strictEqual(tracker.count, 1);

            workTracker.stop('tracker');
            assert.strictEqual(tracker.count, 1);
        });

        it('should decrement inProgress by 1', () => {
            workTracker.start('tracker');
            workTracker.start('tracker');
            workTracker.start('tracker');

            const tracker = workTracker._trackerMap.get('tracker');
            assert.strictEqual(tracker.inProgress, 3);

            workTracker.stop('tracker');
            assert.strictEqual(tracker.inProgress, 2);
        });

        it('should cause "isWorking" property to return false when inProgress is 0', () => {
            workTracker.start('tracker');
            workTracker.start('tracker');

            assert.strictEqual(workTracker.isWorking, true);

            workTracker.stop('tracker');

            assert.strictEqual(workTracker.isWorking, true);

            workTracker.stop('tracker');

            assert.strictEqual(workTracker.isWorking, false);
        });

        it('should remove name of tracker from "inProgressArr" property', () => {

            assert.strictEqual(workTracker.inProgressArr.indexOf('tracker') !== -1, false);

            workTracker.start('tracker');
            workTracker.start('tracker');

            assert.strictEqual(workTracker.inProgressArr.indexOf('tracker') !== -1, true);

            workTracker.stop('tracker');

            assert.strictEqual(workTracker.inProgressArr.indexOf('tracker') !== -1, true);

            workTracker.stop('tracker');

            assert.strictEqual(workTracker.inProgressArr.indexOf('tracker') !== -1, false);
        });

        it('should throw if called too many times', () => {

            assert.strictEqual(workTracker.inProgressArr.indexOf('tracker') !== -1, false);

            workTracker.start('tracker');
            workTracker.start('tracker');

            workTracker.stop('tracker');
            workTracker.stop('tracker');

            try {
                workTracker.stop('tracker');
            }
            catch (err) {
                return;
            }

            throw new Error('Exception expected');
        });

        it('should emit EVENT_WORK_DONE event when inProgress reaches 0', () => {
            let isEventEmitted = false;

            workTracker.on(WorkTracker.EVENT_WORK_DONE, () => {
                isEventEmitted = true;
            });

            workTracker.start('tracker');
            assert.strictEqual(isEventEmitted, false);

            workTracker.start('tracker');
            assert.strictEqual(isEventEmitted, false);

            workTracker.stop('tracker');
            assert.strictEqual(isEventEmitted, false);

            workTracker.stop('tracker');
            assert.strictEqual(isEventEmitted, true);
        });

        it('should emit EVENT_WORK_DONE event in parents when inProgress reaches 0', () => {
            let isEventEmitted = false;

            workTracker.on(WorkTracker.EVENT_WORK_DONE, () => {
                isEventEmitted = true;
            });

            const child = workTracker.createChild('child');

            child.start('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child.start('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child.stop('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child.stop('childTracker');
            assert.strictEqual(isEventEmitted, true);
        });

        it('should NOT emit EVENT_WORK_DONE event in parents while parent is working', () => {
            let isEventEmitted = false;

            workTracker.on(WorkTracker.EVENT_WORK_DONE, () => {
                isEventEmitted = true;
            });

            workTracker.start('tracker');
            assert.strictEqual(isEventEmitted, false);

            const child = workTracker.createChild('child');

            child.start('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child.start('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child.stop('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child.stop('childTracker');
            assert.strictEqual(isEventEmitted, false);

            workTracker.stop('tracker');
            assert.strictEqual(isEventEmitted, true);
        });

        it('should NOT emit EVENT_WORK_DONE event in parents while another child is working', () => {
            let isEventEmitted = false;

            workTracker.on(WorkTracker.EVENT_WORK_DONE, () => {
                isEventEmitted = true;
            });

            const child1 = workTracker.createChild('child1');
            const child2 = workTracker.createChild('child2');

            child1.start('childTracker');
            child2.start('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child1.start('childTracker');
            child2.start('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child1.stop('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child1.stop('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child2.stop('childTracker');
            assert.strictEqual(isEventEmitted, false);

            child2.stop('childTracker');
            assert.strictEqual(isEventEmitted, true);
        });
    });


    describe('getStatus function', () => {
        beforeEach(globalBe);

        it('should include "inProgress" value in returned tracker status', () => {
            const status = workTracker.getStatus('tracker');
            assert.strictEqual(status.inProgress, 0);
        });

        it('should include "count" value in returned tracker status', () => {
            const status = workTracker.getStatus('tracker');
            assert.strictEqual(status.count, 0);
        });

        it('should include "stopWatch" data in returned tracker status', () => {
            const status = workTracker.getStatus('tracker');
            assert.strictEqual(typeof status.stopWatch, 'object');
        });
    });


    describe('reset function', () => {
        beforeEach(globalBe);

        it('should reset timings values', () => {
            workTracker.start('tracker');
            workTracker.start('tracker');
            workTracker.reset();
            const status = workTracker.getStatus('tracker');
            assert.strictEqual(status.count, 0);
        });

        it('should NOT reset tracker values', () => {
            workTracker.start('tracker');
            workTracker.start('tracker');
            workTracker.reset();
            const status = workTracker.getStatus('tracker');
            assert.strictEqual(status.inProgress, 2);
        });

        it('should reset child timings values', () => {
            const child = workTracker.createChild('child');
            child.start('childTracker');
            child.start('childTracker');
            workTracker.reset();
            const status = child.getStatus('childTracker');
            assert.strictEqual(status.count, 0);
        });
    });

});