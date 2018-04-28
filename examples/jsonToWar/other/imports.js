/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
 const Translator = require('../../../index.js'); // require('wc3maptranslator');
 const { WarFile, Write } = require('../writeHelper.js');

// Specify an import
// Note: this doesn't actually import a file into the .w3x archive
// It just adds a record to the map's imported-file list, which is required
// for World Editor to know it has an imported file in the first place
const data = [
    { "path": "war3mapImported\\dogs.jpg" }
]

var importResult = new Translator.Imports(data);
Write(WarFile.Other.Import, importResult.buffer);
