/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
const Translator = require('../../../index.js'); // require('wc3maptranslator');
const { WarFile, Write } = require('../writeHelper.js');

const terrainData = require('../input/terrain.json');

var terrainResult = new Translator.Terrain.jsonToWar(terrainData);
Write(WarFile.Entity.Terrain, terrainResult.buffer);
