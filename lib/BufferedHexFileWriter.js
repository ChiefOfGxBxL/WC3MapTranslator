var fs = require('fs'),
    ieee754 = require('ieee754');

function intToHex(int) {
    // TODO: this function needs to support all negative numbers
    var holder = [],
        v;
    
    if(int === -1 || int === '-1') {
        holder.push('0xff');
        holder.push('0xff');
        holder.push('0xff');
        holder.push('0xff');
        
        return holder;
    }
    
    v = ('00000000' + (int).toString(16)).substr(-8);
    for(var i = 0; i < 4; i++) {
        holder.push('0x'+v.substr(i*2, 2));
    }
    return holder.reverse();
}

function intToShortHex(int) {
    var v = ('0000' + (int).toString(16)).substr(-4),
        holder = [];
    for(var i = 0; i < 2; i++) {
        holder.push('0x'+v.substr(i*2, 2));
    }
    return holder.reverse();
}
    
function BufferedHexFileWriter() {
    var buffer = [];
    
    return {
        addString: function(str) {
            // Write each char to the buffer
            for(var i = 0; i < str.length; i++) {
                buffer.push('0x' + str.charCodeAt(i).toString(16));
            }
        },
        
        addNewLine: function() {
            buffer.push('0x0d'); // carriage return
            buffer.push('0x0a'); // line feed
        },
        
        addChar: function(c) {
            buffer.push('0x' + c.charCodeAt(0).toString(16));
        },
        
        addInt: function(i) {
            intToHex(i).forEach((Byte) => {
                buffer.push(Byte);
            });
        },
        
        addShort: function(s) {
            intToShortHex(s).forEach((Byte) => {
                buffer.push(Byte);
            });
        },
        
        addFloat: function(f) {
            var buf = new Buffer(4);
            // ieee.write(buffer, value, buffer offset, little-endian?, mantissa length, bytes);
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
        }
        
        writeFile: function(path) {
            var fd = fs.openSync(path, 'w+'),
                writeBuffer = new Buffer(buffer);
            
            fs.writeSync(fd, writeBuffer, 0, writeBuffer.length);
        }
    }
}

module.exports = BufferedHexFileWriter;
