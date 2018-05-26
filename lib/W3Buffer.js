roundTo = require('round-to');

module.exports = function W3Buffer(buffer) {
    var offset = 0; // current offset, in bytes
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
    }
}
