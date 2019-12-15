import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';

interface Sound {
    name: string;
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

export class SoundsTranslator {

    public _outBufferToWar: HexBuffer;
    public _outBufferToJSON: W3Buffer;

    constructor() { }

    public jsonToWar(soundsJson: Sound[]) {
        this._outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        this._outBufferToWar.addInt(1); // file version
        this._outBufferToWar.addInt(soundsJson.length); // number of sounds

        /*
         * Body
         */
        soundsJson.forEach((sound) => {
            // Name with null terminator (e.g. gg_snd_HumanGlueScreenLoop1)
            this._outBufferToWar.addString(sound.name);
            this._outBufferToWar.addNullTerminator();

            // Path with null terminator (e.g. Sound\Ambient\HumanGlueScreenLoop1.wav)
            this._outBufferToWar.addString(sound.path);
            this._outBufferToWar.addNullTerminator();

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
            this._outBufferToWar.addString(sound.eax || 'DefaultEAXON'); // defaults to "DefaultEAXON"
            this._outBufferToWar.addNullTerminator();

            // Flags, if present (optional)
            let flags = 0;
            if (sound.flags) {
                if (sound.flags.looping) flags |= 0x1;
                if (sound.flags['3dSound']) flags |= 0x2;
                if (sound.flags.stopOutOfRange) flags |= 0x4;
                if (sound.flags.music) flags |= 0x8;
            }
            this._outBufferToWar.addInt(flags);

            // Fade in and out rate (optional)
            this._outBufferToWar.addInt(sound.fadeRate ? sound.fadeRate.in || 10 : 10); // default to 10
            this._outBufferToWar.addInt(sound.fadeRate ? sound.fadeRate.out || 10 : 10); // default to 10

            // Volume (optional)
            this._outBufferToWar.addInt(sound.volume || -1); // default to -1 (for normal volume)

            // Pitch (optional)
            this._outBufferToWar.addFloat(sound.pitch || 1.0); // default to 1.0 for normal pitch

            // Mystery numbers... their use is unknown by the w3x documentation, but they must be present
            this._outBufferToWar.addFloat(0);
            this._outBufferToWar.addInt(8); // or -1?

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
            this._outBufferToWar.addInt(sound.channel || 0); // default to 0

            // Distance fields
            this._outBufferToWar.addFloat(sound.distance.min);
            this._outBufferToWar.addFloat(sound.distance.max);
            this._outBufferToWar.addFloat(sound.distance.cutoff);

            // More mystery numbers...
            this._outBufferToWar.addFloat(0);
            this._outBufferToWar.addFloat(0);
            this._outBufferToWar.addFloat(127); // or -1?
            this._outBufferToWar.addFloat(0);
            this._outBufferToWar.addFloat(0);
            this._outBufferToWar.addFloat(0);
        });

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }

    public warToJson(buffer: Buffer) {
        const result = [];
        this._outBufferToJSON = new W3Buffer(buffer);

        const fileVersion = this._outBufferToJSON.readInt(), // File version
            numSounds = this._outBufferToJSON.readInt(); // # of sounds

        for (let i = 0; i < numSounds; i++) {
            const sound: Sound = {
                name: '',
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

            sound.name = this._outBufferToJSON.readString();
            sound.path = this._outBufferToJSON.readString();
            sound.eax = this._outBufferToJSON.readString();

            const flags = this._outBufferToJSON.readInt();
            sound.flags = {
                'looping': !!(flags & 0b1),    // 0x00000001=looping
                '3dSound': !!(flags & 0b10),   // 0x00000002=3D sound
                'stopOutOfRange': !!(flags & 0b100),  // 0x00000004=stop when out of range
                'music': !!(flags & 0b1000)  // 0x00000008=music
            };

            sound.fadeRate = {
                in: this._outBufferToJSON.readInt(),
                out: this._outBufferToJSON.readInt()
            };

            sound.volume = this._outBufferToJSON.readInt();
            sound.pitch = this._outBufferToJSON.readFloat();

            // Unknown values
            this._outBufferToJSON.readFloat();
            this._outBufferToJSON.readInt();

            sound.channel = this._outBufferToJSON.readInt();

            sound.distance = {
                min: this._outBufferToJSON.readFloat(),
                max: this._outBufferToJSON.readFloat(),
                cutoff: this._outBufferToJSON.readFloat()
            };

            // Unknown values
            this._outBufferToJSON.readFloat();
            this._outBufferToJSON.readFloat();
            this._outBufferToJSON.readFloat();
            this._outBufferToJSON.readFloat();
            this._outBufferToJSON.readFloat();
            this._outBufferToJSON.readFloat();

            result.push(sound);
        }

        return {
            errors: [],
            json: result
        };
    }
}
