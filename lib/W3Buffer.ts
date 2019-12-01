import roundTo from 'round-to';

export class W3Buffer {

    public _offset = 0;
    public _buffer: Buffer;

    constructor(buffer: Buffer) {
        this._buffer = buffer;
    }

    readInt() {
        let int = this._buffer.readInt32LE(this._offset);
        this._offset += 4;
        return int;
    }

    readShort() {
        let int = this._buffer.readInt16LE(this._offset);
        this._offset += 2;
        return int;
    }

    readFloat() {
        let float = this._buffer.readFloatLE(this._offset);
        this._offset += 4;
        return roundTo(float, 3);
    }

    readString() {
        let string = [];

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
        let string = [],
            numCharsToRead = len || 1;

        for (let i = 0; i < numCharsToRead; i++) {
            string.push(this._buffer[this._offset]);
            this._offset += 1;
        }

        return string.map((ch) => {
            if (ch === 0x0) return '0';
            return String.fromCharCode(ch);
        }).join('');
    }

    readByte() {
        let byte = this._buffer[this._offset];
        this._offset += 1;
        return byte;
    }
};
