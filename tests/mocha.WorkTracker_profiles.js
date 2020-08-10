'use strict';

const
    assert = require('assert'),
    WorkTracker = require('./../libs/class.WorkTracker');


describe('WorkTracker', () => {

    let workTracker;
    let profile;

    function globalBe() {
        workTracker = new WorkTracker('contextName');
        profile = workTracker.createProfile('profileName');
    }

    function globalAe() {
        workTracker.destroy();
    }

    describe('createProfile function', () => {
        beforeEach(globalBe);
        afterEach(globalAe);

        it('should return an object with "getStatus" function', () => {
            assert.strictEqual(typeof profile.getStatus, 'function');
        });

        it('should return an object with "reset" function', () => {
            assert.strictEqual(typeof profile.reset, 'function');
        });

        it('should return an object with "complete" function', () => {
            assert.strictEqual(typeof profile.complete, 'function');
        });
    });

    describe('WorkTracker "increment" function', () => {
        beforeEach(globalBe);
        afterEach(globalAe);

        it('should increment profile count by 1', () => {
            workTracker.increment('count');

            const tracker = profile.trackerMap.get('count');
            assert.strictEqual(tracker.count, 1);
        });
    });

    describe('WorkTracker "start" function', () => {
        beforeEach(globalBe);
        afterEach(globalAe);

        it('should increment profile tracker "count" by 1', () => {
            workTracker.start('tracker');

            const tracker = profile.trackerMap.get('tracker');
            assert.strictEqual(tracker.count, 1);
        });

        it('should increment profile tracker "inProgress" by 1', () => {
            workTracker.start('tracker');

            const tracker = profile.trackerMap.get('tracker');
            assert.strictEqual(tracker.inProgress, 1);
        });

        it('should cause profile "isWorking" property to return true', () => {
            workTracker.start('tracker');

            assert.strictEqual(profile.isWorking, true);
        });
    });


    describe('WorkTracker "stop" function', () => {
        beforeEach(globalBe);

        it('should not change count', () => {
            workTracker.start('tracker');

            const tracker = profile.trackerMap.get('tracker');
            assert.strictEqual(tracker.count, 1);

            workTracker.stop('tracker');
            assert.strictEqual(tracker.count, 1);
        });

        it('should decrement inProgress by 1', () => {
            workTracker.start('tracker');
            workTracker.start('tracker');
            workTracker.start('tracker');

            const tracker = profile.trackerMap.get('tracker');
            assert.strictEqual(tracker.inProgress, 3);

            workTracker.stop('tracker');
            assert.strictEqual(tracker.inProgress, 2);
        });

        it('should cause "isWorking" property to return false when inProgress is 0', () => {
            workTracker.start('tracker');
            workTracker.start('tracker');

            assert.strictEqual(profile.isWorking, true);

            workTracker.stop('tracker');

            assert.strictEqual(profile.isWorking, true);

            workTracker.stop('tracker');

            assert.strictEqual(profile.isWorking, false);
        });

        it('should remove name of tracker from "inProgressArr" property', () => {

            assert.strictEqual(profile.inProgressArr.indexOf('tracker') !== -1, false);

            workTracker.start('tracker');
            workTracker.start('tracker');

            assert.strictEqual(profile.inProgressArr.indexOf('tracker') !== -1, true);

            workTracker.stop('tracker');

            assert.strictEqual(profile.inProgressArr.indexOf('tracker') !== -1, true);

            workTracker.stop('tracker');

            assert.strictEqual(profile.inProgressArr.indexOf('tracker') !== -1, false);
        });
    });
});