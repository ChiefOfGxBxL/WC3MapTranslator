roundTo = require('round-to');

module.exports = function W3Buffer(buffer) {
    let offset = 0; // current offset, in bytes
    return {
        readInt: function() {
            let int = buffer.readInt32LE(offset);
            offset += 4;
            return int;
        },
        readFloat: function() {
            let float = buffer.readFloatLE(offset);
            offset += 4;
            return roundTo(float, 3);
        },
        readString: function() {
            let string = [];

            while(buffer[offset] !== 0x00) {
                string.push(buffer[offset]);
                offset += 1;
            }
            offset += 1; // consume the \0 end-of-string delimiter

            return string.map((ch) => {
                return String.fromCharCode(ch);
            }).join('');
        },
        readChars: function(len, allowNull = false) {
            let string = [],
                numCharsToRead = len || 1;

            for(let i = 0; i < numCharsToRead; i++) {
                string.push(buffer[offset]);
                offset += 1;
            }

            return string.map((ch) => {
                if(!allowNull && ch === 0x0) return '0';
                return String.fromCharCode(ch);
            }).join('');
        },
        readFourCCTwice: function() {
            let value = 0;
            let string = this.readChars(4, true);
            for (let i = 0; i < string.length; i++) {
                let c = string.charCodeAt(i);
                if (c === 0) continue;
                if (c < 0x30 || 0x39 < c) throw new Error(`Invalid numerical FourCC`);
                value += (c - 0x30) * (1 << (8 * i));
            }
            return value;
        },
        readByte: function() {
            let byte = buffer[offset];
            offset += 1;
            return byte;
        }
    };
};
