import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, ITranslator } from '../CommonInterfaces';
import { fromPlayerBitfield, toPlayerBitfield, PlayerArray } from '../PlayerBitfield';

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
    hideMinimapInPreview: boolean;        // 0x1: 1=hide minimap in preview screens
    modifyAllyPriorities: boolean;        // 0x2: 1=modify ally priorities
    isMeleeMap: boolean;                  // 0x4: 1=melee map
    // unknown                            // 0x8: 1=playable map size was large and has never been reduced to medium (?)
    maskedPartiallyVisible: boolean;      // 0x10: 1=masked area are partially visible
    fixedPlayerSetting: boolean;          // 0x20: 1=fixed player setting for custom forces
    useCustomForces: boolean;             // 0x40: 1=use custom forces
    useCustomTechtree: boolean;           // 0x80: 1=use custom techtree
    useCustomAbilities: boolean;          // 0x100: 1=use custom abilities
    useCustomUpgrades: boolean;           // 0x200: 1=use custom upgrades
    // unknown                            // 0x400: 1=map properties menu opened at least once since map creation (?)
    waterWavesOnCliffShores: boolean;     // 0x800: 1=show water waves on cliff shores
    waterWavesOnRollingShores: boolean;   // 0x1000: 1=show water waves on rolling shores
    useTerrainFog: boolean;               // 0x2000: 1=custom fog checkbox enabled
    // unknown                            // 0x4000: 1=unknown
    useItemClassificationSystem: boolean; // 0x8000: 1=use item classification system
    enableWaterTinting: boolean;          // 0x10000
    useAccurateProbabilityForCalculations: boolean; // 0x20000
    useCustomAbilitySkins: boolean;       // 0x40000
    disableDenyIcon: boolean;             // 0x80000
    forceDefaultCameraZoom: boolean;      // 0x100000
    forceMaxCameraZoom: boolean;          // 0x200000
    forceMinCameraZoom: boolean;          // 0x400000
}

interface LoadingScreen {
    background: number;
    path: string;
    text: string;
    title: string;
    subtitle: string;
}

interface Fog {
    type: FogType;
    startHeight: number;
    endHeight: number;
    density: number;
    color: number[]; // R G B
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
    gameDataSet: GameDataSet;
    gameDataVersion: GameDataVersion;
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
    water: number[]; // R G B
    players: Player[];
    forces: Force[];
    forceDefaultCameraZoom: number;
    forceMaxCameraZoom: number;
    forceMinCameraZoom: number;
    upgrades: Upgrade[];
    techtree: Techtree[];
    randomGroupTable: RandomGroupTable[];
    randomItemTable: RandomItemTable[];
}

interface PlayerStartingPosition {
    x: number;
    y: number;
    fixed: boolean;
}

interface Player {
    playerNum: number;
    type: PlayerType;
    race: PlayerRace;

    name: string;
    startingPos: PlayerStartingPosition;

    allyLowPriorityFlags?: PlayerArray;
    allyHighPriorityFlags?: PlayerArray;
    enemyLowPriorityFlags?: PlayerArray;
    enemyHighPriorityFlags?: PlayerArray;
}

interface ForceFlags {
    allied: boolean;              // 0x1: allied (force 1)
    alliedVictory: boolean;       // 0x2: allied victory
    // unknown                    // 0x4: share vision (the documentation has this incorrect)
    shareVision: boolean;         // 0x8: share vision
    shareUnitControl: boolean;    // 0x10: share unit control
    shareAdvUnitControl: boolean; // 0x20: share advanced unit control
}

interface Force {
    flags: ForceFlags;
    players: PlayerArray;
    name: string;
}

interface RandomItem {
    chance: number;
    id: string;
}

interface RandomItemTable {
    number: number;
    name: string;
    sets: RandomItem[][];
}

interface RandomGroupRow {
    chance: number;
    entries: string[];
}

interface RandomGroupTable {
    number: number;
    name: string;
    positions: RandomGroupType[];
    rows: RandomGroupRow[];
}

interface Techtree {
    players: PlayerArray;
    id: string; // this can be an item, unit or ability
}

interface Upgrade {
    players: PlayerArray;
    id: string;
    level: number; // 0-based index
    availability: UpgradeAvailability;
}

enum UpgradeAvailability {
    Unavailable = 0,
    Available,
    Researched
}

enum PlayerType {
    Human = 1,
    Computer,
    Neutral,
    Rescuable
}

enum PlayerRace {
    Human = 1,
    Orc,
    Undead,
    NightElf
}

enum FogType {
    Linear = 0,
    Exponential1 = 1,
    Exponential2 = 2
}

enum GameDataSet {
    Default = 0,
    Custom101 = 1,
    MeleeLatestPath = 2
}

enum GameDataVersion {
    ROC = 0,
    TFT = 1
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

enum RandomGroupType {
    Unit = 0,
    Building = 1,
    Item = 2
}

export abstract class InfoTranslator extends ITranslator {
    public static readonly PlayerType = PlayerType;
    public static readonly PlayerRace = PlayerRace;
    public static readonly FogType = FogType;
    public static readonly GameDataSet = GameDataSet;
    public static readonly GameDataVersion = GameDataVersion;
    public static readonly ScriptLanguage = ScriptLanguage;
    public static readonly SupportedModes = SupportedModes;
    public static readonly UpgradeAvailability = UpgradeAvailability;

    public static jsonToWar(infoJson: Info): WarResult {
        const outBufferToWar = new HexBuffer();

        outBufferToWar.addInt(33); // file version
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
            if (infoJson.map.flags.hideMinimapInPreview) flags |= 0x1; // hide minimap in preview screens
            if (infoJson.map.flags.modifyAllyPriorities) flags |= 0x2; // modify ally priorities
            if (infoJson.map.flags.isMeleeMap) flags |= 0x4; // melee map
            // 0x8 - unknown;                                                 // playable map size was large and never reduced to medium (?)
            if (infoJson.map.flags.maskedPartiallyVisible) flags |= 0x10; // masked area are partially visible
            if (infoJson.map.flags.fixedPlayerSetting) flags |= 0x20; // fixed player setting for custom forces
            if (infoJson.map.flags.useCustomForces) flags |= 0x40; // use custom forces
            if (infoJson.map.flags.useCustomTechtree) flags |= 0x80; // use custom techtree
            if (infoJson.map.flags.useCustomAbilities) flags |= 0x100; // use custom abilities
            if (infoJson.map.flags.useCustomUpgrades) flags |= 0x200; // use custom upgrades
            // 0x0400 - unknown;                                                 // map properties menu opened at least once since map creation (?)
            if (infoJson.map.flags.waterWavesOnCliffShores) flags |= 0x800; // show water waves on cliff shores
            if (infoJson.map.flags.waterWavesOnRollingShores) flags |= 0x1000; // show water waves on rolling shores
            if (infoJson.map.flags.useTerrainFog) flags |= 0x2000; // Use Terrain Fog enabled
            // 0x4000: 1=unknown
            if (infoJson.map.flags.useItemClassificationSystem) flags |= 0x8000;
            if (infoJson.map.flags.enableWaterTinting) flags |= 0x10000;
            if (infoJson.map.flags.useAccurateProbabilityForCalculations) flags |= 0x20000;
            if (infoJson.map.flags.useCustomAbilitySkins) flags |= 0x40000;
            if (infoJson.map.flags.disableDenyIcon) flags |= 0x80000;
            if (infoJson.map.flags.forceDefaultCameraZoom) flags |= 0x100000;
            if (infoJson.map.flags.forceMaxCameraZoom) flags |= 0x200000;
            if (infoJson.map.flags.forceMinCameraZoom) flags |= 0x400000;
        }

        // Unknown, but these seem to always be on, at least for default maps
        flags |= 0x8000;
        flags |= 0x4000;
        flags |= 0x400;
        outBufferToWar.addInt(flags);

        // Map main ground type
        outBufferToWar.addChar(infoJson.map.mainTileType);

        // Loading screen
        outBufferToWar.addInt(infoJson.loadingScreen.background);
        outBufferToWar.addString(infoJson.loadingScreen.path);
        outBufferToWar.addString(infoJson.loadingScreen.text);
        outBufferToWar.addString(infoJson.loadingScreen.title);
        outBufferToWar.addString(infoJson.loadingScreen.subtitle);

        // Use game data set
        outBufferToWar.addInt(infoJson.gameDataSet);

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
        outBufferToWar.addByte(255); // Fog alpha - World Editor removed this field, but the byte is still needed

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
        outBufferToWar.addByte(255); // Water alpha - World Editor removed this field, but the byte is still needed

        outBufferToWar.addInt(infoJson.scriptLanguage);
        outBufferToWar.addInt(infoJson.supportedModes);
        outBufferToWar.addInt(infoJson.gameDataVersion);

        outBufferToWar.addInt(infoJson.forceDefaultCameraZoom);
        outBufferToWar.addInt(infoJson.forceMaxCameraZoom);
        outBufferToWar.addInt(infoJson.forceMinCameraZoom);

        const availablePlayerNums = infoJson.players.map((player) => player.playerNum);

        // Players
        outBufferToWar.addInt(infoJson.players.length);
        for (const player of infoJson.players) {
            outBufferToWar.addInt(player.playerNum);
            outBufferToWar.addInt(player.type);
            outBufferToWar.addInt(player.race);
            outBufferToWar.addInt(player.startingPos.fixed ? 1 : 0);
            outBufferToWar.addString(player.name);
            outBufferToWar.addFloat(player.startingPos.x);
            outBufferToWar.addFloat(player.startingPos.y);
            outBufferToWar.addInt(toPlayerBitfield(player.allyLowPriorityFlags || [], availablePlayerNums));
            outBufferToWar.addInt(toPlayerBitfield(player.allyHighPriorityFlags || [], availablePlayerNums));
            outBufferToWar.addInt(toPlayerBitfield(player.enemyLowPriorityFlags || [], availablePlayerNums));
            outBufferToWar.addInt(toPlayerBitfield(player.enemyHighPriorityFlags || [], availablePlayerNums));
        }

        // Forces
        outBufferToWar.addInt(infoJson.forces.length);
        // TODO: if forces is [], write special value of `force.players = -1`
        for (let i = 0; i < infoJson.forces.length; i++) {
            const force = infoJson.forces[i];

            // Calculate flags
            let forceFlags = 0;
            if (force.flags.allied) forceFlags |= 0x1;
            if (force.flags.alliedVictory) forceFlags |= 0x2;
            // Skip 0x4
            if (force.flags.shareVision) forceFlags |= 0x8;
            if (force.flags.shareUnitControl) forceFlags |= 0x10;
            if (force.flags.shareAdvUnitControl) forceFlags |= 0x20;

            outBufferToWar.addInt(forceFlags);

            // Players on force
            // The first force always contains "1" bits for all the players that don't exist (special case)
            // E.g. in a 4-player map w/ [Red, Blue, Teal, Purple], force 1 will "contain" Yellow, Orange, etc.
            let forcePlayerBitfield = toPlayerBitfield(force.players, availablePlayerNums);
            if (i === 0) {
                // `Set.difference` would be easier but not working, even with ESNext, so remove each existing player via filtering
                const nonExistentPlayerNums = new Set(
                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                        .filter((playerNum) => !availablePlayerNums.includes(playerNum))
                );
                for (const nonExistentPlayerNum of nonExistentPlayerNums) {
                    forcePlayerBitfield |= (0b1 << nonExistentPlayerNum);
                }
            }
            outBufferToWar.addInt(forcePlayerBitfield);

            outBufferToWar.addString(force.name);
        }

        // Upgrades
        outBufferToWar.addInt(infoJson.upgrades.length);
        for (const upgrade of infoJson.upgrades) {
            outBufferToWar.addInt(toPlayerBitfield(upgrade.players, availablePlayerNums));
            outBufferToWar.addChars(upgrade.id);
            outBufferToWar.addInt(upgrade.level);
            outBufferToWar.addInt(upgrade.availability);
        }

        // Tech availability
        outBufferToWar.addInt(infoJson.techtree.length);
        for (const techtree of infoJson.techtree) {
            outBufferToWar.addInt(toPlayerBitfield(techtree.players, availablePlayerNums));
            outBufferToWar.addChars(techtree.id);
        }

        // Random groups
        outBufferToWar.addInt(infoJson.randomGroupTable.length);
        for (const groupTable of infoJson.randomGroupTable) {
            outBufferToWar.addInt(groupTable.number);
            outBufferToWar.addString(groupTable.name);
            outBufferToWar.addInt(groupTable.positions.length);

            for (const position of groupTable.positions) {
                outBufferToWar.addInt(position);
            }

            outBufferToWar.addInt(groupTable.rows.length);

            for (const row of groupTable.rows) {
                outBufferToWar.addInt(row.chance);
                for (const entry of row.entries) {
                    outBufferToWar.addChars(entry);
                }
            }
        }

        // Item table (random)
        outBufferToWar.addInt(infoJson.randomItemTable.length);
        for (const itemTable of infoJson.randomItemTable) {
            outBufferToWar.addInt(itemTable.number);
            outBufferToWar.addString(itemTable.name);

            outBufferToWar.addInt(itemTable.sets.length);
            for (const itemSet of itemTable.sets) {
                outBufferToWar.addInt(itemSet.length);
                for (const item of itemSet) {
                    outBufferToWar.addInt(item.chance);
                    outBufferToWar.addChars(item.id);
                }
            }
        }

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
                    hideMinimapInPreview: false, // 0x1: 1=hide minimap in preview screens
                    modifyAllyPriorities: true, // 0x2: 1=modify ally priorities
                    isMeleeMap: false, // 0x4: 1=melee map
                    // 0x8: 1=playable map size was large and has never been reduced to medium (?)
                    maskedPartiallyVisible: false, // 0x0010: 1=masked area are partially visible
                    fixedPlayerSetting: false, // 0x20: 1=fixed player setting for custom forces
                    useCustomForces: false, // 0x40: 1=use custom forces
                    useCustomTechtree: false, // 0x80: 1=use custom techtree
                    useCustomAbilities: false, // 0x100: 1=use custom abilities
                    useCustomUpgrades: false, // 0x200: 1=use custom upgrades
                    // 0x400: 1=map properties menu opened at least once since map creation (?)
                    waterWavesOnCliffShores: false, // 0x800: 1=show water waves on cliff shores
                    waterWavesOnRollingShores: false, // 0x1000: 1=show water waves on rolling shores
                    useTerrainFog: false, // 0x2000
                    useItemClassificationSystem: false, // 0x8000: 1=use item classification system
                    enableWaterTinting: false, // 0x10000
                    useAccurateProbabilityForCalculations: false, // 0x20000
                    useCustomAbilitySkins: false, // 0x40000
                    disableDenyIcon: false, // 0x80000
                    forceDefaultCameraZoom: false, // 0x100000
                    forceMaxCameraZoom: false, // 0x200000
                    forceMinCameraZoom: false // 0x400000
                }
            },
            loadingScreen: {
                background: 0,
                path: '',
                text: '',
                title: '',
                subtitle: ''
            },
            prologue: {
                path: '',
                text: '',
                title: '',
                subtitle: ''
            },
            fog: {
                type: FogType.Linear,
                startHeight: 0,
                endHeight: 0,
                density: 0,
                color: [0, 0, 0]
            },
            camera: {
                bounds: [],
                complements: []
            },
            players: [],
            forces: [],
            upgrades: [],
            techtree: [],
            randomGroupTable: [],
            randomItemTable: [],
            saves: 0,
            editorVersion: 0,
            gameDataVersion: GameDataVersion.TFT,
            gameDataSet: GameDataSet.Default,
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
            water: [],
            forceDefaultCameraZoom: 0,
            forceMaxCameraZoom: 0,
            forceMinCameraZoom: 0
        };
        const outBufferToJSON = new W3Buffer(buffer);

        outBufferToJSON.readInt(); // File version

        result.saves = outBufferToJSON.readInt();
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
            hideMinimapInPreview:        !!(flags & 0x1),
            modifyAllyPriorities:        !!(flags & 0x2),
            isMeleeMap:                  !!(flags & 0x4),
            // skip 0x8
            maskedPartiallyVisible:      !!(flags & 0x10),
            fixedPlayerSetting:          !!(flags & 0x20),
            useCustomForces:             !!(flags & 0x40),
            useCustomTechtree:           !!(flags & 0x80),
            useCustomAbilities:          !!(flags & 0x100),
            useCustomUpgrades:           !!(flags & 0x200),
            // skip 0x400
            waterWavesOnCliffShores:     !!(flags & 0x800),
            waterWavesOnRollingShores:   !!(flags & 0x1000),
            useTerrainFog:               !!(flags & 0x2000),
            // skip 0x4000
            useItemClassificationSystem: !!(flags & 0x8000),
            enableWaterTinting:          !!(flags & 0x10000),
            useAccurateProbabilityForCalculations: !!(flags & 0x20000),
            useCustomAbilitySkins:       !!(flags & 0x40000),
            disableDenyIcon:             !!(flags & 0x80000),
            forceDefaultCameraZoom:      !!(flags & 0x100000),
            forceMaxCameraZoom:          !!(flags & 0x200000),
            forceMinCameraZoom:          !!(flags & 0x400000)
        };

        result.map.mainTileType = outBufferToJSON.readChars();

        result.loadingScreen.background = outBufferToJSON.readInt();
        result.loadingScreen.path = outBufferToJSON.readString();
        result.loadingScreen.text = outBufferToJSON.readString();
        result.loadingScreen.title = outBufferToJSON.readString();
        result.loadingScreen.subtitle = outBufferToJSON.readString();

        result.gameDataSet = outBufferToJSON.readInt();

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
            color: [outBufferToJSON.readByte(), outBufferToJSON.readByte(), outBufferToJSON.readByte()] // R G B
        };
        outBufferToJSON.readByte(); // consume the fog.color alpha byte (World Editor removed field, but byte is still there)

        result.globalWeather = outBufferToJSON.readChars(4);
        result.customSoundEnvironment = outBufferToJSON.readString();
        result.customLightEnv = outBufferToJSON.readChars();
        result.water = [outBufferToJSON.readByte(), outBufferToJSON.readByte(), outBufferToJSON.readByte()]; // R G B
        outBufferToJSON.readByte(); // consume water color alpha byte (World Editor removed field, but byte is still there)

        result.scriptLanguage = outBufferToJSON.readInt();
        result.supportedModes = outBufferToJSON.readInt();
        result.gameDataVersion = outBufferToJSON.readInt();

        result.forceDefaultCameraZoom = outBufferToJSON.readInt();
        result.forceMaxCameraZoom = outBufferToJSON.readInt();
        result.forceMinCameraZoom = outBufferToJSON.readInt();

        // Struct: players
        const numPlayers = outBufferToJSON.readInt();
        for (let i = 0; i < numPlayers; i++) {
            const playerNum = outBufferToJSON.readInt();
            const type = outBufferToJSON.readInt();
            const race = outBufferToJSON.readInt();

            const isFixedStartPosition: boolean = outBufferToJSON.readInt() === 1;

            const name = outBufferToJSON.readString();
            const startingPos = {
                x: outBufferToJSON.readFloat(),
                y: outBufferToJSON.readFloat(),
                fixed: isFixedStartPosition
            };

            const allyLowPriorityFlags = fromPlayerBitfield(outBufferToJSON.readInt(), undefined);
            const allyHighPriorityFlags = fromPlayerBitfield(outBufferToJSON.readInt(), undefined);
            const enemyLowPriorityFlags = fromPlayerBitfield(outBufferToJSON.readInt(), undefined);
            const enemyHighPriorityFlags = fromPlayerBitfield(outBufferToJSON.readInt(), undefined);

            result.players.push({ name, startingPos, playerNum, type, race, allyLowPriorityFlags, allyHighPriorityFlags, enemyLowPriorityFlags, enemyHighPriorityFlags });
        }

        const availablePlayerNums = result.players.map((player) => player.playerNum);

        // Struct: forces
        const numForces = outBufferToJSON.readInt();
        // TODO: handle case when custom forces is off (players = -1)
        for (let i = 0; i < numForces; i++) {
            const forceFlag = outBufferToJSON.readInt();
            const flags: ForceFlags = {
                allied:              !!(forceFlag & 0x1),
                alliedVictory:       !!(forceFlag & 0x2),
                // skip 0x4
                shareVision:         !!(forceFlag & 0x8),
                shareUnitControl:    !!(forceFlag & 0x10),
                shareAdvUnitControl: !!(forceFlag & 0x20)
            };
            const players = fromPlayerBitfield(outBufferToJSON.readInt(), availablePlayerNums);
            const name = outBufferToJSON.readString();

            result.forces.push({ name, flags, players });
        }

        // Struct: upgrade availability
        const numUpgrades = outBufferToJSON.readInt();
        for (let i = 0; i < numUpgrades; i++) {
            const players = fromPlayerBitfield(outBufferToJSON.readInt(), availablePlayerNums);
            const id = outBufferToJSON.readChars(4); // see UpgradeData.slk
            const level = outBufferToJSON.readInt(); // Level of upgrade being modified, 0-based index
            const availability: UpgradeAvailability = outBufferToJSON.readInt();

            result.upgrades.push({ id, players, level, availability });
        }

        // Struct: tech availability
        const numTech = outBufferToJSON.readInt();
        for (let i = 0; i < numTech; i++) {
            const players = fromPlayerBitfield(outBufferToJSON.readInt(), availablePlayerNums);
            const id = outBufferToJSON.readChars(4);

            result.techtree.push({ players, id });
        }

        // Struct: random group table
        const numGroupTables = outBufferToJSON.readInt();
        for (let i = 0; i < numGroupTables; i++) {
            const group: RandomGroupTable = {
                number: outBufferToJSON.readInt(),
                name: outBufferToJSON.readString(),
                positions: [],
                rows: []
            };

            const numPositions = outBufferToJSON.readInt();
            for (let i = 0; i < numPositions; i++) {
                const positionType: RandomGroupType = outBufferToJSON.readInt();
                group.positions.push(positionType);
            }

            const numRows = outBufferToJSON.readInt();
            for (let j = 0; j < numRows; j++) {
                const chance = outBufferToJSON.readInt();

                const entries = [];
                for (let i = 0; i < numPositions; i++) {
                    entries.push(outBufferToJSON.readChars(4)); // id of unit/building/item
                }

                group.rows.push({ chance, entries });
            }

            result.randomGroupTable.push(group);
        }

        // Struct: random item table
        const numItemTable = outBufferToJSON.readInt();
        for (let i = 0; i < numItemTable; i++) {
            const number = outBufferToJSON.readInt();
            const name = outBufferToJSON.readString();
            const sets: RandomItem[][] = [];

            const itemSetsCurrentTable = outBufferToJSON.readInt(); // Number of sets in item table
            for (let j = 0; j < itemSetsCurrentTable; j++) {
                const itemSet: RandomItem[] = [];
                const itemsInItemSet = outBufferToJSON.readInt(); // Number of items in set
                for (let k = 0; k < itemsInItemSet; k++) {
                    const chance = outBufferToJSON.readInt(); // Percentual chance
                    const itemId = outBufferToJSON.readChars(4); // Item id (as in ItemData.slk)

                    itemSet.push({ chance, id: itemId });
                }

                sets.push(itemSet);
            }

            result.randomItemTable.push({ name, number, sets });
        }

        return {
            errors: [],
            json: result
        };
    }
}
