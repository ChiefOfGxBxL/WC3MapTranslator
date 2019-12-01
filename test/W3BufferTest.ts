import assert from 'assert';
import { W3Buffer } from '../lib/W3Buffer';

// This is a hard-coded buffer to test all the reading methods
// on W3Buffer. It consists of, in this order:
// char(4), int, float, string(7 Ws), byte
var buffData = Buffer.from([
    0x57, 0x33, 0x64, 0x6f, // char(4): "W3do"
    0x01, 0x00, 0x00, 0x00, // int: 1
    0x00, 0x00, 0x9b, 0xc5, // float: -4960
    0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x00, // string: "WWWWWWW"
    0x02 // byte: 2
]);

var w3buffer = new W3Buffer(buffData);

describe('W3Buffer', function () {

    it('should readChar(4)', function () {
        let result = w3buffer.readChars(4);
        assert.equal(result, 'W3do');
    });

    it('should readInt', function () {
        let result = w3buffer.readInt();
        assert.equal(result, 1);
    });

    it('should readFloat', function () {
        let result = w3buffer.readFloat();
        assert.equal(result, -4960);
    });

    it('should readString', function () {
        let result = w3buffer.readString();
        assert.equal(result, 'WWWWWWW');
    });

    it('should readByte', function () {
        let result = w3buffer.readByte();
        assert.equal(result, 2);
    });

});
