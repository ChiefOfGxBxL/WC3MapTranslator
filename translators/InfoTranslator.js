let HexBuffer = require('../lib/HexBuffer'),
    W3Buffer = require('../lib/W3Buffer'),
    outBuffer;

const InfoTranslator = {
    jsonToWar: function(infoJson) {
        outBuffer = new HexBuffer();

        outBuffer.addInt(25); // file version, 0x19
        outBuffer.addInt(infoJson.saves || 0);
        outBuffer.addInt(infoJson.editorVersion || 0);

        // Map information
        outBuffer.addString(infoJson.map.name, true);
        outBuffer.addString(infoJson.map.author, true);
        outBuffer.addString(infoJson.map.description, true);
        outBuffer.addString(infoJson.map.recommendedPlayers, true);

        // Camera bounds (8 floats total)
        for(let cbIndex = 0; cbIndex < 8; cbIndex++) {
            outBuffer.addFloat(infoJson.camera.bounds[cbIndex]);
        }

        // Camera complements (4 floats total)
        for(let ccIndex = 0; ccIndex < 4; ccIndex++) {
            outBuffer.addInt(infoJson.camera.complements[ccIndex]);
        }

        // Playable area
        outBuffer.addInt(infoJson.map.playableArea.width);
        outBuffer.addInt(infoJson.map.playableArea.height);

        /*
         * Flags
         */
        let flags = 0;
        if(infoJson.map.flags) { // can leave out the entire flags object, all flags will default to false
            if(infoJson.map.flags.hideMinimapInPreview)         flags |= 0x0001; // hide minimap in preview screens
            if(infoJson.map.flags.modifyAllyPriorities)         flags |= 0x0002; // modify ally priorities
            if(infoJson.map.flags.isMeleeMap)                   flags |= 0x0004; // melee map
            // 0x0008 - unknown;                                                 // playable map size was large and never reduced to medium (?)
            if(infoJson.map.flags.maskedPartiallyVisible)       flags |= 0x0010; // masked area are partially visible
            if(infoJson.map.flags.fixedPlayerSetting)           flags |= 0x0020; // fixed player setting for custom forces
            if(infoJson.map.flags.useCustomForces)              flags |= 0x0040; // use custom forces
            if(infoJson.map.flags.useCustomTechtree)            flags |= 0x0080; // use custom techtree
            if(infoJson.map.flags.useCustomAbilities)           flags |= 0x0100; // use custom abilities
            if(infoJson.map.flags.useCustomUpgrades)            flags |= 0x0200; // use custom upgrades
            // 0x0400 - unknown;                                                 // map properties menu opened at least once since map creation (?)
            if(infoJson.map.flags.waterWavesOnCliffShores)      flags |= 0x0800; // show water waves on cliff shores
            if(infoJson.map.flags.waterWavesOnRollingShores)    flags |= 0x1000; // show water waves on rolling shores
        }

        // Unknown, but these seem to always be on, at least for default maps
        flags |= 0x8000;
        flags |= 0x4000;
        flags |= 0x0400;

        outBuffer.addInt(flags); // Add flags

        // Map main ground type
        outBuffer.addChar(infoJson.map.mainTileType);

        // Loading screen
        outBuffer.addInt(infoJson.loadingScreen.background);
        outBuffer.addString(infoJson.loadingScreen.path, true);
        outBuffer.addString(infoJson.loadingScreen.text, true);
        outBuffer.addString(infoJson.loadingScreen.title, true);
        outBuffer.addString(infoJson.loadingScreen.subtitle, true);

        // Use game data set (Unsupported)
        outBuffer.addInt(0);

        // Prologue
        outBuffer.addString(infoJson.prologue.path, true);
        outBuffer.addString(infoJson.prologue.text, true);
        outBuffer.addString(infoJson.prologue.title, true);
        outBuffer.addString(infoJson.prologue.subtitle, true);

        // Fog
        outBuffer.addInt(infoJson.fog.type);
        outBuffer.addFloat(infoJson.fog.startHeight);
        outBuffer.addFloat(infoJson.fog.endHeight);
        outBuffer.addFloat(infoJson.fog.density);
        outBuffer.addByte(infoJson.fog.color[0]);
        outBuffer.addByte(infoJson.fog.color[1]);
        outBuffer.addByte(infoJson.fog.color[2]);
        outBuffer.addByte(255); // Fog alpha - unsupported

        // Misc.
        // If globalWeather is not defined or is set to 'none', use 0 sentinel value, else add char[4]
        if(!infoJson.globalWeather || infoJson.globalWeather.toLowerCase() === 'none') {
            outBuffer.addInt(0);
        }
        else {
            outBuffer.addString(infoJson.globalWeather, false); // char[4] - lookup table
        }
        outBuffer.addString(infoJson.customSoundEnvironment || '', true);
        outBuffer.addChar(infoJson.customLightEnv || 'L');

        // Custom water tinting
        outBuffer.addByte(infoJson.water[0]);
        outBuffer.addByte(infoJson.water[1]);
        outBuffer.addByte(infoJson.water[2]);
        outBuffer.addByte(255); // Water alpha - unsupported

        // Players
        outBuffer.addInt(infoJson.players.length);
        infoJson.players.forEach((player) => {
            outBuffer.addInt(player.playerNum);
            outBuffer.addInt(player.type);
            outBuffer.addInt(player.race);
            outBuffer.addInt(player.startingPos.fixed ? 1 : 0);
            outBuffer.addString(player.name, true);
            outBuffer.addFloat(player.startingPos.x);
            outBuffer.addFloat(player.startingPos.y);
            outBuffer.addInt(0); // ally low prio flags - unsupported
            outBuffer.addInt(0); // ally high prio flags - unsupported
        });

        // Forces
        outBuffer.addInt(infoJson.forces.length);
        infoJson.forces.forEach((force) => {
            // Calculate flags
            let forceFlags = 0;
            if(force.flags.allied)              forceFlags |= 0x0001;
            if(force.flags.alliedVictory)       forceFlags |= 0x0002;
            if(force.flags.shareVision)         forceFlags |= 0x0004;
            if(force.flags.shareUnitControl)    forceFlags |= 0x0010;
            if(force.flags.shareAdvUnitControl) forceFlags |= 0x0020;

            outBuffer.addInt(forceFlags);
            outBuffer.addByte(255); // force players - unsupported
            outBuffer.addByte(255); // force players - unsupported
            outBuffer.addByte(255); // force players - unsupported
            outBuffer.addByte(255); // force players - unsupported
            outBuffer.addString(force.name, true);
        });

        // Upgrades - unsupported
        outBuffer.addInt(0);

        // Tech availability - unsupported
        outBuffer.addInt(0);

        // Unit table (random) - unsupported
        outBuffer.addInt(0);

        // Item table (random) - unsupported
        outBuffer.addInt(0);

        return {
            errors: [],
            buffer: outBuffer.getBuffer()
        };
    },
    warToJson: function(buffer) {
        let result = { map: {}, loadingScreen: {}, prologue: {}, fog: {}, camera: {}, players: [], forces: [] },
            b = new W3Buffer(buffer);

        let fileVersion = b.readInt(), // File version
            numOfSaves = b.readInt(), // # of times saved
            editorVersion = b.readInt(); // editor version

        result.saves = numOfSaves;
        result.editorVersion = editorVersion;

        result.map.name = b.readString();
        result.map.author = b.readString();
        result.map.description = b.readString();
        result.map.recommendedPlayers = b.readString();

        result.camera.bounds = [
            b.readFloat(), b.readFloat(), b.readFloat(), b.readFloat(),
            b.readFloat(), b.readFloat(), b.readFloat(), b.readFloat()
        ];

        result.camera.complements = [
            b.readInt(), b.readInt(), b.readInt(), b.readInt()
        ];

        result.map.playableArea = {
            width: b.readInt(),
            height: b.readInt()
        };

        let flags = b.readInt();
        result.map.flags = {
            hideMinimapInPreview:       !!(flags & 0b1), // 0x0001: 1=hide minimap in preview screens
            modifyAllyPriorities:       !!(flags & 0b10), // 0x0002: 1=modify ally priorities
            isMeleeMap:                 !!(flags & 0b100), // 0x0004: 1=melee map
            // 0x0008: 1=playable map size was large and has never been reduced to medium (?)
            maskedPartiallyVisible:     !!(flags & 0b10000), // 0x0010: 1=masked area are partially visible
            fixedPlayerSetting:         !!(flags & 0b100000), // 0x0020: 1=fixed player setting for custom forces
            useCustomForces:            !!(flags & 0b1000000), // 0x0040: 1=use custom forces
            useCustomTechtree:          !!(flags & 0b10000000), // 0x0080: 1=use custom techtree
            useCustomAbilities:         !!(flags & 0b100000000), // 0x0100: 1=use custom abilities
            useCustomUpgrades:          !!(flags & 0b1000000000), // 0x0200: 1=use custom upgrades
            // 0x0400: 1=map properties menu opened at least once since map creation (?)
            waterWavesOnCliffShores:    !!(flags & 0b100000000000), // 0x0800: 1=show water waves on cliff shores
            waterWavesOnRollingShores:  !!(flags & 0b1000000000000) // 0x1000: 1=show water waves on rolling shores
            // 0x2000: 1=unknown
            // 0x4000: 1=unknown
            // 0x8000: 1=unknown
        };

        result.map.mainTileType = b.readChars();

        result.loadingScreen.background = b.readInt();
        result.loadingScreen.path = b.readString();
        result.loadingScreen.text = b.readString();
        result.loadingScreen.title = b.readString();
        result.loadingScreen.subtitle = b.readString();

        let gameDataSet = b.readInt(); // 0 = standard

        result.prologue = {
            path: b.readString(),
            text: b.readString(),
            title: b.readString(),
            subtitle: b.readString()
        };

        result.fog = {
            type: b.readInt(),
            startHeight: b.readFloat(),
            endHeight: b.readFloat(),
            density: b.readFloat(),
            color: [b.readByte(), b.readByte(), b.readByte(), b.readByte()] // R G B A
        };

        result.globalWeather = b.readChars(4);
        result.customSoundEnvironment = b.readString();
        result.customLightEnv = b.readChars();
        result.water = [b.readByte(), b.readByte(), b.readByte(), b.readByte()]; // R G B A

        // Struct: players
        let numPlayers = b.readInt();
        for(let i = 0; i < numPlayers; i++) {
            let player = {};

            player.playerNum = b.readInt();
            player.type = b.readInt(); // 1=Human, 2=Computer, 3=Neutral, 4=Rescuable
            player.race = b.readInt(); // 1=Human, 2=Orc, 3=Undead, 4=Night Elf

            b.readInt(); // 00000001 = fixed start position

            player.name = b.readString();
            player.startingPos = {
                x: b.readFloat(),
                y: b.readFloat()
            };

            b.readInt(); // ally low priorities flags (bit "x"=1 --> set for player "x")
            b.readInt(); // ally high priorities flags (bit "x"=1 --> set for player "x")

            result.players.push(player);
        }

        // Struct: forces
        let numForces = b.readInt();
        for(let i = 0; i < numForces; i++) {
            let force = {};

            let forceFlag = b.readInt();
            force.flags = {
                allied:                 !!(forceFlag & 0b1), // 0x00000001: allied (force 1)
                alliedVictory:          !!(forceFlag & 0b10), // 0x00000002: allied victory
                // 0x00000004: share vision (the documentation has this incorrect)
                shareVision:            !!(forceFlag & 0b1000), // 0x00000008: share vision
                shareUnitControl:       !!(forceFlag & 0b10000), // 0x00000010: share unit control
                shareAdvUnitControl:    !!(forceFlag & 0b100000) // 0x00000020: share advanced unit control
            };
            force.players = b.readInt(); // UNSUPPORTED: (bit "x"=1 --> player "x" is in this force)
            force.name = b.readString();

            result.forces.push(force);
        }

        // UNSUPPORTED: Struct: upgrade avail.
        let numUpgrades = b.readInt();
        for(let i = 0; i < numUpgrades; i++) {
            b.readInt(); // Player Flags (bit "x"=1 if this change applies for player "x")
            b.readChars(4); // upgrade id (as in UpgradeData.slk)
            b.readInt(); // Level of the upgrade for which the availability is changed (this is actually the level - 1, so 1 => 0)
            b.readInt(); // Availability (0 = unavailable, 1 = available, 2 = researched)
        }

        // UNSUPPORTED: Struct: tech avail.
        let numTech = b.readInt();
        for(let i = 0; i < numTech; i++) {
            b.readInt(); // Player Flags (bit "x"=1 if this change applies for player "x")
            b.readChars(4); // tech id (this can be an item, unit or ability)
        }

        // UNSUPPORTED: Struct: random unit table
        let numUnitTable = b.readInt();
        for(let i = 0; i < numUnitTable; i++) {
            b.readInt(); // Group number
            b.readString(); // Group name

            let numPositions = b.readInt(); // Number "m" of positions
            for(let j = 0; j < numPositions; j++) {
                b.readInt(); // unit table (=0), a building table (=1) or an item table (=2)

                let numLinesInTable = b.readInt();
                for(let k = 0; k < numLinesInTable; k++) {
                    b.readInt(); // Chance of the unit/item (percentage)
                    b.readChar(); // unit/item id's for this line specified
                }
            }
        }

        // UNSUPPORTED: Struct: random item table
        let numItemTable = b.readInt();
        for(let i = 0; i < numItemTable; i++) {
            b.readInt(); // Table number
            b.readString(); // Table name

            let itemSetsCurrentTable = b.readInt(); // Number "m" of item sets on the current item table
            for(let j = 0; j < itemSetsCurrentTable; j++) {

                let itemsInItemSet = b.readInt(); // Number "i" of items on the current item set
                for(let k = 0; k < itemsInItemSet; k++) {
                    b.readInt(); // Percentual chance
                    b.readChars(4); // Item id (as in ItemData.slk)
                }

            }
        }

        return {
            errors: [],
            json: result
        };
    }
};

module.exports = InfoTranslator;
