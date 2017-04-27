var Translator = require('../index.js'),

    // World data
    unitData = require('./test_input/units.json'),
    doodadData = require('./test_input/doodads.json'),
    terrainData = require('./test_input/terrain.json'),
    stringData = require('./test_input/strings.json'),
    regionData = require('./test_input/regions.json'),
    cameraData = require('./test_input/cameras.json'),
    soundData = require('./test_input/sounds.json'),
    
    // Object data
    unitObjData = require('./test_input/object/units.json'),
    
    _outDir = './test_output';


/* Test the translators by creating 
 * each one and writing output */
var translators = [
    //new Translator.Doodads(doodadData, _outDir), // Doodads -> war3map.doo
    //new Translator.Strings(stringData, _outDir), // Strings -> war3map.wts
    //new Translator.Terrain(terrainData, _outDir), // Terrain -> war3map.w3e
    //new Translator.Units(unitData, _outDir), // Units/items -> war3mapUnits.doo
    //new Translator.Regions(regionData, _outDir), // Regions -> war3map.w3r
    //new Translator.Cameras(cameraData, _outDir), // Cameras -> war3map.w3c
    //new Translator.Sounds(soundData, _outDir), // Sounds -> war3map.w3s
    
    new Translator.Object.Units(unitObjData, _outDir), // Custom units -> war3map.w3u
];

translators.forEach((t) => {
    t.write(); // Output each file
});
