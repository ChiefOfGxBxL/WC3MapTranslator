var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path');

var SoundsTranslator = function(soundsJson) {
    outBuffer = new BufferedHexFileWriter();
    
    /* 
     * Header
     */
    outBuffer.addInt(1); // file version
    outBuffer.addInt(soundsJson.length); // number of sounds
    
    /* 
     * Body
     */
    soundsJson.forEach(function(sound) {
        // Name with null terminator (e.g. gg_snd_HumanGlueScreenLoop1)
        outBuffer.addString(sound.name);
        outBuffer.addNullTerminator();
        
        // Path with null terminator (e.g. Sound\Ambient\HumanGlueScreenLoop1.wav)
        outBuffer.addString(sound.path);
        outBuffer.addNullTerminator();
        
        // EAX effects enum (e.g. missiles, speech, etc)
        /*
            default = DefaultEAXON
            combat = CombatSoundsEAX
            drums = KotoDrumsEAX
            spells = SpellsEAX
            missiles = MissilesEAX
            hero speech = HeroAcksEAX
            doodads = DoodadsEAX
        */
        outBuffer.addString(sound.eax || 'DefaultEAXON'); // defaults to "DefaultEAXON"
        outBuffer.addNullTerminator();
        
        // Flags, if present (optional)
        var flags = 0;
        if(sound.flags) {
            if(sound.flags.looping) flags |= 0x1;
            if(sound.flags['3dSound']) flags |= 0x2;
            if(sound.flags.stopOutOfRange) flags |= 0x4;
            if(sound.flags.music) flags |= 0x8;
        }
        outBuffer.addInt(flags);
        
        // Fade in and out rate (optional)
        outBuffer.addInt((sound.fadeRate) ? (sound.fadeRate.in || 10): 10); // default to 10
        outBuffer.addInt((sound.fadeRate) ? (sound.fadeRate.out || 10) : 10); // default to 10
        
        // Volume (optional)
        outBuffer.addInt(sound.volume || -1); // default to -1 (for normal volume)
        
        // Pitch (optional)
        outBuffer.addFloat(sound.pitch || 1.0); // default to 1.0 for normal pitch
        
        // Mystery numbers... their use is unknown by the w3x documentation, but they must be present
        outBuffer.addFloat(0);
        outBuffer.addInt(8); // or -1?
        
        // Which channel to use? Use the lookup table for more details (optional)
        /*
            0=General
            1=Unit Selection
            2=Unit Acknowledgement
            3=Unit Movement
            4=Unit Ready
            5=Combat
            6=Error
            7=Music
            8=User Interface
            9=Looping Movement
            10=Looping Ambient
            11=Animations
            12=Constructions
            13=Birth
            14=Fire
        */
        outBuffer.addInt(sound.channel || 0); // default to 0
        
        // Distance fields
        outBuffer.addFloat(sound.distance.min);
        outBuffer.addFloat(sound.distance.max);
        outBuffer.addFloat(sound.distance.cutoff);
        
        // More mystery numbers...
        outBuffer.addFloat(0);
        outBuffer.addFloat(0);
        outBuffer.addFloat(127); // or -1?
        outBuffer.addFloat(0);
        outBuffer.addFloat(0);
        outBuffer.addFloat(0);
    });
    
    return {
        write: function(outputPath) {
            var path = (outputPath) ? Path.join(outputPath, 'war3map.w3s') : 'war3map.w3s';
            outBuffer.writeFile(path);
        }
    };
}

module.exports = SoundsTranslator;
