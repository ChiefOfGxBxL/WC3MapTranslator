
var Translator = {
    Doodads: require('./translators/DoodadsTranslator.js'),
    Strings: require('./translators/StringsTranslator.js'),
    Terrain: require('./translators/TerrainTranslator.js'),
    Units: require('./translators/UnitsTranslator.js'),
    
    fromJson: function(mapJson, outDir) {
        
        if(mapJson.doodads) {
            var doodadsTranslator = new Translator.Doodads(mapJson.doodads, outDir);
            doodadsTranslator.write();
        }
        
        if(mapJson.strings) {
            var stringsTranslator = new Translator.Strings(mapJson.strings, outDir);
            stringsTranslator.write();
        }
        
        if(mapJson.terrain) {
            var terrainTranslator = new Translator.Terrain(mapJson.terrain, outDir);
            terrainTranslator.write();
        }
        
        if(mapJson.units) {
            var unitsTranslator = new Translator.Units(mapJson.units, outDir);
            unitsTranslator.write();
        }
        
    }
};

module.exports = Translator;
