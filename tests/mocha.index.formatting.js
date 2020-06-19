'use strict';

const
    assert = require('assert'),
    mu = require('./../index');


describe('mint-utils (formatting)', () => {

    describe('padNum function', () => {

        it('should return the number as string', () => {
            const padded = mu.padNum(10, 1);
            assert.strictEqual(typeof padded === 'string', true);
        });

        it('should pad numbers less than 10 with a "0" prefix', () => {
            for (let i = 0; i < 10; i++) {
                const padded = mu.padNum(i, 2);
                assert.strictEqual(padded, '0' + i);
            }
        });

        it('should NOT pad numbers greater than or equal to 10', () => {
            for (let i = 10; i < 20; i++) {
                const padded = mu.padNum(i, 2);
                assert.strictEqual(padded, String(i));
            }
        });

        it('should pad string arguments', () => {
            for (let i = 0; i < 10; i++) {
                const padded = mu.padNum(String(i), 2);
                assert.strictEqual(padded, '0' + i);
            }
            for (let i = 10; i < 20; i++) {
                const padded = mu.padNum(String(i), 2);
                assert.strictEqual(padded, String(i));
            }
        });
    });

    describe('padNum2 function', () => {

        it('should return the number as string', () => {
            const padded = mu.padNum2(10);
            assert.strictEqual(typeof padded === 'string', true);
        });

        it('should pad numbers less than 10 with a "0" prefix', () => {
            for (let i = 0; i < 10; i++) {
                const padded = mu.padNum2(i);
                assert.strictEqual(padded, '0' + i);
            }
        });

        it('should NOT pad numbers greater than or equal to 10', () => {
            for (let i = 10; i < 20; i++) {
                const padded = mu.padNum2(i);
                assert.strictEqual(padded, String(i));
            }
        });

        it('should pad string arguments', () => {
            for (let i = 0; i < 10; i++) {
                const padded = mu.padNum2(String(i));
                assert.strictEqual(padded, '0' + i);
            }
            for (let i = 10; i < 20; i++) {
                const padded = mu.padNum2(String(i));
                assert.strictEqual(padded, String(i));
            }
        });
    });

    describe('formatBits function', () => {

        it('should correctly format 100 bytes (800.00 b)', () => {
            const format = mu.formatBits(100);
            assert.strictEqual(format.number, '800.00');
            assert.strictEqual(format.units, 'b');
        });

        it('should correctly format 1024 bytes (8 Kb)', () => {
            const format = mu.formatBits(1024);
            assert.strictEqual(format.number, '8.00');
            assert.strictEqual(format.units, 'Kb');
        });

        it('should correctly format 1048576‬ bytes (8 Mb)', () => {
            const format = mu.formatBits(1048576);
            assert.strictEqual(format.number, '8.00');
            assert.strictEqual(format.units, 'Mb');
        });

        it('should correctly format 2147483648 bytes (16 Gb)', () => {
            const format = mu.formatBits(2147483648);
            assert.strictEqual(format.number, '16.00');
            assert.strictEqual(format.units, 'Gb');
        });

        it('should correctly format 2199023255552 bytes (16 Tb)', () => {
            const format = mu.formatBits(2199023255552);
            assert.strictEqual(format.number, '16.00');
            assert.strictEqual(format.units, 'Tb');
        });

        it('should correctly format 2251799813685248 bytes (16 Pb)', () => {
            const format = mu.formatBits(2251799813685248);
            assert.strictEqual(format.number, '16.00');
            assert.strictEqual(format.units, 'Pb');
        });

        it('should obey decimal places if specified', () => {
            const format = mu.formatBits(2251799813685248, 4);
            assert.strictEqual(format.number, '16.0000');
        });
    });

    describe('formatBytes function', () => {

        it('should correctly format 100 bytes (100 B)', () => {
            const format = mu.formatBytes(100);
            assert.strictEqual(format.number, '100.00');
            assert.strictEqual(format.units, 'B');
        });

        it('should correctly format 1024 bytes (1 KB)', () => {
            const format = mu.formatBytes(1024);
            assert.strictEqual(format.number, '1.00');
            assert.strictEqual(format.units, 'KB');
        });

        it('should correctly format 1048576‬ bytes (1 MB)', () => {
            const format = mu.formatBytes(1048576);
            assert.strictEqual(format.number, '1.00');
            assert.strictEqual(format.units, 'MB');
        });

        it('should correctly format 2147483648 bytes (2 GB)', () => {
            const format = mu.formatBytes(2147483648);
            assert.strictEqual(format.number, '2.00');
            assert.strictEqual(format.units, 'GB');
        });

        it('should correctly format 2199023255552 bytes (2 TB)', () => {
            const format = mu.formatBytes(2199023255552);
            assert.strictEqual(format.number, '2.00');
            assert.strictEqual(format.units, 'TB');
        });

        it('should correctly format 2251799813685248 bytes (2 PB)', () => {
            const format = mu.formatBytes(2251799813685248);
            assert.strictEqual(format.number, '2.00');
            assert.strictEqual(format.units, 'PB');
        });

        it('should obey decimal places if specified', () => {
            const format = mu.formatBytes(2251799813685248, 4);
            assert.strictEqual(format.number, '2.0000');
        });
    });

    describe('formatHashesPerSecond function', () => {

        it('should correctly format 100 hashes (100 h)', () => {
            const format = mu.formatHashes(100);
            assert.strictEqual(format.number, '100.00');
            assert.strictEqual(format.units, 'h');
        });

        it('should correctly format 1024 bytes (1.02 Kh)', () => {
            const format = mu.formatHashes(1024);
            assert.strictEqual(format.number, '1.02');
            assert.strictEqual(format.units, 'Kh');
        });

        it('should correctly format 1048576‬ bytes (1.05 Mh)', () => {
            const format = mu.formatHashes(1048576);
            assert.strictEqual(format.number, '1.05');
            assert.strictEqual(format.units, 'Mh');
        });

        it('should correctly format 2147483648 bytes (2.15 Gh)', () => {
            const format = mu.formatHashes(2147483648);
            assert.strictEqual(format.number, '2.15');
            assert.strictEqual(format.units, 'Gh');
        });

        it('should correctly format 2199023255552 bytes (2.20 Th)', () => {
            const format = mu.formatHashes(2199023255552);
            assert.strictEqual(format.number, '2.20');
            assert.strictEqual(format.units, 'Th');
        });

        it('should correctly format 2251799813685248 bytes (2.25 Ph)', () => {
            const format = mu.formatHashes(2251799813685248);
            assert.strictEqual(format.number, '2.25');
            assert.strictEqual(format.units, 'Ph');
        });

        it('should obey decimal places if specified', () => {
            const format = mu.formatHashes(2251799813685248, 4);
            assert.strictEqual(format.number, '2.2518');
        });
    });

    describe('formatSeconds function', () => {

        it('should correctly format 100 seconds (10 secs)', () => {
            const format = mu.formatSeconds(10);
            assert.strictEqual(format.number, '10.00');
            assert.strictEqual(format.units, 'secs');
        });

        it('should correctly format 90 seconds (1.5 mins)', () => {
            const format = mu.formatSeconds(90);
            assert.strictEqual(format.number, '1.50');
            assert.strictEqual(format.units, 'mins');
        });

        it('should correctly format 7200‬ seconds (2 hrs)', () => {
            const format = mu.formatSeconds(7200);
            assert.strictEqual(format.number, '2.00');
            assert.strictEqual(format.units, 'hrs');
        });

        it('should obey decimal places if specified', () => {
            const format = mu.formatSeconds(7200, 3);
            assert.strictEqual(format.number, '2.000');
        });
    });

    describe('replaceCharAt function', () => {

        it('should replace character at specified index position with specified string', () => {
            const result = mu.replaceCharAt('aaabbbccc', 1, 'X');
            assert.strictEqual(result, 'aXabbbccc');
        });
    });

    describe('parseJsEscapes function', () => {

        it('should return a string unmodified when there are no escaped characters to import', () => {
            const input = 'This is line 1';
            const output = mu.parseJsEscapes(input);
            assert.strictEqual('This is line 1', output);
        });

        it('should import new-line characters', () => {
            const input = 'This is line 1\\nThis is line 2\\nThis is line 3\\n';
            const output = mu.parseJsEscapes(input);
            assert.strictEqual('This is line 1\nThis is line 2\nThis is line 3\n', output);
        });

        it('should import carriage-return characters', () => {
            const input = 'This is line 1\\r\\nThis is line 2\\r\\nThis is line 3\\r\\n';
            const output = mu.parseJsEscapes(input);
            assert.strictEqual('This is line 1\r\nThis is line 2\r\nThis is line 3\r\n', output);
        });

        it('should import tab characters', () => {
            const input = 'This is line 1\\n\\tThis is line 2\\t\\nThis is line 3\\t\\t';
            const output = mu.parseJsEscapes(input);
            assert.strictEqual('This is line 1\n\tThis is line 2\t\nThis is line 3\t\t', output);
        });

        it('should NOT import escaped new-line character (1)', () => {
            const input = 'This is line 1\\\\nThis is line 2'/* This is line 1\\nThis is line 2 */;
            const output = mu.parseJsEscapes(input);
            assert.strictEqual('This is line 1\\nThis is line 2'/* This is line 1\nThis is line 2 */, output);
        });

        it('should NOT import escaped new-line character (2)', () => {
            const input = 'This is line 1\\\\\\nThis is line 2'/* This is line 1\\\nThis is line 2 */;
            const output = mu.parseJsEscapes(input);
            assert.strictEqual('This is line 1\\\nThis is line 2'/* This is line 1\<\n>This is line 2 */, output);
        });

        it('should NOT import escaped carriage-return character', () => {
            const input = 'This is line 1\\\\rThis is line 2' /* This is line 1\\rThis is line 2 */;
            const output = mu.parseJsEscapes(input);
            assert.strictEqual('This is line 1\\rThis is line 2'/* This is line 1\rThis is line 2 */, output);
        });

        it('should NOT import escaped tab character', () => {
            const input = 'This is side 1\\\\tThis is side 2' /* This is side 1\\tThis is side 2 */;
            const output = mu.parseJsEscapes(input);
            assert.strictEqual('This is side 1\\tThis is side 2'/* This is side 1\tThis is side 2 */, output);
        });
    });
});