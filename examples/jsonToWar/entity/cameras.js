/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
const Translator = require('../../../index.js'); // require('wc3maptranslator');
const { WarFile, Write } = require('../writeHelper.js');

// Place a single camera on the map
const data = [
    {
        name: "StartingCamera",
        target: {
            x: 0,
            y: 50.52
        },
        offsetZ: 4000, // i.e. height
        rotation: 20.25, // (optional) rotation in degrees
        aoa: 32.00, // angle of attack, in degrees
        distance: 500,
        roll: 0.0,
        fov: 60, // field of view, in degrees
        farClipping: 8000
    }
];

var cameraResult = new Translator.Cameras.jsonToWar(data);
Write(WarFile.Entity.Camera, cameraResult.buffer);
