const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.w3e');
const jsonPath = Path.resolve('./files/output/terrain.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var terrainResult = new Translator.Terrain.warToJson(data);
    fs.writeFileSync(jsonPath, JSON.stringify(terrainResult.json, null, 4));
});
