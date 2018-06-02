let HexBuffer = require('../HexBuffer'),
    W3Buffer = require('../W3Buffer'),
    outBuffer;

const SoundsTranslator = {
    jsonToWar: function(soundsJson) {
        outBuffer = new HexBuffer();

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
            let flags = 0;
            if(sound.flags) {
                if(sound.flags.looping) flags |= 0x1;
                if(sound.flags['3dSound']) flags |= 0x2;
                if(sound.flags.stopOutOfRange) flags |= 0x4;
                if(sound.flags.music) flags |= 0x8;
            }
            outBuffer.addInt(flags);

            // Fade in and out rate (optional)
            outBuffer.addInt(sound.fadeRate ? sound.fadeRate.in || 10: 10); // default to 10
            outBuffer.addInt(sound.fadeRate ? sound.fadeRate.out || 10 : 10); // default to 10

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
            errors: [],
            buffer: outBuffer.getBuffer()
        };
    },
    warToJson: function(buffer) {
        let result = [],
            b = new W3Buffer(buffer);

        let fileVersion = b.readInt(), // File version
            numSounds = b.readInt(); // # of sounds

        for(let i = 0; i < numSounds; i++) {
            let sound = { flags: {}, fadeRate: {}, distance: {} };

            sound.name = b.readString();
            sound.path = b.readString();
            sound.eax = b.readString();

            let flags = b.readInt();
            sound.flags = {
                looping:        !!(flags & 0b1),    // 0x00000001=looping
                '3dSound':      !!(flags & 0b10),   // 0x00000002=3D sound
                stopOutOfRange: !!(flags & 0b100),  // 0x00000004=stop when out of range
                music:          !!(flags & 0b1000)  // 0x00000008=music
            };

            sound.fadeRate = {
                in: b.readInt(),
                out: b.readInt()
            };

            sound.volume = b.readInt();
            sound.pitch = b.readFloat();

            // Unknown values
            b.readFloat();
            b.readInt();

            sound.channel = b.readInt();

            sound.distance = {
                min: b.readFloat(),
                max: b.readFloat(),
                cutoff: b.readFloat()
            };

            // Unknown values
            b.readFloat();
            b.readFloat();
            b.readFloat();
            b.readFloat();
            b.readFloat();
            b.readFloat();

            result.push(sound);
        }

        return {
            errors: [],
            json: result
        };
    }
};

module.exports = SoundsTranslator;
