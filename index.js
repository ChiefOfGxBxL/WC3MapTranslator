
const Translator = {
    Doodads: require('./lib/translators/DoodadsTranslator.js'),
    Strings: require('./lib/translators/StringsTranslator.js'),
    Terrain: require('./lib/translators/TerrainTranslator.js'),
    Units: require('./lib/translators/UnitsTranslator.js'),
    Regions: require('./lib/translators/RegionsTranslator.js'),
    Cameras: require('./lib/translators/CamerasTranslator.js'),
    Sounds: require('./lib/translators/SoundsTranslator.js'),

    Objects: require('./lib/translators/object/ObjectsTranslator.js'),

    Imports: require('./lib/translators/ImportsTranslator.js'),
    Info: require('./lib/translators/InfoTranslator.js')
};

module.exports = Translator;
