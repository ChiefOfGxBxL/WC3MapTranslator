import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult } from '../CommonInterfaces'

interface Sound {
    name: string;
    variableName: string;
    path: string;
    eax: string;
    flags: SoundFlags;
    fadeRate: FadeRate;
    volume: number;
    pitch: number;
    channel: number;
    distance: Distance;
}

interface FadeRate {
    in: number;
    out: number;
}

interface SoundFlags {
    looping: boolean;    // 0x00000001=looping
    '3dSound': boolean;   // 0x00000002=3D sound
    stopOutOfRange: boolean;  // 0x00000004=stop when out of range
    music: boolean;  // 0x00000008=music
}

interface Distance {
    min: number;
    max: number;
    cutoff: number;
}

export abstract class SoundsTranslator {

    public static jsonToWar(soundsJson: Sound[]): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addInt(3); // file version
        outBufferToWar.addInt(soundsJson.length); // number of sounds

        /*
         * Body
         */
        soundsJson.forEach((sound) => {
            outBufferToWar.addString(sound.name); // e.g. gg_snd_HumanGlueScreenLoop1
            outBufferToWar.addString(sound.path); // e.g. Sound\Ambient\HumanGlueScreenLoop1.wav

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
            outBufferToWar.addString(sound.eax || 'DefaultEAXON'); // defaults to "DefaultEAXON"

            // Flags, if present (optional)
            let flags = 0;
            if (sound.flags) {
                if (sound.flags.looping) flags |= 0x1;
                if (sound.flags['3dSound']) flags |= 0x2;
                if (sound.flags.stopOutOfRange) flags |= 0x4;
                if (sound.flags.music) flags |= 0x8;
            }
            outBufferToWar.addInt(flags);

            // Fade in and out rate (optional)
            outBufferToWar.addInt(sound.fadeRate ? sound.fadeRate.in || 10 : 10); // default to 10
            outBufferToWar.addInt(sound.fadeRate ? sound.fadeRate.out || 10 : 10); // default to 10

            // Volume (optional)
            outBufferToWar.addInt(sound.volume || -1); // default to -1 (for normal volume)

            // Pitch (optional)
            outBufferToWar.addFloat(sound.pitch || 1.0); // default to 1.0 for normal pitch

            // Mystery numbers... their use is unknown by the w3x documentation, but they must be present
            outBufferToWar.addFloat(0);
            outBufferToWar.addInt(8); // or -1?

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
            outBufferToWar.addInt(sound.channel || 0); // default to 0

            // Distance fields
            outBufferToWar.addFloat(sound.distance.min);
            outBufferToWar.addFloat(sound.distance.max);
            outBufferToWar.addFloat(sound.distance.cutoff);

            // More mystery numbers...
            outBufferToWar.addFloat(0);
            outBufferToWar.addFloat(0);
            outBufferToWar.addFloat(127); // or -1?
            outBufferToWar.addFloat(0);
            outBufferToWar.addFloat(0);
            outBufferToWar.addFloat(0);

            outBufferToWar.addString(sound.variableName);
            outBufferToWar.addString('');
            outBufferToWar.addString(sound.path);

            // More unknowns
            outBufferToWar.addFloat(0);
            outBufferToWar.addByte(0);
            outBufferToWar.addFloat(0);
            outBufferToWar.addFloat(0);
            outBufferToWar.addFloat(0);
            outBufferToWar.addByte(0);
            outBufferToWar.addFloat(0);
        });

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<Sound[]> {
        const result = [];
        const outBufferToJSON = new W3Buffer(buffer);

        const fileVersion = outBufferToJSON.readInt(), // File version
            numSounds = outBufferToJSON.readInt(); // # of sounds

        for (let i = 0; i < numSounds; i++) {
            const sound: Sound = {
                name: '',
                variableName: '',
                path: '',
                eax: '',
                volume: 0,
                pitch: 0,
                channel: 0,
                flags: {
                    'looping': true,    // 0x00000001=looping
                    '3dSound': true,   // 0x00000002=3D sound
                    'stopOutOfRange': true,  // 0x00000004=stop when out of range
                    'music': true  // 0x00000008=music},
                },
                fadeRate: {
                    in: 0,
                    out: 0
                },
                distance: {
                    min: 0,
                    max: 0,
                    cutoff: 0
                }
            };

            sound.name = outBufferToJSON.readString();
            sound.path = outBufferToJSON.readString();
            sound.eax = outBufferToJSON.readString();

            const flags = outBufferToJSON.readInt();
            sound.flags = {
                'looping': !!(flags & 0b1),    // 0x00000001=looping
                '3dSound': !!(flags & 0b10),   // 0x00000002=3D sound
                'stopOutOfRange': !!(flags & 0b100),  // 0x00000004=stop when out of range
                'music': !!(flags & 0b1000)  // 0x00000008=music
            };

            sound.fadeRate = {
                in: outBufferToJSON.readInt(),
                out: outBufferToJSON.readInt()
            };

            sound.volume = outBufferToJSON.readInt();
            sound.pitch = outBufferToJSON.readFloat();

            // Unknown values
            outBufferToJSON.readFloat();
            outBufferToJSON.readInt();

            sound.channel = outBufferToJSON.readInt();

            sound.distance = {
                min: outBufferToJSON.readFloat(),
                max: outBufferToJSON.readFloat(),
                cutoff: outBufferToJSON.readFloat()
            };

            // Unknown values
            outBufferToJSON.readFloat();
            outBufferToJSON.readFloat();
            outBufferToJSON.readFloat();
            outBufferToJSON.readFloat();
            outBufferToJSON.readFloat();
            outBufferToJSON.readFloat();

            sound.variableName = outBufferToJSON.readString();

            // Unknown values
            outBufferToJSON.readString();
            outBufferToJSON.readString();
            outBufferToJSON.readChars(4);
            outBufferToJSON.readChars(1);
            outBufferToJSON.readChars(4);
            outBufferToJSON.readChars(4);
            outBufferToJSON.readChars(4);
            outBufferToJSON.readChars(1);
            outBufferToJSON.readChars(4);

            result.push(sound);
        }

        return {
            errors: [],
            json: result
        };
    }
}
