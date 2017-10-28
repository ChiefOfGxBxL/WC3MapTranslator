
var Translator = {
    Doodads: require('./translators/DoodadsTranslator.js'),
    Strings: require('./translators/StringsTranslator.js'),
    Terrain: require('./translators/TerrainTranslator.js'),
    Units: require('./translators/UnitsTranslator.js'),
    Regions: require('./translators/RegionsTranslator.js'),
    Cameras: require('./translators/CamerasTranslator.js'),
    Sounds: require('./translators/SoundsTranslator.js'),

    Objects: require('./translators/object/ObjectsTranslator.js'),

    Imports: require('./translators/ImportsTranslator.js'),
    Info: require('./translators/InfoTranslator.js')
};

module.exports = Translator;
