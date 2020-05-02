'use strict';

const
    assert = require('assert'),
    MUWorkTracker = require('./../libs/class.WorkTracker');


describe('WorkTracker', () => {

    let workTracker;

    function globalBe() {
        workTracker = new MUWorkTracker('contextName');
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
            assert.strictEqual(child instanceof MUWorkTracker, true);
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

            workTracker.on(MUWorkTracker.EVENT_WORK_DONE, () => {
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

            workTracker.on(MUWorkTracker.EVENT_WORK_DONE, () => {
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

            workTracker.on(MUWorkTracker.EVENT_WORK_DONE, () => {
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

            workTracker.on(MUWorkTracker.EVENT_WORK_DONE, () => {
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

    describe('profile property', () => {
        beforeEach(globalBe);

        it('should return object', () => {
            assert.strictEqual(typeof workTracker.profile, 'object');
        });

        it('should return object with contextName value', () => {
            assert.strictEqual(workTracker.profile.contextName, 'contextName');
        });

        it('should return object with isWorking value', () => {
            assert.strictEqual(workTracker.profile.isWorking, false);
        });

        it('should return object with timingsEnabled value', () => {
            assert.strictEqual(workTracker.profile.timingsEnabled, false);
        });

        it('should return object with total value', () => {
            assert.strictEqual(workTracker.profile.total, 0);
        });

        it('should return object with localTotal value', () => {
            assert.strictEqual(workTracker.profile.localTotal, 0);
        });

        it('should return object with inProgress value', () => {
            assert.deepEqual(workTracker.profile.inProgress, []);
        });

        it('should return object with children value', () => {
            assert.deepEqual(workTracker.profile.children, []);
        });

        context('1 start call', () => {
            beforeEach(globalBe);
            beforeEach(() => { workTracker.start('myTaskName'); });

            it('should return object with isWorking value', () => {
                assert.strictEqual(workTracker.profile.isWorking, true);
            });

            it('should return object with timingsEnabled value', () => {
                assert.strictEqual(workTracker.profile.timingsEnabled, false);
            });

            it('should return object with total value', () => {
                assert.strictEqual(workTracker.profile.total, 1);
            });

            it('should return object with localTotal value', () => {
                assert.strictEqual(workTracker.profile.localTotal, 1);
            });

            it('should return object with inProgress value', () => {
                assert.deepEqual(workTracker.profile.inProgress, ['myTaskName']);
            });

            it('should return object with children value', () => {
                assert.deepEqual(workTracker.profile.children, []);
            });
        });

        context('1 start call, 1 stop call', () => {
            beforeEach(globalBe);
            beforeEach(() => {
                workTracker.start('myTaskName');
                workTracker.stop('myTaskName');
            });

            it('should return object with isWorking value', () => {
                assert.strictEqual(workTracker.profile.isWorking, false);
            });

            it('should return object with timingsEnabled value', () => {
                assert.strictEqual(workTracker.profile.timingsEnabled, false);
            });

            it('should return object with total value', () => {
                assert.strictEqual(workTracker.profile.total, 0);
            });

            it('should return object with localTotal value', () => {
                assert.strictEqual(workTracker.profile.localTotal, 0);
            });

            it('should return object with inProgress value', () => {
                assert.deepEqual(workTracker.profile.inProgress, []);
            });

            it('should return object with children value', () => {
                assert.deepEqual(workTracker.profile.children, []);
            });
        });

        context('1 child', () => {
            beforeEach(globalBe);
            beforeEach(() => { workTracker.createChild('myChild'); });

            it('should return object with children value', () => {
                assert.strictEqual(workTracker.profile.children.length, 1);
                assert.strictEqual(workTracker.profile.children[0].contextName, 'myChild');
            });

        });

        context('1 child with 1 start call', () => {
            beforeEach(globalBe);
            beforeEach(() => {
                const myChild = workTracker.createChild('myChild');
                myChild.start('myTask');
            });

            it('should return object with contextName value', () => {
                assert.strictEqual(workTracker.profile.contextName, 'contextName');
            });

            it('should return object with isWorking value', () => {
                assert.strictEqual(workTracker.profile.isWorking, true);
            });

            it('should return object with timingsEnabled value', () => {
                assert.strictEqual(workTracker.profile.timingsEnabled, false);
            });

            it('should return object with total value', () => {
                assert.strictEqual(workTracker.profile.total, 1);
            });

            it('should return object with localTotal value', () => {
                assert.strictEqual(workTracker.profile.localTotal, 0);
            });

            it('should return object with inProgress value', () => {
                assert.deepEqual(workTracker.profile.inProgress, []);
            });

            it('should return object with children value', () => {
                assert.strictEqual(workTracker.profile.children.length, 1);
                assert.strictEqual(workTracker.profile.children[0].contextName, 'myChild');
                assert.strictEqual(workTracker.profile.children[0].isWorking, true);
                assert.strictEqual(workTracker.profile.children[0].total, 1);
                assert.strictEqual(workTracker.profile.children[0].localTotal, 1);
                assert.deepEqual(workTracker.profile.children[0].inProgress, ['myTask']);
            });
        });

        context('1 child with 1 start call and 1 stop call', () => {
            beforeEach(globalBe);
            beforeEach(() => {
                const myChild = workTracker.createChild('myChild');
                myChild.start('myTask');
                myChild.stop('myTask');
            });

            it('should return object with contextName value', () => {
                assert.strictEqual(workTracker.profile.contextName, 'contextName');
            });

            it('should return object with isWorking value', () => {
                assert.strictEqual(workTracker.profile.isWorking, false);
            });

            it('should return object with timingsEnabled value', () => {
                assert.strictEqual(workTracker.profile.timingsEnabled, false);
            });

            it('should return object with total value', () => {
                assert.strictEqual(workTracker.profile.total, 0);
            });

            it('should return object with localTotal value', () => {
                assert.strictEqual(workTracker.profile.localTotal, 0);
            });

            it('should return object with inProgress value', () => {
                assert.deepEqual(workTracker.profile.inProgress, []);
            });

            it('should return object with children value', () => {
                assert.strictEqual(workTracker.profile.children.length, 1);
                assert.strictEqual(workTracker.profile.children[0].contextName, 'myChild');
                assert.strictEqual(workTracker.profile.children[0].isWorking, false);
                assert.strictEqual(workTracker.profile.children[0].total, 0);
                assert.strictEqual(workTracker.profile.children[0].localTotal, 0);
                assert.deepEqual(workTracker.profile.children[0].inProgress, []);
            });
        });
    });
});