const assert = require('assert');
const HexBuffer = require('../lib/HexBuffer');

var hexBuffer;
var h = () => hexBuffer.getBuffer();

describe('HexBuffer', function() {

    beforeEach(function() {
        // clear the buffer before each test in this block so we
        // don't have to care about what we added in prior tests
        hexBuffer = new HexBuffer();
    });

    it('should addString', function() {
        hexBuffer.addString('hello world', false);
        assert.equal(h().length, 11);
    });

    it('should addString null-terminated', function() {
        hexBuffer.addString('hello world', true);
        assert.equal(h().length, 12); // now it has a null-terminator at the end
        assert.equal(h()[11], 0); // last character should be the null terminator
    });

    it('should addNewLine', function() {
        hexBuffer.addNewLine();
        assert.equal(h().length, 2);
        assert.equal(h()[0], 0x0d);
        assert.equal(h()[1], 0x0a);
    });

    it('should addChar', function() {
        hexBuffer.addChar('A');
        assert.equal(h().length, 1);
        assert.equal(h()[0], 65); // charcode for the ASCII letter "A"
    });

    it('should addInt', function() {
        hexBuffer.addInt(0);
        assert.equal(h().length, 4); // integer is 4 bytes in length
        assert.equal(h()[0], 0x00);
        assert.equal(h()[1], 0x00);
        assert.equal(h()[2], 0x00);
        assert.equal(h()[3], 0x00);
    });

    it('should addShort', function() {
        hexBuffer.addShort(14);
        assert.equal(h().length, 2); // 2 bytes in length
        assert.equal(h()[0], 0x0e);
        assert.equal(h()[1], 0x00);
    });

    it('should addFloat', function() {
        hexBuffer.addFloat(1.234);
        assert.equal(h().length, 4); // 4 bytes in length
        assert.equal(h()[0], 0xb6);
        assert.equal(h()[1], 0xf3);
        assert.equal(h()[2], 0x9d);
        assert.equal(h()[3], 0x3f);
    });

    it('should addByte', function() {
        hexBuffer.addByte(15);
        assert.equal(h()[0], 15);
    });

    it('should addNullTerminator', function() {
        hexBuffer.addNullTerminator();
        assert.equal(h().length, 1);
        assert.equal(h()[0], 0);
    });

    it('should getBuffer', function() {
        hexBuffer.addString('');
        assert(hexBuffer.getBuffer()); // test if this function works
    });

});
