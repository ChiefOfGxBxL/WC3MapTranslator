const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.w3c');
const jsonPath = Path.resolve('./files/output/cameras.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var cameraResult = new Translator.Cameras.warToJson(data);
    fs.writeFileSync(jsonPath, JSON.stringify(cameraResult.json, null, 4));
});
