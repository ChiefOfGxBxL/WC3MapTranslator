var BufferedHexFileWriter = require('../../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path'),
    varTypes = {
        int: 0,
        real: 1,
        unreal: 2,
        string: 3
    };

var UnitsObjTranslator = function(json, outputPath) {
    var path = (outputPath) ? Path.join(outputPath, 'war3map.w3u') : 'war3map.w3u';
    outBuffer = new BufferedHexFileWriter(path);
    
    /*
     * Header
     */
    outBuffer.addInt(2); // file version
    
    
    /*
     * Original table
     */
    outBuffer.addInt(json.original.length);
    
    json.original.forEach(function(def) {
        outBuffer.addString(def.baseId);
        outBuffer.addByte(0);outBuffer.addByte(0);outBuffer.addByte(0);outBuffer.addByte(0);
        outBuffer.addInt(def.changes.length);
        
        def.changes.forEach(function(mod) {
            var modType;
            
            // Modification id (e.g. unam = name; reference MetaData lookups)
            outBuffer.addString(mod.id);
            
            // Determine what type of field the mod is (int, real, unreal, string)
            if(mod.type) { // if a type is specified, use it
                modType = varTypes[mod.type];
            }
            else { // otherwise we try to infer between int/string (note there is no way to detect unreal or float this way, so user must specify those explicitly)
                if(typeof(mod.value) === 'number') {
                    modType = varTypes.int;
                }
                else if(typeof(mod.value) === 'string') {
                    modType = varTypes.string;
                }
                else {
                    // ERROR: no type specified and cannot infer type!
                }
            }
            
            outBuffer.addInt(modType);
            
            // Write mod value
            if(modType === varTypes.int) {
                outBuffer.addInt(mod.value);
            }
            else if(modType === varTypes.real || modType === varTypes.unreal) {
                // TODO: check if unreal values are same hex format as real
                outBuffer.addFloat(mod.value);
            }
            else if(modType === varTypes.string) {
                // Note that World Editor normally creates a TRIGSTR_000 for these string
                // values - WC3MapTranslator just writes the string directly to file
                outBuffer.addString(mod.value);
                outBuffer.addNullTerminator();
            }
            
            //outBuffer.addInt(0); // End of mod struct
            outBuffer.addString(def.baseId); // the base id of an original object (e.g. hfoo) ends each modification to the original object
        });
    });
    
    
    /*
     * Custom table
     */
    outBuffer.addInt(json.custom.length); // # entry modifications
    
    json.custom.forEach(function(def) {
        outBuffer.addString(def.baseId);
        outBuffer.addString(def.newId);
        outBuffer.addInt(def.changes.length);
        
        def.changes.forEach(function(mod) {
            var modType;
            
            // Modification id (e.g. unam = name; reference MetaData lookups)
            outBuffer.addString(mod.id);
            
            // Determine what type of field the mod is (int, real, unreal, string)
            if(mod.type) { // if a type is specified, use it
                modType = varTypes[mod.type];
            }
            else { // otherwise we try to infer between int/string (note there is no way to detect unreal or float this way, so user must specify those explicitly)
                if(typeof(mod.value) === 'number') {
                    modType = varTypes.int;
                }
                else if(typeof(mod.value) === 'string') {
                    modType = varTypes.string;
                }
                else {
                    // ERROR: no type specified and cannot infer type!
                }
            }
            
            outBuffer.addInt(modType);
            
            // Write mod value
            if(modType === varTypes.int) {
                outBuffer.addInt(mod.value);
            }
            else if(modType === varTypes.real || modType === varTypes.unreal) {
                // TODO: check if unreal values are same hex format as real
                outBuffer.addFloat(mod.value);
            }
            else if(modType === varTypes.string) {
                // Note that World Editor normally creates a TRIGSTR_000 for these string
                // values - WC3MapTranslator just writes the string directly to file
                outBuffer.addString(mod.value);
                outBuffer.addNullTerminator();
            }
            
            outBuffer.addInt(0); // End of mod struct
        });
    });
    
    return {
        write: function() {
            outBuffer.writeFile();
        }
    };
}

module.exports = UnitsObjTranslator;
