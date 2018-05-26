/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
 const Translator = require('../../../index.js'); // require('wc3maptranslator');
 const { WarFile, Write } = require('../writeHelper.js');

const data = {
    // Associates a key (id #), with a string value
    "1": "Player 0",
    "2": "Player 1",
    "3": "Player 2",
    "4": "Player 3",
    "5": "Player 4",
    "6": "Player 5",
};

var stringsResult = new Translator.Strings.jsonToWar(data);
Write(WarFile.Other.String, stringsResult.buffer);
