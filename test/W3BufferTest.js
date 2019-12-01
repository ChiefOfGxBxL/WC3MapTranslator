"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const W3Buffer_1 = require("../lib/W3Buffer");
// This is a hard-coded buffer to test all the reading methods
// on W3Buffer. It consists of, in this order:
// char(4), int, float, string(7 Ws), byte
var buffData = Buffer.from([
    0x57, 0x33, 0x64, 0x6f,
    0x01, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x9b, 0xc5,
    0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x57, 0x00,
    0x02 // byte: 2
]);
var w3buffer = new W3Buffer_1.W3Buffer(buffData);
describe('W3Buffer', function () {
    it('should readChar(4)', function () {
        let result = w3buffer.readChars(4);
        assert_1.default.equal(result, 'W3do');
    });
    it('should readInt', function () {
        let result = w3buffer.readInt();
        assert_1.default.equal(result, 1);
    });
    it('should readFloat', function () {
        let result = w3buffer.readFloat();
        assert_1.default.equal(result, -4960);
    });
    it('should readString', function () {
        let result = w3buffer.readString();
        assert_1.default.equal(result, 'WWWWWWW');
    });
    it('should readByte', function () {
        let result = w3buffer.readByte();
        assert_1.default.equal(result, 2);
    });
});
//# sourceMappingURL=W3BufferTest.js.map