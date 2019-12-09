"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const round_to_1 = __importDefault(require("round-to"));
class W3Buffer {
    constructor(buffer) {
        this._offset = 0;
        this._buffer = buffer;
    }
    readInt() {
        const int = this._buffer.readInt32LE(this._offset);
        this._offset += 4;
        return int;
    }
    readShort() {
        const int = this._buffer.readInt16LE(this._offset);
        this._offset += 2;
        return int;
    }
    readFloat() {
        const float = this._buffer.readFloatLE(this._offset);
        this._offset += 4;
        return round_to_1.default(float, 3);
    }
    readString() {
        const string = [];
        while (this._buffer[this._offset] !== 0x00) {
            string.push(this._buffer[this._offset]);
            this._offset += 1;
        }
        this._offset += 1; // consume the \0 end-of-string delimiter
        return string.map((ch) => {
            return String.fromCharCode(ch);
        }).join('');
    }
    readChars(len = 1) {
        const string = [];
        const numCharsToRead = len || 1;
        for (let i = 0; i < numCharsToRead; i++) {
            string.push(this._buffer[this._offset]);
            this._offset += 1;
        }
        return string.map((ch) => {
            if (ch === 0x0)
                return '0';
            return String.fromCharCode(ch);
        }).join('');
    }
    readByte() {
        // TODO what kind of binary? Do we use a BigInt or a node provided type from Buffer?
        let byte = this._buffer[this._offset];
        this._offset += 1;
        return byte;
    }
}
exports.W3Buffer = W3Buffer;
;
//# sourceMappingURL=W3Buffer.js.map