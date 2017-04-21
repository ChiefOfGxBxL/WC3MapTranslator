// TODO: this file needs significant unit testing
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
    
function BufferedHexFileWriter(path) {
    var buffer = [];
    
    return {
        addData: function(data) {
            if(data.type === 'string') {
                // write each char to the buffer
                for(var i = 0; i < data.value.length; i++) {
                    buffer.push('0x' + data.value.charCodeAt(i).toString(16));
                }
            }
            else if(data.type === 'newline') {
                buffer.push('0x0d'); // carriage return
                buffer.push('0x0a'); // line feed
            }
            else if(data.type === 'int') {
                // TODO: Array.concat is not a function; should write a utility for this to simplify below
                intToHex(data.value).forEach((Byte) => {
                    buffer.push(Byte);
                });
            }
            else if(data.type === 'short') {
                intToShortHex(data.value).forEach((Byte) => {
                    buffer.push(Byte);
                });
            }
            else if(data.type === 'float') {
                /* decToHex(data.value).forEach((Byte) => {
                    buffer.push(Byte);
                }); */
                var buf = new Buffer(4);
                ieee754.write(buf, data.value, /* buffer offset */0, /* little endian? */true, /* mantissa length */23, /* bytes */4);
                
                buf.forEach(function(n) {
                    buffer.push('0x' + n.toString(16));
                });
            }
            else if(data.type === 'byte') {
                buffer.push('0x' + data.value.toString(16));
            }
            // TODO: other data types
        },
        
        writeFile: function() {
            var fd = fs.openSync(path, 'w+'),
                writeBuffer = new Buffer(buffer);
                
            // TODO: async
            fs.writeSync(fd, writeBuffer, 0, writeBuffer.length);
            console.log('file written!');
        },
        
        addString: function(str) { this.addData( {type: 'string', value: str} ); },
        addNewLine: function() { this.addData( {type: 'newline', value: null} ); },
        addChar: function(c) { this.addData( {type: 'string', value: c} ); },
        addInt: function(i) { this.addData( {type: 'int', value: i} ); },
        addShort: function(s) { this.addData( {type: 'short', value: s} ); },
        addFloat: function(f) { this.addData( {type: 'float', value: f} ); },
        addByte: function(b) { this.addData( {type: 'byte', value: b} ); }
    }
}

module.exports = BufferedHexFileWriter;