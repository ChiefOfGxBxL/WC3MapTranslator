var Translator = require('../index.js'),
    unitData = require('./test_input/units.json'),
    doodadData = require('./test_input/doodads.json'),
    terrainData = require('./test_input/terrain.json'),
    stringData = require('./test_input/strings.json'),
    regionData = require('./test_input/regions.json'),
    cameraData = require('./test_input/cameras.json'),
    soundData = require('./test_input/sounds.json'),
    _outDir = './test_output';


/* Test the translators by creating 
 * each one and writing output */
 
// Doodads -> war3map.doo
var doodadsTranslator = new Translator.Doodads(doodadData, _outDir);
doodadsTranslator.write();

// Strings -> war3map.wts
var stringsTranslator = new Translator.Strings(stringData, _outDir);
stringsTranslator.write();

// Terrain -> war3map.w3e
var terrainTranslator = new Translator.Terrain(terrainData, _outDir);
terrainTranslator.write();

// Units/items -> war3mapUnits.doo
var unitsTranslator = new Translator.Units(unitData, _outDir);
unitsTranslator.write();

// Regions - >war3map.w3r
var regionsTranslator = new Translator.Regions(regionData, _outDir);
regionsTranslator.write();

// Cameras - >war3map.w3c
var camerasTranslator = new Translator.Cameras(cameraData, _outDir);
camerasTranslator.write();

// Sounds - >war3map.w3s
var soundsTranslator = new Translator.Sounds(soundData, _outDir);
soundsTranslator.write();
