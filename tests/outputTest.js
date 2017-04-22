var Translator = require('../index.js'),
    _outDir = './test_output',
    unitData = require('./test_input/units.json'),
    doodadData = require('./test_input/doodads.json'),
    terrainData = require('./test_input/terrain.json'),
    stringData = require('./test_input/strings.json');


/* Test the translators by creating 
 * each one and writing output
 */
 
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
