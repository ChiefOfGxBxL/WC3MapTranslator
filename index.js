
var Translator = {
    Doodads: require('./translators/DoodadsTranslator.js'),
    Strings: require('./translators/StringsTranslator.js'),
    Terrain: require('./translators/TerrainTranslator.js'),
    Units: require('./translators/UnitsTranslator.js'),
    Regions: require('./translators/RegionsTranslator.js'),
    Cameras: require('./translators/CamerasTranslator.js'),
    Sounds: require('./translators/SoundsTranslator.js'),
};

module.exports = Translator;
