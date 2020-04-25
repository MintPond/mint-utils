'use strict';

const
    assert = require('assert'),
    mu = require('./../index');


describe('mint-utils (time)', () => {

    describe('isTimeInMs function', () => {

        it('should identify time in milliseconds correctly', () => {
            assert.strictEqual(mu.isTimeInMs(Date.now()), true);
        });

        it('should identify time in seconds correctly', () => {
            assert.strictEqual(mu.isTimeInMs(mu.now()), false);
        });
    });

    describe('truncTimeMinute function', () => {

        it('should remove seconds from epoch time in seconds', () => {
            assert.strictEqual(mu.truncTimeMinute(1585004347), 1585004340);
            assert.strictEqual(mu.truncTimeMinute(1585004393), 1585004340);
            assert.strictEqual(mu.truncTimeMinute(1585004429), 1585004400);
        });

        it('should remove seconds from epoch time in milliseconds and return time in seconds', () => {
            assert.strictEqual(mu.truncTimeMinute(1585004573777), 1585004520);
            assert.strictEqual(mu.truncTimeMinute(1585004590437), 1585004580);
            assert.strictEqual(mu.truncTimeMinute(1585004604809), 1585004580);
        });
    });

    describe('getDayStartTime function', () => {

        it('should return the epoch time at the start of the day of the specified time.', () => {
            assert.strictEqual(mu.getDayStartTime(1585004966), 1584921600);
            assert.strictEqual(mu.getDayStartTime(1585004993849), 1584921600);
        });

        it('should return the correct epoch time when using offsetDays parameter.', () => {
            assert.strictEqual(mu.getDayStartTime(1585004966, 1), 1584921600 + 86400);
            assert.strictEqual(mu.getDayStartTime(1585004966, -1), 1584921600 - 86400);
            assert.strictEqual(mu.getDayStartTime(1585004993849, 1), 1584921600 + 86400);
            assert.strictEqual(mu.getDayStartTime(1585004993849, -1), 1584921600 - 86400);
        });
    });

    describe('getDayEndTime function', () => {

        it('should return the epoch time at the end of the day of the specified time.', () => {
            assert.strictEqual(mu.getDayEndTime(1585004966), 1584921600 + 86400);
            assert.strictEqual(mu.getDayEndTime(1585004993849), 1584921600 + 86400);
        });

        it('should return the correct epoch time when using offsetDays parameter.', () => {
            assert.strictEqual(mu.getDayEndTime(1585004966, 1), 1584921600 + 86400 + 86400);
            assert.strictEqual(mu.getDayEndTime(1585004966, -1), 1584921600 + 86400 - 86400);
            assert.strictEqual(mu.getDayEndTime(1585004993849, 1), 1584921600 + 86400 + 86400);
            assert.strictEqual(mu.getDayEndTime(1585004993849, -1), 1584921600 + 86400 - 86400);
        });
    });

    describe('getMonthStartTime function', () => {

        it('should return the epoch time at the start of the month of the specified time.', () => {
            assert.strictEqual(mu.getMonthStartTime(1585004966), 1583020800);
            assert.strictEqual(mu.getMonthStartTime(1585004993849), 1583020800);
        });

        it('should return the correct epoch time when using monthOffset parameter.', () => {
            assert.strictEqual(mu.getMonthStartTime(1585004966, 1), 1585699200);
            assert.strictEqual(mu.getMonthStartTime(1585004966, -1), 1580515200);
            assert.strictEqual(mu.getMonthStartTime(1585004993849, 1), 1585699200);
            assert.strictEqual(mu.getMonthStartTime(1585004993849, -1), 1580515200);
        });
    });

    describe('getMonthEndTime function', () => {

        it('should return the epoch time at the end of the month of the specified time.', () => {
            assert.strictEqual(mu.getMonthEndTime(1585004966), 1585699199);
            assert.strictEqual(mu.getMonthEndTime(1585004993849), 1585699199);
        });

        it('should return the correct epoch time when using monthOffset parameter.', () => {
            assert.strictEqual(mu.getMonthEndTime(1585004966, 1), 1588291199);
            assert.strictEqual(mu.getMonthEndTime(1585004966, -1), 1583020799);
            assert.strictEqual(mu.getMonthEndTime(1585004993849, 1), 1588291199);
            assert.strictEqual(mu.getMonthEndTime(1585004993849, -1), 1583020799);
        });
    });

    describe('getWeekStartTime function', () => {

        it('should return the epoch time at the start of the week of the specified time.', () => {
            assert.strictEqual(mu.getWeekStartTime(1585004966), 1584835200);
            assert.strictEqual(mu.getWeekStartTime(1585004993849), 1584835200);
        });

        it('should return the correct epoch time when using weekOffset parameter.', () => {
            assert.strictEqual(mu.getWeekStartTime(1585004966, 1), 1585440000);
            assert.strictEqual(mu.getWeekStartTime(1585004966, -1), 1584230400);
            assert.strictEqual(mu.getWeekStartTime(1585004993849, 1), 1585440000);
            assert.strictEqual(mu.getWeekStartTime(1585004993849, -1), 1584230400);
        });
    });

    describe('getWeekEndTime function', () => {

        it('should return the epoch time at the end of the week of the specified time.', () => {
            assert.strictEqual(mu.getWeekEndTime(1585004966), 1585526399);
            assert.strictEqual(mu.getWeekEndTime(1585004993849), 1585526399);
        });

        it('should return the correct epoch time when using weekOffset parameter.', () => {
            assert.strictEqual(mu.getWeekEndTime(1585004966, 1), 1586131199);
            assert.strictEqual(mu.getWeekEndTime(1585004966, -1), 1584921599);
            assert.strictEqual(mu.getWeekEndTime(1585004993849, 1), 1586131199);
            assert.strictEqual(mu.getWeekEndTime(1585004993849, -1), 1584921599);
        });
    });

    describe('getW3CDateString function', () => {

        it('should return the W3C formatted date string from epoch time in seconds.', () => {
            assert.strictEqual(mu.getW3CDateString(1585004966), '2020-03-23');
        });

        it('should return the W3C formatted date string from epoch time in milliseconds.', () => {
            assert.strictEqual(mu.getW3CDateString(1585004993849, 1), '2020-03-23');
        });
    });

    describe('getW3CDateUtcString function', () => {

        it('should return the W3C formatted date string from epoch time in seconds.', () => {
            assert.strictEqual(mu.getW3CDateUtcString(1585004966), '2020-03-23');
        });

        it('should return the W3C formatted date string from epoch time in milliseconds.', () => {
            assert.strictEqual(mu.getW3CDateUtcString(1585004993849), '2020-03-23');
        });
    });

    describe('getW3CDateTimeUtcString function', () => {

        it('should return the W3C formatted date/time UTC string from epoch time in seconds.', () => {
            assert.strictEqual(mu.getW3CDateTimeUtcString(1585004966), '2020-03-23T23:09:26+0:00');
        });

        it('should return the W3C formatted date/time UTC string from epoch time in milliseconds.', () => {
            assert.strictEqual(mu.getW3CDateTimeUtcString(1585004993849), '2020-03-23T23:09:53+0:00');
        });
    });

    describe('getUtcYmdString function', () => {

        it('should return the YMD string from epoch time in seconds.', () => {
            assert.strictEqual(mu.getUtcYmdString(1585004966), '2020_03_23');
        });

        it('should return the YMD string from epoch time in milliseconds.', () => {
            assert.strictEqual(mu.getUtcYmdString(1585004993849), '2020_03_23');
        });

        it('should return the YMD string using specified separator.', () => {
            assert.strictEqual(mu.getUtcYmdString(1585004966, '*'), '2020*03*23');
        });
    });

    describe('getYmdString function', () => {

        it('should return the YMD string from epoch time in seconds.', () => {
            assert.strictEqual(mu.getYmdString(1585004966), '2020_03_23');
        });

        it('should return the YMD string from epoch time in milliseconds.', () => {
            assert.strictEqual(mu.getYmdString(1585004993849), '2020_03_23');
        });

        it('should return the YMD string using specified separator.', () => {
            assert.strictEqual(mu.getYmdString(1585004966, '*'), '2020*03*23');
        });
    });
});