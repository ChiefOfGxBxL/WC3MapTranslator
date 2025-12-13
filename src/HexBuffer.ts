import ieee754 from 'ieee754';
import IntN from 'intn';

const byteToHex = (byte: number): string => ('0x' + byte.toString(16));
const charToHex = (character: string): string => ('0x' + character.charCodeAt(0).toString(16));

const intToHex = (intV: number, size: number = 32): string[] => {
    const sizedInt = new IntN(size);
    const byteNum: number[] = sizedInt.fromInt(intV).bytes;

    // Map decimal bytes to hex bytes
    // Bytes are already in correct little-endian form
    return byteNum.map(byteToHex);
};

export class HexBuffer {
    private _buffer: string[] = [];

    public addString(str: string) {
        const buf = Buffer.from(str, 'utf-8');
        for (const byte of buf) {
            this._buffer.push(byteToHex(byte));
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
        for (const char of chars.split('')) {
            this.addChar(char);
        }
    }

    private addSizedInt(int: number, size: number = 32) {
        for (const byte of intToHex(int, size)) {
            this._buffer.push(byte);
        }
    }

    public addInt(int: number) {
        this.addSizedInt(int, 32);
    }

    public addInt24(int: number) {
        this.addSizedInt(int, 24);
    }

    public addShort(short: number) {
        this.addSizedInt(short, 16);
    }

    public addFloat(float: number) {
        const buf = Buffer.alloc(4);

        // ieee754.write(buffer, value, buffer offset, little-endian, mantissa length, bytes);
        ieee754.write(buf, float, 0, true, 23, 4);

        for (const byte of buf) {
            this._buffer.push(byteToHex(byte));
        }
    }

    public addByte(byte: number) {
        this._buffer.push(byteToHex(byte));
    }

    public addNullTerminator() {
        this._buffer.push('0x0');
    }

    public getBuffer(): Buffer {
        return Buffer.from(this._buffer.map((s) => parseInt(s)));
    }
}
