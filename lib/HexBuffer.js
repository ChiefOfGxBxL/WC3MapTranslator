"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ieee754 = require('ieee754'), IntN = require('intn'), intToHex = function (intV, isShort) {
    // Creates a new 32-bit integer from the given number
    let intSize = isShort ? 16 : 32, intNSize = new IntN(intSize), byteNum = intNSize.fromInt(intV).bytes;
    // Map decimal bytes to hex bytes
    // Bytes are already in correct little-endian form
    return byteNum.map((Byte) => {
        return '0x' + Byte.toString(16);
    });
}, charToHex = function (character) {
    return '0x' + character.charCodeAt(0).toString(16);
};
class HexBuffer {
    constructor() {
        this._buffer = [];
    }
    addString(str, isNullTerminated = false) {
        // Write each char to the buffer
        // "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2"
        // | "ucs-2" | "base64" | "latin1" | "binary" | "hex"
        const buf = Buffer.from(str, 'utf-8');
        for (let i = 0; i < buf.length; i++) {
            this._buffer.push('0x' + buf[i].toString(16));
        }
        if (isNullTerminated) {
            this.addNullTerminator();
        }
    }
    addNewLine() {
        this._buffer.push('0x0d'); // carriage return
        this._buffer.push('0x0a'); // line feed
    }
    addChar(char) {
        this._buffer.push(charToHex(char));
    }
    addInt(int, isShort = false) {
        intToHex(int, isShort).forEach((Byte) => {
            this._buffer.push(Byte);
        });
    }
    addShort(short) {
        this.addInt(short, true);
    }
    addFloat(float) {
        let buf = new Buffer(4);
        // ieee754.write(buffer, value, buffer offset, little-endian, mantissa length, bytes);
        ieee754.write(buf, float, 0, true, 23, 4);
        buf.forEach((byte) => {
            this._buffer.push('0x' + byte.toString(16));
        });
    }
    addByte(byte) {
        this._buffer.push('0x' + byte.toString(16));
    }
    addNullTerminator() {
        this._buffer.push('0x0');
    }
    getBuffer() {
        return this._buffer;
    }
}
exports.HexBuffer = HexBuffer;
//# sourceMappingURL=HexBuffer.js.map