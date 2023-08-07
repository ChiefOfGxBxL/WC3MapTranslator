import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult } from '../CommonInterfaces'

interface Map {
    name: string;
    author: string;
    description: string;
    recommendedPlayers: string;
    playableArea: PlayableMapArea;
    flags: MapFlags;
    mainTileType: string;
}

interface GameVersion {
    major: number;
    minor: number;
    patch: number;
    build: number;
}

interface Camera {
    bounds: number[];
    complements: number[];
}

interface MapFlags {
    hideMinimapInPreview: boolean;  // 0x0001: 1=hide minimap in preview screens
    modifyAllyPriorities: boolean;  // 0x0002: 1=modify ally priorities
    isMeleeMap: boolean;            // 0x0004: 1=melee map
    // 0x0008: 1=playable map size was large and has never been reduced to medium (?)
    maskedPartiallyVisible: boolean; // 0x0010: 1=masked area are partially visible
    fixedPlayerSetting: boolean;    // 0x0020: 1=fixed player setting for custom forces
    useCustomForces: boolean;       // 0x0040: 1=use custom forces
    useCustomTechtree: boolean;     // 0x0080: 1=use custom techtree
    useCustomAbilities: boolean;    // 0x0100: 1=use custom abilities
    useCustomUpgrades: boolean;     // 0x0200: 1=use custom upgrades
    // 0x0400: 1=map properties menu opened at least once since map creation (?)
    waterWavesOnCliffShores: boolean; // 0x0800: 1=show water waves on cliff shores
    waterWavesOnRollingShores: boolean; // 0x1000: 1=show water waves on rolling shores
    // 0x2000: 1=unknown
    // 0x4000: 1=unknown
    useItemClassificationSystem: boolean; // 0x8000: 1=use item classification system
    enableWaterTinting: boolean;        // 0x10000
    useAccurateProbabilityForCalculations: boolean; // 0x20000
    useCustomAbilitySkins: boolean;     // 0x40000
}

interface LoadingScreen {
    background: number;
    path: string;
    text: string;
    title: string;
    subtitle: string;
}

enum FogType {
    Linear = 0,
    Exponential1 = 1,
    Exponential2 = 2
}

interface Fog {
    type: FogType;
    startHeight: number;
    endHeight: number;
    density: number;
    color: number[]; // R G B A
}

interface PlayableMapArea {
    width: number;
    height: number;
}

interface Prologue {
    path: string;
    text: string;
    title: string;
    subtitle: string;
}

interface Info {
    saves: number;
    gameVersion: GameVersion;
    editorVersion: number;
    scriptLanguage: ScriptLanguage;
    supportedModes: SupportedModes;
    map: Map;
    camera: Camera;
    prologue: Prologue;
    loadingScreen: LoadingScreen;
    fog: Fog;
    globalWeather: string;
    customSoundEnvironment: string;
    customLightEnv: string;
    water: number[]; // R G B A
    players: Player[];
    forces: Force[];
}

interface PlayerStartingPosition {
    x: number;
    y: number;
    fixed: boolean;
}

interface Player {
    playerNum: number;
    type: number; // 1=Human, 2=Computer, 3=Neutral, 4=Rescuable
    race: number; // 1=Human, 2=Orc, 3=Undead, 4=Night Elf

    name: string;
    startingPos: PlayerStartingPosition;
}

interface ForceFlags {
    allied: boolean; // 0x00000001: allied (force 1)
    alliedVictory: boolean; // 0x00000002: allied victory
    // 0x00000004: share vision (the documentation has this incorrect)
    shareVision: boolean; // 0x00000008: share vision
    shareUnitControl: boolean; // 0x00000010: share unit control
    shareAdvUnitControl: boolean; // 0x00000020: share advanced unit control
}

interface Force {
    flags: ForceFlags;
    players: number; // UNSUPPORTED: (bit "x"=1 --> player "x" is in this force)
    name: string;
}

enum ScriptLanguage {
    JASS = 0,
    Lua = 1
}

enum SupportedModes {
    SD = 1,
    HD = 2,
    Both = 3
}

export abstract class InfoTranslator {

    public static jsonToWar(infoJson: Info): WarResult {
        const outBufferToWar = new HexBuffer();

        outBufferToWar.addInt(31); // file version, 0x1F
        outBufferToWar.addInt(infoJson.saves || 0);
        outBufferToWar.addInt(infoJson.editorVersion || 0);

        outBufferToWar.addInt(infoJson.gameVersion.major);
        outBufferToWar.addInt(infoJson.gameVersion.minor);
        outBufferToWar.addInt(infoJson.gameVersion.patch);
        outBufferToWar.addInt(infoJson.gameVersion.build);

        // Map information
        outBufferToWar.addString(infoJson.map.name);
        outBufferToWar.addString(infoJson.map.author);
        outBufferToWar.addString(infoJson.map.description);
        outBufferToWar.addString(infoJson.map.recommendedPlayers);

        // Camera bounds (8 floats total)
        for (let cbIndex = 0; cbIndex < 8; cbIndex++) {
            outBufferToWar.addFloat(infoJson.camera.bounds[cbIndex]);
        }

        // Camera complements (4 floats total)
        for (let ccIndex = 0; ccIndex < 4; ccIndex++) {
            outBufferToWar.addInt(infoJson.camera.complements[ccIndex]);
        }

        // Playable area
        outBufferToWar.addInt(infoJson.map.playableArea.width);
        outBufferToWar.addInt(infoJson.map.playableArea.height);

        /*
         * Flags
         */
        let flags = 0;
        if (infoJson.map.flags) { // can leave out the entire flags object, all flags will default to false
            if (infoJson.map.flags.hideMinimapInPreview) flags |= 0x0001; // hide minimap in preview screens
            if (infoJson.map.flags.modifyAllyPriorities) flags |= 0x0002; // modify ally priorities
            if (infoJson.map.flags.isMeleeMap) flags |= 0x0004; // melee map
            // 0x0008 - unknown;                                                 // playable map size was large and never reduced to medium (?)
            if (infoJson.map.flags.maskedPartiallyVisible) flags |= 0x0010; // masked area are partially visible
            if (infoJson.map.flags.fixedPlayerSetting) flags |= 0x0020; // fixed player setting for custom forces
            if (infoJson.map.flags.useCustomForces) flags |= 0x0040; // use custom forces
            if (infoJson.map.flags.useCustomTechtree) flags |= 0x0080; // use custom techtree
            if (infoJson.map.flags.useCustomAbilities) flags |= 0x0100; // use custom abilities
            if (infoJson.map.flags.useCustomUpgrades) flags |= 0x0200; // use custom upgrades
            // 0x0400 - unknown;                                                 // map properties menu opened at least once since map creation (?)
            if (infoJson.map.flags.waterWavesOnCliffShores) flags |= 0x0800; // show water waves on cliff shores
            if (infoJson.map.flags.waterWavesOnRollingShores) flags |= 0x1000; // show water waves on rolling shores
            // 0x2000: 1=unknown
            // 0x4000: 1=unknown
            if (infoJson.map.flags.useItemClassificationSystem) flags |= 0x8000
            if (infoJson.map.flags.enableWaterTinting) flags |= 0x10000
            if (infoJson.map.flags.useAccurateProbabilityForCalculations) flags |= 0x20000
            if (infoJson.map.flags.useCustomAbilitySkins) flags |= 0x40000
        }

        // Unknown, but these seem to always be on, at least for default maps
        flags |= 0x8000;
        flags |= 0x4000;
        flags |= 0x0400;

        outBufferToWar.addInt(flags); // Add flags

        // Map main ground type
        outBufferToWar.addChar(infoJson.map.mainTileType);

        // Loading screen
        outBufferToWar.addInt(infoJson.loadingScreen.background);
        outBufferToWar.addString(infoJson.loadingScreen.path);
        outBufferToWar.addString(infoJson.loadingScreen.text);
        outBufferToWar.addString(infoJson.loadingScreen.title);
        outBufferToWar.addString(infoJson.loadingScreen.subtitle);

        // Use game data set (Unsupported)
        outBufferToWar.addInt(0);

        // Prologue
        outBufferToWar.addString(infoJson.prologue.path);
        outBufferToWar.addString(infoJson.prologue.text);
        outBufferToWar.addString(infoJson.prologue.title);
        outBufferToWar.addString(infoJson.prologue.subtitle);

        // Fog
        outBufferToWar.addInt(infoJson.fog.type);
        outBufferToWar.addFloat(infoJson.fog.startHeight);
        outBufferToWar.addFloat(infoJson.fog.endHeight);
        outBufferToWar.addFloat(infoJson.fog.density);
        outBufferToWar.addByte(infoJson.fog.color[0]);
        outBufferToWar.addByte(infoJson.fog.color[1]);
        outBufferToWar.addByte(infoJson.fog.color[2]);
        outBufferToWar.addByte(255); // Fog alpha - unsupported

        // Misc.
        // If globalWeather is not defined or is set to 'none', use 0 sentinel value, else add char[4]
        if (!infoJson.globalWeather || infoJson.globalWeather.toLowerCase() === 'none') {
            outBufferToWar.addInt(0);
        } else {
            outBufferToWar.addChars(infoJson.globalWeather); // char[4] - lookup table
        }
        outBufferToWar.addString(infoJson.customSoundEnvironment || '');
        outBufferToWar.addChar(infoJson.customLightEnv || 'L');

        // Custom water tinting
        outBufferToWar.addByte(infoJson.water[0]);
        outBufferToWar.addByte(infoJson.water[1]);
        outBufferToWar.addByte(infoJson.water[2]);
        outBufferToWar.addByte(255); // Water alpha - unsupported

        outBufferToWar.addInt(infoJson.scriptLanguage);
        outBufferToWar.addInt(infoJson.supportedModes);
        outBufferToWar.addInt(0); // unknown

        // Players
        outBufferToWar.addInt(infoJson.players.length);
        infoJson.players.forEach((player) => {
            outBufferToWar.addInt(player.playerNum);
            outBufferToWar.addInt(player.type);
            outBufferToWar.addInt(player.race);
            outBufferToWar.addInt(player.startingPos.fixed ? 1 : 0);
            outBufferToWar.addString(player.name);
            outBufferToWar.addFloat(player.startingPos.x);
            outBufferToWar.addFloat(player.startingPos.y);
            outBufferToWar.addInt(0); // ally low prio flags - unsupported
            outBufferToWar.addInt(0); // ally high prio flags - unsupported
            outBufferToWar.addInt(0); // enemy low prio flags - unsupported
            outBufferToWar.addInt(0); // enemy high prio flags - unsupported
        });

        // Forces
        outBufferToWar.addInt(infoJson.forces.length);
        infoJson.forces.forEach((force) => {
            // Calculate flags
            let forceFlags = 0;
            if (force.flags.allied) forceFlags |= 0x0001;
            if (force.flags.alliedVictory) forceFlags |= 0x0002;
            // Skip 0x0004
            if (force.flags.shareVision) forceFlags |= 0x0008;
            if (force.flags.shareUnitControl) forceFlags |= 0x0010;
            if (force.flags.shareAdvUnitControl) forceFlags |= 0x0020;

            outBufferToWar.addInt(forceFlags);
            outBufferToWar.addInt(force.players);
            outBufferToWar.addString(force.name);
        });

        // Upgrades - unsupported
        outBufferToWar.addInt(0);

        // Tech availability - unsupported
        outBufferToWar.addInt(0);

        // Unit table (random) - unsupported
        outBufferToWar.addInt(0);

        // Item table (random) - unsupported
        outBufferToWar.addInt(0);

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<Info> {
        const result: Info = {
            map: {
                name: '',
                author: '',
                description: '',
                recommendedPlayers: '',
                playableArea: {
                    width: 64,
                    height: 64
                },
                mainTileType: '',
                flags: {
                    hideMinimapInPreview: false, // 0x0001: 1=hide minimap in preview screens
                    modifyAllyPriorities: true, // 0x0002: 1=modify ally priorities
                    isMeleeMap: false, // 0x0004: 1=melee map
                    // 0x0008: 1=playable map size was large and has never been reduced to medium (?)
                    maskedPartiallyVisible: false, // 0x0010: 1=masked area are partially visible
                    fixedPlayerSetting: false, // 0x0020: 1=fixed player setting for custom forces
                    useCustomForces: false, // 0x0040: 1=use custom forces
                    useCustomTechtree: false, // 0x0080: 1=use custom techtree
                    useCustomAbilities: false, // 0x0100: 1=use custom abilities
                    useCustomUpgrades: false, // 0x0200: 1=use custom upgrades
                    // 0x0400: 1=map properties menu opened at least once since map creation (?)
                    waterWavesOnCliffShores: false, // 0x0800: 1=show water waves on cliff shores
                    waterWavesOnRollingShores: false, // 0x1000: 1=show water waves on rolling shores
                    useItemClassificationSystem: false, // 0x8000: 1=use item classification system
                    enableWaterTinting: false, // 0x10000
                    useAccurateProbabilityForCalculations: false, // 0x20000
                    useCustomAbilitySkins: false // 0x40000
                }
            },
            loadingScreen: {
                background: 0,
                path: '',
                text: '',
                title: '',
                subtitle: ''
            }, prologue: {
                path: '',
                text: '',
                title: '',
                subtitle: ''
            }, fog: {
                type: FogType.Linear,
                startHeight: 0,
                endHeight: 0,
                density: 0,
                color: [0, 0, 0, 1]
            }, camera: {
                bounds: [],
                complements: []
            }, players: [

            ], forces: [

            ],
            saves: 0,
            editorVersion: 0,
            scriptLanguage: ScriptLanguage.JASS,
            supportedModes: SupportedModes.Both,
            gameVersion: {
                major: 0,
                minor: 0,
                patch: 0,
                build: 0
            },
            globalWeather: '',
            customSoundEnvironment: '',
            customLightEnv: '',
            water: []
        };
        const outBufferToJSON = new W3Buffer(buffer);

        const fileVersion = outBufferToJSON.readInt();

        result.saves = outBufferToJSON.readInt(),
        result.editorVersion = outBufferToJSON.readInt();

        result.gameVersion = {
            major: outBufferToJSON.readInt(),
            minor: outBufferToJSON.readInt(),
            patch: outBufferToJSON.readInt(),
            build: outBufferToJSON.readInt()
        };

        result.map.name = outBufferToJSON.readString();
        result.map.author = outBufferToJSON.readString();
        result.map.description = outBufferToJSON.readString();
        result.map.recommendedPlayers = outBufferToJSON.readString();

        result.camera.bounds = [
            outBufferToJSON.readFloat(), outBufferToJSON.readFloat(), outBufferToJSON.readFloat(), outBufferToJSON.readFloat(),
            outBufferToJSON.readFloat(), outBufferToJSON.readFloat(), outBufferToJSON.readFloat(), outBufferToJSON.readFloat()
        ];

        result.camera.complements = [
            outBufferToJSON.readInt(), outBufferToJSON.readInt(), outBufferToJSON.readInt(), outBufferToJSON.readInt()
        ];

        result.map.playableArea = {
            width: outBufferToJSON.readInt(),
            height: outBufferToJSON.readInt()
        };

        const flags = outBufferToJSON.readInt();
        result.map.flags = {
            hideMinimapInPreview:       !!(flags & 0x0001),
            modifyAllyPriorities:       !!(flags & 0x0002),
            isMeleeMap:                 !!(flags & 0x0004),
            // skip 0x008
            maskedPartiallyVisible:     !!(flags & 0x0010),
            fixedPlayerSetting:         !!(flags & 0x0020),
            useCustomForces:            !!(flags & 0x0040),
            useCustomTechtree:          !!(flags & 0x0080),
            useCustomAbilities:         !!(flags & 0x0100),
            useCustomUpgrades:          !!(flags & 0x0200),
            waterWavesOnCliffShores:    !!(flags & 0x0800),
            waterWavesOnRollingShores:  !!(flags & 0x1000),
            // skip 0x2000
            // skip 0x4000
            useItemClassificationSystem: !!(flags & 0x8000),
            enableWaterTinting:         !!(flags & 0x10000),
            useAccurateProbabilityForCalculations: !!(flags & 0x20000),
            useCustomAbilitySkins:      !!(flags & 0x40000)
        };

        result.map.mainTileType = outBufferToJSON.readChars();

        result.loadingScreen.background = outBufferToJSON.readInt();
        result.loadingScreen.path = outBufferToJSON.readString();
        result.loadingScreen.text = outBufferToJSON.readString();
        result.loadingScreen.title = outBufferToJSON.readString();
        result.loadingScreen.subtitle = outBufferToJSON.readString();

        const gameDataSet = outBufferToJSON.readInt(); // 0 = standard

        result.prologue = {
            path: outBufferToJSON.readString(),
            text: outBufferToJSON.readString(),
            title: outBufferToJSON.readString(),
            subtitle: outBufferToJSON.readString()
        };

        result.fog = {
            type: outBufferToJSON.readInt(),
            startHeight: outBufferToJSON.readFloat(),
            endHeight: outBufferToJSON.readFloat(),
            density: outBufferToJSON.readFloat(),
            color: [outBufferToJSON.readByte(), outBufferToJSON.readByte(), outBufferToJSON.readByte(), outBufferToJSON.readByte()] // R G B A
        };

        result.globalWeather = outBufferToJSON.readChars(4);
        result.customSoundEnvironment = outBufferToJSON.readString();
        result.customLightEnv = outBufferToJSON.readChars();
        result.water = [outBufferToJSON.readByte(), outBufferToJSON.readByte(), outBufferToJSON.readByte(), outBufferToJSON.readByte()]; // R G B A

        result.scriptLanguage = outBufferToJSON.readInt();
        result.supportedModes = outBufferToJSON.readInt();
        outBufferToJSON.readInt(); // unknown

        // Struct: players
        const numPlayers = outBufferToJSON.readInt();
        for (let i = 0; i < numPlayers; i++) {
            const player: Player = {
                name: '',
                startingPos: { x: 0, y: 0, fixed: false },
                playerNum: 0,
                type: 0,
                race: 0
            };

            player.playerNum = outBufferToJSON.readInt();
            player.type = outBufferToJSON.readInt(); // 1=Human, 2=Computer, 3=Neutral, 4=Rescuable
            player.race = outBufferToJSON.readInt(); // 1=Human, 2=Orc, 3=Undead, 4=Night Elf

            const isPlayerStartPositionFixed: boolean = outBufferToJSON.readInt() === 1; // 00000001 = fixed start position

            player.name = outBufferToJSON.readString();
            player.startingPos = {
                x: outBufferToJSON.readFloat(),
                y: outBufferToJSON.readFloat(),
                fixed: isPlayerStartPositionFixed
            };

            outBufferToJSON.readInt(); // ally low priorities flags (bit "x"=1 --> set for player "x")
            outBufferToJSON.readInt(); // ally high priorities flags (bit "x"=1 --> set for player "x")
            outBufferToJSON.readInt(); // enemy low priorities flags
            outBufferToJSON.readInt(); // enemy high priorities flags

            result.players.push(player);
        }

        // Struct: forces
        const numForces = outBufferToJSON.readInt();
        for (let i = 0; i < numForces; i++) {
            const force: Force = {
                flags: { allied: false, alliedVictory: true, shareVision: true, shareUnitControl: false, shareAdvUnitControl: false },
                players: 0,
                name: ''
            };

            const forceFlag = outBufferToJSON.readInt();
            force.flags = {
                allied: !!(forceFlag & 0b1), // 0x00000001: allied (force 1)
                alliedVictory: !!(forceFlag & 0b10), // 0x00000002: allied victory
                // 0x00000004: share vision (the documentation has this incorrect)
                shareVision: !!(forceFlag & 0b1000), // 0x00000008: share vision
                shareUnitControl: !!(forceFlag & 0b10000), // 0x00000010: share unit control
                shareAdvUnitControl: !!(forceFlag & 0b100000) // 0x00000020: share advanced unit control
            };
            force.players = outBufferToJSON.readInt(); // UNSUPPORTED: (bit "x"=1 --> player "x" is in this force; but carried over for accurate translation
            force.name = outBufferToJSON.readString();

            result.forces.push(force);
        }

        // UNSUPPORTED: Struct: upgrade avail.
        const numUpgrades = outBufferToJSON.readInt();
        for (let i = 0; i < numUpgrades; i++) {
            outBufferToJSON.readInt(); // Player Flags (bit "x"=1 if this change applies for player "x")
            outBufferToJSON.readChars(4); // upgrade id (as in UpgradeData.slk)
            outBufferToJSON.readInt(); // Level of the upgrade for which the availability is changed (this is actually the level - 1, so 1 => 0)
            outBufferToJSON.readInt(); // Availability (0 = unavailable, 1 = available, 2 = researched)
        }

        // UNSUPPORTED: Struct: tech avail.
        const numTech = outBufferToJSON.readInt();
        for (let i = 0; i < numTech; i++) {
            outBufferToJSON.readInt(); // Player Flags (bit "x"=1 if this change applies for player "x")
            outBufferToJSON.readChars(4); // tech id (this can be an item, unit or ability)
        }

        // UNSUPPORTED: Struct: random unit table
        const numUnitTable = outBufferToJSON.readInt();
        for (let i = 0; i < numUnitTable; i++) {
            outBufferToJSON.readInt(); // Group number
            outBufferToJSON.readString(); // Group name

            const numPositions = outBufferToJSON.readInt(); // Number "m" of positions
            for (let j = 0; j < numPositions; j++) {
                outBufferToJSON.readInt(); // unit table (=0), a building table (=1) or an item table (=2)

                const numLinesInTable = outBufferToJSON.readInt();
                for (let k = 0; k < numLinesInTable; k++) {
                    outBufferToJSON.readInt(); // Chance of the unit/item (percentage)
                    outBufferToJSON.readChars(4); // unit/item id's for this line specified
                }
            }
        }

        // UNSUPPORTED: Struct: random item table
        const numItemTable = outBufferToJSON.readInt();
        for (let i = 0; i < numItemTable; i++) {
            outBufferToJSON.readInt(); // Table number
            outBufferToJSON.readString(); // Table name

            const itemSetsCurrentTable = outBufferToJSON.readInt(); // Number "m" of item sets on the current item table
            for (let j = 0; j < itemSetsCurrentTable; j++) {

                const itemsInItemSet = outBufferToJSON.readInt(); // Number "i" of items on the current item set
                for (let k = 0; k < itemsInItemSet; k++) {
                    outBufferToJSON.readInt(); // Percentual chance
                    outBufferToJSON.readChars(4); // Item id (as in ItemData.slk)
                }

            }
        }

        return {
            errors: [],
            json: result
        };
    }
}
