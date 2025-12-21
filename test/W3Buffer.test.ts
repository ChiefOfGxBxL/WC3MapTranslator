import assert from 'node:assert';
import { suite, test } from 'node:test';
import { W3Buffer } from '../src/W3Buffer';

// This is a hard-coded buffer to test all the reading methods on W3Buffer.
const sampleData = Buffer.from([
    0x01, 0x00, 0x00, 0x00, // int: 1
    0x0f, 0x14, 0x17, // int24: 1512463
    0x81, 0x70, // short: 28801
    0x00, 0x00, 0x9b, 0xc5, // float: -4960
    0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x00, // string: "WWWWWWW"
    0x57, 0x33, 0x64, 0x6f, // char(4): "W3do"
    0x57, // char(1): "W"
    0x02 // byte: 2
]);

const w3Buffer = new W3Buffer(sampleData);

suite('W3Buffer', () => {
    test('should readInt', () => {
        assert.equal(w3Buffer.readInt(), 1);
    });

    test('should readInt24', () => {
        assert.equal(w3Buffer.readInt24(), 1512463);
    });

    test('should readShort', () => {
        assert.equal(w3Buffer.readShort(), 28801);
    });

    test('should readFloat', () => {
        assert.equal(w3Buffer.readFloat(), -4960);
    });

    test('should readString', () => {
        assert.equal(w3Buffer.readString(), 'WWWWWWW');
    });

    test('should readChars', () => {
        assert.equal(w3Buffer.readChars(4), 'W3do');
        assert.equal(w3Buffer.readChars(), 'W');
    });

    test('should readByte', () => {
        assert.equal(w3Buffer.readByte(), 2);
    });

    test('should be exhausted', () => {
        assert.ok(w3Buffer.isExhausted());
    });
});
