

var Translator = {
    Doodads: require('./translators/DoodadsTranslator.js'),
    Strings: require('./translators/StringsTranslator.js'),
    Terrain: require('./translators/TerrainTranslator.js'),
    Units: require('./translators/UnitsTranslator.js'),
    
    fromJson: function(mapJson, outDir) {
        // Translate all JSON...
        if(mapJson.doodads) {} // translate
        // ...
    }
};

module.exports = Translator;
