import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, ITranslator } from '../CommonInterfaces';

enum EffectType {
    Default = 'DefaultEAXON',
    Combat = 'CombatSoundsEAX',
    Drums = 'KotoDrumsEAX',
    Spells = 'SpellsEAX',
    Missiles = 'MissilesEAX',
    HeroSpeech = 'HeroAcksEAX',
    Doodads = 'DoodadsEAX'
}

enum Channel {
    General = 0,
    UnitSelection,
    UnitAcknowledgement,
    UnitMovement,
    UnitReady,
    Combat,
    Error,
    Music,
    UserInterface,
    LoopingMovement,
    LoopingAmbient,
    Animations,
    Constructions,
    Birth,
    Fire,
    LegacyMidi,
    CinematicGeneral,
    CinematicAmbient,
    CinematicMusic,
    CinematicDialog,
    CinematicSFX1,
    CinematicSFX2,
    CinematicSFX3
}

interface Sound {
    variableName: string;
    internalName: string;
    path: string;
    effect?: EffectType;
    flags: SoundFlags;
    fadeRate: FadeRate;
    volume?: number;
    pitch: number;
    channel?: number;
    distance: Distance;
    pitchVariance?: number;
    priority?: number;
}

interface FadeRate {
    in: number;
    out: number;
}

interface SoundFlags {
    looping: boolean; // 0x1 = looping
    '3dSound': boolean; // 0x2 = 3D sound
    stopOutOfRange: boolean; // 0x4 = stop when out of range
    music: boolean; // 0x8 = music
    imported: boolean; // 0x10 = imported; NOTE: this has been observed for imported files, but not confirmed
}

interface Distance {
    min: number;
    max: number;
    cutoff: number;
}

// Lookup table to match raw `effect` string to EffectType
// Seems stupid but is necessary because TypeScript string enums
// don't have reverse lookup
const effectTypeLookup: Record<string, EffectType> = {
    [EffectType.Combat]: EffectType.Combat,
    [EffectType.Default]: EffectType.Default,
    [EffectType.Doodads]: EffectType.Doodads,
    [EffectType.Drums]: EffectType.Drums,
    [EffectType.HeroSpeech]: EffectType.HeroSpeech,
    [EffectType.Missiles]: EffectType.Missiles,
    [EffectType.Spells]: EffectType.Spells
};

const MYSTERY_NUM_1 = 1333788672; // (hex) 00 00 80 4F
const MYSTERY_NUM_2 = -1; // (hex) FF FF FF FF

export abstract class SoundsTranslator extends ITranslator {
    public static readonly EffectType = EffectType;
    public static readonly Channel = Channel;

    public static jsonToWar(soundsJson: Sound[]): WarResult {
        const outBufferToWar = new HexBuffer();
        /*
         * Header
         */
        outBufferToWar.addInt(3); // file version

        /*
         * Body
         */
        outBufferToWar.addInt(soundsJson.length); // number of sounds
        for (const sound of soundsJson) {
            const isImportedSound = sound.path.startsWith('war3mapImported/');

            outBufferToWar.addString('gg_snd_' + sound.variableName); // e.g. gg_snd_HumanGlueScreenLoop1
            outBufferToWar.addString(sound.path); // e.g. Sound\Ambient\HumanGlueScreenLoop1.wav

            outBufferToWar.addString(sound.effect || EffectType.Default);

            // Flags, if present (optional)
            let flags = 0;
            if (sound.flags) {
                if (sound.flags.looping) flags |= 0x1;
                if (sound.flags['3dSound']) flags |= 0x2;
                if (sound.flags.stopOutOfRange) flags |= 0x4;
                if (sound.flags.music) flags |= 0x8;
                if (sound.flags.imported) flags |= 0x10;
            }
            outBufferToWar.addInt(flags);

            // Fade in and out rate (optional); unmodified rates are displayed as 1 in WorldEditor, but set to 0 internally
            outBufferToWar.addInt(sound.fadeRate?.in || 0);
            outBufferToWar.addInt(sound.fadeRate?.out || 0);

            outBufferToWar.addInt(sound.volume || 127); // Volume (optional): default to 127 (for normal volume)

            // Pitch (optional)
            // Default to 1.0 (hard-coded byte sequence) for normal pitch
            if (isImportedSound || sound.pitch !== 1.0) {
                outBufferToWar.addFloat(sound.pitch);
            } else {
                outBufferToWar.addInt(MYSTERY_NUM_1); // 00 00 80 4F - unmodified (only for native sounds)
            }

            // Pitch variance (optional)
            if (sound.pitchVariance && sound.pitchVariance === 4294967296) {
                // Special value signifies default/unmodified value
                outBufferToWar.addInt(MYSTERY_NUM_1); // 00 00 80 4F - unmodified
            } else {
                outBufferToWar.addFloat(sound.pitchVariance || 0);
            }

            outBufferToWar.addInt(sound.priority || 100);

            outBufferToWar.addInt(sound.channel || Channel.General);

            // Distance fields- defaults are different for each sound
            outBufferToWar.addInt(sound.distance.min);
            outBufferToWar.addInt(sound.distance.max);
            outBufferToWar.addInt(sound.distance.cutoff);

            // More mystery numbers...
            outBufferToWar.addInt(isImportedSound ? 0 : MYSTERY_NUM_1);
            outBufferToWar.addInt(isImportedSound ? 0 : MYSTERY_NUM_1);
            outBufferToWar.addInt(isImportedSound ? 127 : MYSTERY_NUM_2);
            outBufferToWar.addInt(isImportedSound ? 0 : MYSTERY_NUM_1);
            outBufferToWar.addInt(isImportedSound ? 0 : MYSTERY_NUM_1);
            outBufferToWar.addInt(isImportedSound ? 0 : MYSTERY_NUM_1);

            outBufferToWar.addString('gg_snd_' + sound.variableName);
            outBufferToWar.addString(sound.internalName); // e.g. FootmanPissed, War2Intro, HeroicVictory, RoosterSound
            outBufferToWar.addString(sound.path);

            // More unknowns
            outBufferToWar.addInt(MYSTERY_NUM_2);
            outBufferToWar.addByte(0);
            outBufferToWar.addInt(MYSTERY_NUM_2);
            outBufferToWar.addInt(0);
            outBufferToWar.addInt(0);
            outBufferToWar.addByte(0);
            outBufferToWar.addInt(1);
        }

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<Sound[]> {
        const result = [];
        const outBufferToJSON = new W3Buffer(buffer);

        outBufferToJSON.readInt(); // File version = 3
        const numSounds = outBufferToJSON.readInt(); // # of sounds

        for (let i = 0; i < numSounds; i++) {
            const sound: Sound = {
                variableName: '',
                internalName: '',
                path: '',
                volume: 0,
                pitch: 0,
                pitchVariance: 0,
                priority: 100,
                flags: {
                    looping: true,
                    '3dSound': true,
                    stopOutOfRange: true,
                    music: true,
                    imported: false
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

            sound.variableName = outBufferToJSON.readString().replace('gg_snd_', '');
            sound.path = outBufferToJSON.readString();

            sound.effect = effectTypeLookup[outBufferToJSON.readString()];

            const flags = outBufferToJSON.readInt();
            sound.flags = {
                looping: !!(flags & 0x1),
                '3dSound': !!(flags & 0x2),
                stopOutOfRange: !!(flags & 0x4),
                music: !!(flags & 0x8),
                imported: !!(flags & 0x10)
            };

            sound.fadeRate = {
                in: outBufferToJSON.readInt(),
                out: outBufferToJSON.readInt()
            };

            sound.volume = outBufferToJSON.readInt();

            // Unmodified pitch in WC3 editor stores weird constant to represent pitch=1.0
            const pitch = outBufferToJSON.readFloat();
            sound.pitch = pitch === 4294967296 ? 1.0 : pitch;

            sound.pitchVariance = outBufferToJSON.readFloat(); // 4294967296 = use default value

            sound.priority = outBufferToJSON.readInt();

            sound.channel = outBufferToJSON.readInt();

            sound.distance = {
                min: outBufferToJSON.readInt(),
                max: outBufferToJSON.readInt(),
                cutoff: outBufferToJSON.readInt()
            };

            // Unknown values
            outBufferToJSON.readInt();
            outBufferToJSON.readInt();
            outBufferToJSON.readInt(); // appears to be -1 for native sounds, 127 for imported sounds
            outBufferToJSON.readInt();
            outBufferToJSON.readInt();
            outBufferToJSON.readInt();

            outBufferToJSON.readString(); // sound.variableName repeated again?
            sound.internalName = outBufferToJSON.readString();
            outBufferToJSON.readString(); // sound.path repeated again?

            // Unknown values
            outBufferToJSON.readChars(4);
            outBufferToJSON.readChars(1);
            outBufferToJSON.readChars(4);
            outBufferToJSON.readChars(4);
            outBufferToJSON.readChars(4);
            outBufferToJSON.readChars(1);
            outBufferToJSON.readInt();

            result.push(sound);
        }

        return {
            errors: [],
            json: result
        };
    }
}
