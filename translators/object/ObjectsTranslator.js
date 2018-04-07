var BufferedHexFileWriter = require('../../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path'),
    varTypes = {
        int:    0,
        real:   1,
        unreal: 2,
        string: 3
    },
    // (*) - uses the two optional ints after variable type
    fileTypeExt = {
        units:          'w3u',
        items:          'w3t',
        destructables:  'w3b',
        doodads:        'w3d', // (*)
        abilities:      'w3a', // (*)
        buffs:          'w3h',
        upgrades:       'w3q' // (*)
    };

var ObjectsTranslator = function(type, json) {
    outBuffer = new BufferedHexFileWriter();
    
    /*
     * Header
     */
    outBuffer.addInt(2); // file version
    
    function generateTableFromJson(tableType, tableData) { // create "original" or "custom" table
        Object.keys(tableData).forEach(function(defKey) {
            var obj = tableData[defKey];
            
            // Original and new object ids
            if(tableType === 'original') {
                outBuffer.addString(defKey);
                outBuffer.addByte(0);outBuffer.addByte(0);outBuffer.addByte(0);outBuffer.addByte(0); // no new Id is assigned
            }
            else {
                // e.g. "h000:hfoo"
                outBuffer.addString(defKey.substring(5, 9)); // original id
                outBuffer.addString(defKey.substring(0, 4)); // custom id
            }
            
            // Number of modifications made to this object
            outBuffer.addInt(obj.length);
            
            obj.forEach(function(mod) {
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
                
                // Addl integers
                // Required for: doodads, abilities, upgrades
                if(type === 'doodads' || type === 'abilities' || type === 'upgrades') {
                    
                    // Level or variation
                    // We need to check if hasOwnProperty because these could be explititly
                    // set to 0, but JavaScript's truthiness evaluates to false to it was defaulting
                    outBuffer.addInt(mod.level || mod.variation || 0); // defaults to 0
                    
                    outBuffer.addInt(mod.column || 0); // E.g DataA1 is 1 because of col A; refer to the xyzData.slk files for Data fields
                }
                
                // Write mod value
                if(modType === varTypes.int) {
                    outBuffer.addInt(mod.value);
                }
                else if(modType === varTypes.real || modType === varTypes.unreal) {
                    // Follow-up: check if unreal values are same hex format as real
                    outBuffer.addFloat(mod.value);
                }
                else if(modType === varTypes.string) {
                    // Note that World Editor normally creates a TRIGSTR_000 for these string
                    // values - WC3MapTranslator just writes the string directly to file
                    outBuffer.addString(mod.value);
                    outBuffer.addNullTerminator();
                }
                
                // End of struct
                if(tableType === 'original') {
                    // Original objects are ended with their base id (e.g. hfoo)
                    outBuffer.addString(defKey);
                }
                else {
                    // Custom objects are ended with 0000 bytes
                    outBuffer.addByte(0);
                    outBuffer.addByte(0);
                    outBuffer.addByte(0);
                    outBuffer.addByte(0);
                }
            });
        });
    }
    
    /*
     * Original table
     */
    outBuffer.addInt(Object.keys(json.original).length);
    generateTableFromJson('original', json.original);
    
    
    /*
     * Custom table
     */
    outBuffer.addInt(Object.keys(json.custom).length); // # entry modifications
    generateTableFromJson('custom', json.custom);
    
    return {
        write: function(outputPath) {
            var path = (outputPath) ? Path.join(outputPath, 'war3map.' + fileTypeExt[type]) : 'war3map.' + fileTypeExt[type];
            outBuffer.writeFile(path);
        }
    };
};

module.exports = ObjectsTranslator;
