import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';

interface Map {
    name: string;
    author: string;
    description: string;
    recommendedPlayers: string;
    playableArea: PlayableMapArea;
    flags: MapFlags;
    mainTileType: string;
}

interface Camera {
    bounds: number[];
    complements: number[];
}

interface MapFlags {
    hideMinimapInPreview: boolean; // 0x0001: 1=hide minimap in preview screens
    modifyAllyPriorities: boolean; // 0x0002: 1=modify ally priorities
    isMeleeMap: boolean; // 0x0004: 1=melee map
    // 0x0008: 1=playable map size was large and has never been reduced to medium (?)
    maskedPartiallyVisible: boolean; // 0x0010: 1=masked area are partially visible
    fixedPlayerSetting: boolean; // 0x0020: 1=fixed player setting for custom forces
    useCustomForces: boolean; // 0x0040: 1=use custom forces
    useCustomTechtree: boolean; // 0x0080: 1=use custom techtree
    useCustomAbilities: boolean; // 0x0100: 1=use custom abilities
    useCustomUpgrades: boolean; // 0x0200: 1=use custom upgrades
    // 0x0400: 1=map properties menu opened at least once since map creation (?)
    waterWavesOnCliffShores: boolean; // 0x0800: 1=show water waves on cliff shores
    waterWavesOnRollingShores: boolean; // 0x1000: 1=show water waves on rolling shores
    // 0x2000: 1=unknown
    // 0x4000: 1=unknown
    // 0x8000: 1=unknown
}

interface LoadingScreen {
    background: number;
    path: string;
    text: string;
    title: string;
    subtitle: string;
}

interface Fog {
    type: number;
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
    editorVersion: number;
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

export class InfoTranslator {

    public _outBufferToWar: HexBuffer;
    public _outBufferToJSON: W3Buffer;

    constructor() { }

    public jsonToWar(infoJson) {
        this._outBufferToWar = new HexBuffer();

        this._outBufferToWar.addInt(25); // file version, 0x19
        this._outBufferToWar.addInt(infoJson.saves || 0);
        this._outBufferToWar.addInt(infoJson.editorVersion || 0);

        // Map information
        this._outBufferToWar.addString(infoJson.map.name, true);
        this._outBufferToWar.addString(infoJson.map.author, true);
        this._outBufferToWar.addString(infoJson.map.description, true);
        this._outBufferToWar.addString(infoJson.map.recommendedPlayers, true);

        // Camera bounds (8 floats total)
        for (let cbIndex = 0; cbIndex < 8; cbIndex++) {
            this._outBufferToWar.addFloat(infoJson.camera.bounds[cbIndex]);
        }

        // Camera complements (4 floats total)
        for (let ccIndex = 0; ccIndex < 4; ccIndex++) {
            this._outBufferToWar.addInt(infoJson.camera.complements[ccIndex]);
        }

        // Playable area
        this._outBufferToWar.addInt(infoJson.map.playableArea.width);
        this._outBufferToWar.addInt(infoJson.map.playableArea.height);

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
        }

        // Unknown, but these seem to always be on, at least for default maps
        flags |= 0x8000;
        flags |= 0x4000;
        flags |= 0x0400;

        this._outBufferToWar.addInt(flags); // Add flags

        // Map main ground type
        this._outBufferToWar.addChar(infoJson.map.mainTileType);

        // Loading screen
        this._outBufferToWar.addInt(infoJson.loadingScreen.background);
        this._outBufferToWar.addString(infoJson.loadingScreen.path, true);
        this._outBufferToWar.addString(infoJson.loadingScreen.text, true);
        this._outBufferToWar.addString(infoJson.loadingScreen.title, true);
        this._outBufferToWar.addString(infoJson.loadingScreen.subtitle, true);

        // Use game data set (Unsupported)
        this._outBufferToWar.addInt(0);

        // Prologue
        this._outBufferToWar.addString(infoJson.prologue.path, true);
        this._outBufferToWar.addString(infoJson.prologue.text, true);
        this._outBufferToWar.addString(infoJson.prologue.title, true);
        this._outBufferToWar.addString(infoJson.prologue.subtitle, true);

        // Fog
        this._outBufferToWar.addInt(infoJson.fog.type);
        this._outBufferToWar.addFloat(infoJson.fog.startHeight);
        this._outBufferToWar.addFloat(infoJson.fog.endHeight);
        this._outBufferToWar.addFloat(infoJson.fog.density);
        this._outBufferToWar.addByte(infoJson.fog.color[0]);
        this._outBufferToWar.addByte(infoJson.fog.color[1]);
        this._outBufferToWar.addByte(infoJson.fog.color[2]);
        this._outBufferToWar.addByte(255); // Fog alpha - unsupported

        // Misc.
        // If globalWeather is not defined or is set to 'none', use 0 sentinel value, else add char[4]
        if (!infoJson.globalWeather || infoJson.globalWeather.toLowerCase() === 'none') {
            this._outBufferToWar.addInt(0);
        }
        else {
            this._outBufferToWar.addString(infoJson.globalWeather, false); // char[4] - lookup table
        }
        this._outBufferToWar.addString(infoJson.customSoundEnvironment || '', true);
        this._outBufferToWar.addChar(infoJson.customLightEnv || 'L');

        // Custom water tinting
        this._outBufferToWar.addByte(infoJson.water[0]);
        this._outBufferToWar.addByte(infoJson.water[1]);
        this._outBufferToWar.addByte(infoJson.water[2]);
        this._outBufferToWar.addByte(255); // Water alpha - unsupported

        // Players
        this._outBufferToWar.addInt(infoJson.players.length);
        infoJson.players.forEach((player) => {
            this._outBufferToWar.addInt(player.playerNum);
            this._outBufferToWar.addInt(player.type);
            this._outBufferToWar.addInt(player.race);
            this._outBufferToWar.addInt(player.startingPos.fixed ? 1 : 0);
            this._outBufferToWar.addString(player.name, true);
            this._outBufferToWar.addFloat(player.startingPos.x);
            this._outBufferToWar.addFloat(player.startingPos.y);
            this._outBufferToWar.addInt(0); // ally low prio flags - unsupported
            this._outBufferToWar.addInt(0); // ally high prio flags - unsupported
        });

        // Forces
        this._outBufferToWar.addInt(infoJson.forces.length);
        infoJson.forces.forEach((force) => {
            // Calculate flags
            let forceFlags = 0;
            if (force.flags.allied) forceFlags |= 0x0001;
            if (force.flags.alliedVictory) forceFlags |= 0x0002;
            if (force.flags.shareVision) forceFlags |= 0x0004;
            if (force.flags.shareUnitControl) forceFlags |= 0x0010;
            if (force.flags.shareAdvUnitControl) forceFlags |= 0x0020;

            this._outBufferToWar.addInt(forceFlags);
            this._outBufferToWar.addByte(255); // force players - unsupported
            this._outBufferToWar.addByte(255); // force players - unsupported
            this._outBufferToWar.addByte(255); // force players - unsupported
            this._outBufferToWar.addByte(255); // force players - unsupported
            this._outBufferToWar.addString(force.name, true);
        });

        // Upgrades - unsupported
        this._outBufferToWar.addInt(0);

        // Tech availability - unsupported
        this._outBufferToWar.addInt(0);

        // Unit table (random) - unsupported
        this._outBufferToWar.addInt(0);

        // Item table (random) - unsupported
        this._outBufferToWar.addInt(0);

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }
    public warToJson(buffer) {
        const result: Info = {
            map: {
                name: "",
                author: "",
                description: "",
                recommendedPlayers: "",
                playableArea: {
                    width: 64,
                    height: 64
                },
                mainTileType: "",
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
                    waterWavesOnRollingShores: false // 0x1000: 1=show water waves on rolling shores
                },
            },
            loadingScreen: {
                background: 0,
                path: "",
                text: "",
                title: "",
                subtitle: "",
            }, prologue: {
                path: "",
                text: "",
                title: "",
                subtitle: ""
            }, fog: {
                type: 0,
                startHeight: 0,
                endHeight: 0,
                density: 0,
                color: [0, 0, 0, 1]
            }, camera: {
                bounds: [],
                complements: [],
            }, players: [

            ], forces: [

            ],
            saves: 0,
            editorVersion: 0,
            globalWeather: "",
            customSoundEnvironment: "",
            customLightEnv: "",
            water: [],
        };
        this._outBufferToJSON = new W3Buffer(buffer);

        let fileVersion = this._outBufferToJSON.readInt(), // File version
            numOfSaves = this._outBufferToJSON.readInt(), // # of times saved
            editorVersion = this._outBufferToJSON.readInt(); // editor version

        result.saves = numOfSaves;
        result.editorVersion = editorVersion;

        result.map.name = this._outBufferToJSON.readString();
        result.map.author = this._outBufferToJSON.readString();
        result.map.description = this._outBufferToJSON.readString();
        result.map.recommendedPlayers = this._outBufferToJSON.readString();

        result.camera.bounds = [
            this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat(),
            this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat(), this._outBufferToJSON.readFloat()
        ];

        result.camera.complements = [
            this._outBufferToJSON.readInt(), this._outBufferToJSON.readInt(), this._outBufferToJSON.readInt(), this._outBufferToJSON.readInt()
        ];

        result.map.playableArea = {
            width: this._outBufferToJSON.readInt(),
            height: this._outBufferToJSON.readInt()
        };

        let flags = this._outBufferToJSON.readInt();
        result.map.flags = {
            hideMinimapInPreview: !!(flags & 0b1),
            modifyAllyPriorities: !!(flags & 0b10),
            isMeleeMap: !!(flags & 0b100),
            maskedPartiallyVisible: !!(flags & 0b10000),
            fixedPlayerSetting: !!(flags & 0b100000),
            useCustomForces: !!(flags & 0b1000000),
            useCustomTechtree: !!(flags & 0b10000000),
            useCustomAbilities: !!(flags & 0b100000000),
            useCustomUpgrades: !!(flags & 0b1000000000),
            waterWavesOnCliffShores: !!(flags & 0b100000000000),
            waterWavesOnRollingShores: !!(flags & 0b1000000000000)
        };

        result.map.mainTileType = this._outBufferToJSON.readChars();

        result.loadingScreen.background = this._outBufferToJSON.readInt();
        result.loadingScreen.path = this._outBufferToJSON.readString();
        result.loadingScreen.text = this._outBufferToJSON.readString();
        result.loadingScreen.title = this._outBufferToJSON.readString();
        result.loadingScreen.subtitle = this._outBufferToJSON.readString();

        let gameDataSet = this._outBufferToJSON.readInt(); // 0 = standard

        result.prologue = {
            path: this._outBufferToJSON.readString(),
            text: this._outBufferToJSON.readString(),
            title: this._outBufferToJSON.readString(),
            subtitle: this._outBufferToJSON.readString()
        };

        result.fog = {
            type: this._outBufferToJSON.readInt(),
            startHeight: this._outBufferToJSON.readFloat(),
            endHeight: this._outBufferToJSON.readFloat(),
            density: this._outBufferToJSON.readFloat(),
            color: [this._outBufferToJSON.readByte(), this._outBufferToJSON.readByte(), this._outBufferToJSON.readByte(), this._outBufferToJSON.readByte()] // R G B A
        };

        result.globalWeather = this._outBufferToJSON.readChars(4);
        result.customSoundEnvironment = this._outBufferToJSON.readString();
        result.customLightEnv = this._outBufferToJSON.readChars();
        result.water = [this._outBufferToJSON.readByte(), this._outBufferToJSON.readByte(), this._outBufferToJSON.readByte(), this._outBufferToJSON.readByte()]; // R G B A

        // Struct: players
        let numPlayers = this._outBufferToJSON.readInt();
        for (let i = 0; i < numPlayers; i++) {
            let player: Player = {
                name: "",
                startingPos: { x: 0, y: 0 },
                playerNum: 0,
                type: 0,
                race: 0,
            };

            player.playerNum = this._outBufferToJSON.readInt();
            player.type = this._outBufferToJSON.readInt(); // 1=Human, 2=Computer, 3=Neutral, 4=Rescuable
            player.race = this._outBufferToJSON.readInt(); // 1=Human, 2=Orc, 3=Undead, 4=Night Elf

            this._outBufferToJSON.readInt(); // 00000001 = fixed start position

            player.name = this._outBufferToJSON.readString();
            player.startingPos = {
                x: this._outBufferToJSON.readFloat(),
                y: this._outBufferToJSON.readFloat()
            };

            this._outBufferToJSON.readInt(); // ally low priorities flags (bit "x"=1 --> set for player "x")
            this._outBufferToJSON.readInt(); // ally high priorities flags (bit "x"=1 --> set for player "x")

            result.players.push(player);
        }

        // Struct: forces
        let numForces = this._outBufferToJSON.readInt();
        for (let i = 0; i < numForces; i++) {
            let force: Force = {
                flags: { allied: false, alliedVictory: true, shareVision: true, shareUnitControl: false, shareAdvUnitControl: false },
                players: 0,
                name: ""
            };

            let forceFlag = this._outBufferToJSON.readInt();
            force.flags = {
                allied: !!(forceFlag & 0b1), // 0x00000001: allied (force 1)
                alliedVictory: !!(forceFlag & 0b10), // 0x00000002: allied victory
                // 0x00000004: share vision (the documentation has this incorrect)
                shareVision: !!(forceFlag & 0b1000), // 0x00000008: share vision
                shareUnitControl: !!(forceFlag & 0b10000), // 0x00000010: share unit control
                shareAdvUnitControl: !!(forceFlag & 0b100000) // 0x00000020: share advanced unit control
            };
            force.players = this._outBufferToJSON.readInt(); // UNSUPPORTED: (bit "x"=1 --> player "x" is in this force)
            force.name = this._outBufferToJSON.readString();

            result.forces.push(force);
        }

        // UNSUPPORTED: Struct: upgrade avail.
        let numUpgrades = this._outBufferToJSON.readInt();
        for (let i = 0; i < numUpgrades; i++) {
            this._outBufferToJSON.readInt(); // Player Flags (bit "x"=1 if this change applies for player "x")
            this._outBufferToJSON.readChars(4); // upgrade id (as in UpgradeData.slk)
            this._outBufferToJSON.readInt(); // Level of the upgrade for which the availability is changed (this is actually the level - 1, so 1 => 0)
            this._outBufferToJSON.readInt(); // Availability (0 = unavailable, 1 = available, 2 = researched)
        }

        // UNSUPPORTED: Struct: tech avail.
        let numTech = this._outBufferToJSON.readInt();
        for (let i = 0; i < numTech; i++) {
            this._outBufferToJSON.readInt(); // Player Flags (bit "x"=1 if this change applies for player "x")
            this._outBufferToJSON.readChars(4); // tech id (this can be an item, unit or ability)
        }

        // UNSUPPORTED: Struct: random unit table
        let numUnitTable = this._outBufferToJSON.readInt();
        for (let i = 0; i < numUnitTable; i++) {
            this._outBufferToJSON.readInt(); // Group number
            this._outBufferToJSON.readString(); // Group name

            let numPositions = this._outBufferToJSON.readInt(); // Number "m" of positions
            for (let j = 0; j < numPositions; j++) {
                this._outBufferToJSON.readInt(); // unit table (=0), a building table (=1) or an item table (=2)

                let numLinesInTable = this._outBufferToJSON.readInt();
                for (let k = 0; k < numLinesInTable; k++) {
                    this._outBufferToJSON.readInt(); // Chance of the unit/item (percentage)
                    this._outBufferToJSON.readChars(); // unit/item id's for this line specified
                }
            }
        }

        // UNSUPPORTED: Struct: random item table
        let numItemTable = this._outBufferToJSON.readInt();
        for (let i = 0; i < numItemTable; i++) {
            this._outBufferToJSON.readInt(); // Table number
            this._outBufferToJSON.readString(); // Table name

            let itemSetsCurrentTable = this._outBufferToJSON.readInt(); // Number "m" of item sets on the current item table
            for (let j = 0; j < itemSetsCurrentTable; j++) {

                let itemsInItemSet = this._outBufferToJSON.readInt(); // Number "i" of items on the current item set
                for (let k = 0; k < itemsInItemSet; k++) {
                    this._outBufferToJSON.readInt(); // Percentual chance
                    this._outBufferToJSON.readChars(4); // Item id (as in ItemData.slk)
                }

            }
        }

        return {
            errors: [],
            json: result
        };
    }
}
