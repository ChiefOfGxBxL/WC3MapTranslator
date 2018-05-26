const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.w3i');
const jsonPath = Path.resolve('./files/output/info.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var infoResult = new Translator.Info.warToJson(data);
    fs.writeFileSync(jsonPath, JSON.stringify(infoResult.json, null, 4));
});
