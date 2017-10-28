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

    // Map data
    mapData = require('./test_input/imports.json'),
    infoData = require('./test_input/info.json'),

    _outDir = './tests/test_output';


/* Test the translators by creating
 * each one and writing output */
var translators = [
    //new Translator.Doodads(doodadData), // Doodads -> war3map.doo
    //new Translator.Strings(stringData), // Strings -> war3map.wts
    //new Translator.Terrain(terrainData), // Terrain -> war3map.w3e
    //new Translator.Units(unitData), // Units/items -> war3mapUnits.doo
    //new Translator.Regions(regionData), // Regions -> war3map.w3r
    //new Translator.Cameras(cameraData), // Cameras -> war3map.w3c
    //new Translator.Sounds(soundData), // Sounds -> war3map.w3s

    //new Translator.Objects('units', unitObjData), // Custom units -> war3map.w3u
    //new Translator.Objects('items', itemObjData), // Custom items -> war3map.w3t
    //new Translator.Objects('buffs', buffObjData), // Custom buffs -> war3map.w3h
    //new Translator.Objects('destructables', destObjData), // Custom destructables -> war3map.w3b
    //new Translator.Objects('abilities', abilObjData), // Custom abilities -> war3map.w3a
    //new Translator.Objects('upgrades', upgrObjData), // Custom upgrades -> war3map.w3q
    //new Translator.Objects('doodads', doodObjData), // Custom doodads -> war3map.w3d

    //new Translator.Imports(mapData), // Imports -> war3map.imp
    new Translator.Info(infoData), // Info file -> war3map.w3i
];

translators.forEach((t) => {
    t.write(_outDir); // Output each file
});
