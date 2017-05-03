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
    itemObjData = require('./test_input/object/items.json'),
    buffObjData = require('./test_input/object/buffs.json'),
    destObjData = require('./test_input/object/destructables.json'),
    abilObjData = require('./test_input/object/abilities.json'),
    upgrObjData = require('./test_input/object/upgrades.json'),
    doodObjData = require('./test_input/object/doodads.json'),
    
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
    
    //new Translator.Objects('units', unitObjData, _outDir), // Custom units -> war3map.w3u
    //new Translator.Objects('items', itemObjData, _outDir), // Custom items -> war3map.w3t
    //new Translator.Objects('buffs', buffObjData, _outDir), // Custom buffs -> war3map.w3h
    //new Translator.Objects('destructables', destObjData, _outDir), // Custom destructables -> war3map.w3b
    //new Translator.Objects('abilities', abilObjData, _outDir), // Custom abilities -> war3map.w3a
    //new Translator.Objects('upgrades', upgrObjData, _outDir), // Custom upgrades -> war3map.w3q
    new Translator.Objects('doodads', doodObjData, _outDir), // Custom doodads -> war3map.w3d
];

translators.forEach((t) => {
    t.write(); // Output each file
});
