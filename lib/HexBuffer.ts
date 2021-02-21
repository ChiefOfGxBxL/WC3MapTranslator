const ieee754 = require('ieee754'),
    IntN = require('intn'),
    intToHex = (intV: number, isShort: boolean): string[] => {
        // Creates a new 32-bit integer from the given number
        const intSize = isShort ? 16 : 32;
        const intNSize = new IntN(intSize);
        const byteNum = intNSize.fromInt(intV).bytes;

        // Map decimal bytes to hex bytes
        // Bytes are already in correct little-endian form
        return byteNum.map((Byte) => {
            return '0x' + Byte.toString(16);
        });
    },
    charToHex = (character: string): string => {
        return '0x' + character.charCodeAt(0).toString(16);
    };

export class HexBuffer {
    private _buffer = [];

    public addString(str: string) {
        // Write each char to the buffer
        // "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2"
        // | "ucs-2" | "base64" | "latin1" | "binary" | "hex"
        const buf = Buffer.from(str, 'utf-8');
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < buf.length; i++) {
            this._buffer.push('0x' + buf[i].toString(16));
        }
        this.addNullTerminator();
    }

    public addNewLine() {
        this._buffer.push('0x0d'); // carriage return
        this._buffer.push('0x0a'); // line feed
    }

    public addChar(char: string) {
        this._buffer.push(charToHex(char));
    }

    public addChars(chars: string) {
        chars.split('').forEach(char => {
            this.addChar(char);
        });
    }

    public addInt(int: number, isShort: boolean = false) {
        intToHex(int, isShort).forEach((Byte) => {
            this._buffer.push(Byte);
        });
    }

    public addShort(short: number) {
        this.addInt(short, true);
    }

    public addFloat(float: number) {
        const buf = Buffer.alloc(4);

        // ieee754.write(buffer, value, buffer offset, little-endian, mantissa length, bytes);
        ieee754.write(buf, float, 0, true, 23, 4);

        buf.forEach((byte) => {
            this._buffer.push('0x' + byte.toString(16));
        });
    }

    public addByte(byte) {
        this._buffer.push('0x' + byte.toString(16));
    }

    public addNullTerminator()  {
        this._buffer.push('0x0');
    }

    public getBuffer(): Buffer {
        return Buffer.from(this._buffer);
    }
}
