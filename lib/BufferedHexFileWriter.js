var fs = require('fs'),
    ieee754 = require('ieee754'),
    IntN = require('intn'),
    intToHex = function(intV, isShort) {
        // Creates a new 32-bit integer from the given number
        var intSize = (isShort) ? 16 : 32,
            intNSize = new IntN(intSize),
            byteNum = intNSize.fromInt(intV).bytes;
        
        // Map decimal bytes to hex bytes
        // Bytes are already in correct little-endian form
        return byteNum.map((Byte) => {
            return '0x' + Byte.toString(16);
        });
    },
    charToHex = function(character) {
        return '0x' + character.charCodeAt(0).toString(16);
    };
    
function BufferedHexFileWriter() {
    var buffer = [];
    
    return {
        addString: function(str, isNullTerminated) {
            // Write each char to the buffer
            for(var i = 0; i < str.length; i++) {
                buffer.push(charToHex(str[i]));
            }
            
            if(isNullTerminated) {
                this.addNullTerminator();
            }
        },
        
        addNewLine: function() {
            buffer.push('0x0d'); // carriage return
            buffer.push('0x0a'); // line feed
        },
        
        addChar: function(c) {
            buffer.push(charToHex(c));
        },
        
        addInt: function(i, isShort) {
            intToHex(i, isShort).forEach((Byte) => {
                buffer.push(Byte);
            });
        },
        
        addShort: function(s) {
            this.addInt(s, true);
        },
        
        addFloat: function(f) {
            var buf = new Buffer(4);
            
            // ieee754.write(buffer, value, buffer offset, little-endian, mantissa length, bytes);
            ieee754.write(buf, f, 0, true, 23, 4);
            
            buf.forEach(function(n) {
                buffer.push('0x' + n.toString(16));
            });
        },
        
        addByte: function(b) {
            buffer.push('0x' + b.toString(16));
        },
        
        addNullTerminator: function() {
            buffer.push('0x0');
        },
        
        writeFile: function(path) {
            var fd = fs.openSync(path, 'w+'),
                writeBuffer = new Buffer(buffer);
            
            fs.writeSync(fd, writeBuffer, 0, writeBuffer.length);
        }
    }
}

module.exports = BufferedHexFileWriter;
