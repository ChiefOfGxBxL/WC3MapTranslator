const
    Translator = require('../../../index.js'), // require('wc3maptranslator');
    Path = require('path'),
    fs = require('fs');

const filePath = Path.resolve('./files/input/war3map.wts');
const jsonPath = Path.resolve('./files/output/other/strings.json');

fs.readFile(filePath, function(err, data) {
    if(err) throw err;

    var stringResult = new Translator.Strings.warToJson(data);
    fs.writeFileSync(jsonPath, JSON.stringify(stringResult.json, null, 4));
});
