import assert from 'assert';
import { W3Buffer } from '../src/W3Buffer';

// This is a hard-coded buffer to test all the reading methods
// on W3Buffer. It consists of, in this order:
// char(4), int, float, string(7 Ws), byte
const buffData = Buffer.from([
    0x01, 0x00, 0x00, 0x00, // int: 1
    0x81, 0x70, // short: 28801
    0x00, 0x00, 0x9b, 0xc5, // float: -4960
    0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x00, // string: "WWWWWWW"
    0x57, 0x33, 0x64, 0x6f, // char(4): "W3do"
    0x57, // char(1): "W"
    0x02 // byte: 2
]);

const w3buffer = new W3Buffer(buffData);

describe('W3Buffer', () => {

    it('should readInt', () => {
        assert.equal(w3buffer.readInt(), 1);
    });

    it('should readShort', () => {
        assert.equal(w3buffer.readShort(), 28801);
    });

    it('should readFloat', () => {
        assert.equal(w3buffer.readFloat(), -4960);
    });

    it('should readString', () => {
        assert.equal(w3buffer.readString(), 'WWWWWWW');
    });

    it('should readChars', () => {
        assert.equal(w3buffer.readChars(4), 'W3do');
        assert.equal(w3buffer.readChars(), 'W')
    });

    it('should readByte', () => {
        assert.equal(w3buffer.readByte(), 2);
    });

    it('should be exhausted', () => {
        assert.ok(w3buffer.isExhausted());
    });

});
