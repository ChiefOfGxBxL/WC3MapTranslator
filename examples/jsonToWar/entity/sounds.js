/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
 const Translator = require('../../../index.js'); // require('wc3maptranslator');
 const { WarFile, Write } = require('../writeHelper.js');

// Define a new sound effect
const data = [
    {
        name: "gg_snd_HumanGlueScreenLoop1",
        path: "Sound\\Ambient\\HumanGlueScreenLoop1.wav",
        eax: "DefaultEAXON", // optional (defaults to "DefaultEAXON") - use a lookup table
        flags: { // optional (if none of these flags apply, you can leave this whole field out)
            looping: false,
            '3dSound': false,
            stopOutOfRange: false,
            music: false
        },
        fadeRate: { // optional (if you want both in/out to be default values, leave this field out)
            in: 0, // optional (defaults to 10)
            out: 0 // optional (defaults to 10)
        },
        volume: -1, // optional (defaults to -1 for default volume)
        pitch: 1.0, // optional (defaults to 1.0 for normal pitch)
        channel: 0, // optional (defaults to 0 for General channel) - use a lookup table
        distance: {
            min: 0.0,
            max: 0.0,
            cutoff: 0.0
        }
    }
];

var soundResult = new Translator.Sounds(data);
Write(WarFile.Entity.Sound, soundResult.buffer);
