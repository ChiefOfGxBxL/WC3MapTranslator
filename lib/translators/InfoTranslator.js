let HexBuffer = require('../HexBuffer'),
    W3Buffer = require('../W3Buffer'),
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
        if(!infoJson.globalWeather || infoJson.globalWeather.toLowerCase() === 'none' || infoJson.globalWeather === '0000') {
            outBuffer.addInt(0);
        }
        else {
            outBuffer.addString(infoJson.globalWeather, false); // char[4] - lookup table
        }
        outBuffer.addString(infoJson.customSoundEnvironment || '', true);
        if (infoJson.customLightEnv === '0') {
            outBuffer.addByte(0);
        } else {
            outBuffer.addChar(infoJson.customLightEnv || 'L');
        }

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
            /* outBuffer.addInt(player.startingPos.fixed ? 1 : 2); */
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

            outBuffer.addInt(force.players === -1 ? (1 << 11) - 1 : force.players);
            outBuffer.addString(force.name, true);
        });

        // Upgrades - unsupported
        outBuffer.addInt(0);

        // Tech availability - unsupported
        outBuffer.addInt(0);

        // Partial support: Unit table (random)
        outBuffer.addInt(infoJson.randomUnits.length);
        for (const randomUnitsGroup of infoJson.randomUnits) {
            outBuffer.addInt(randomUnitsGroup.id);
            outBuffer.addString(randomUnitsGroup.name, true);
            outBuffer.addInt(randomUnitsGroup.subTables.length);
            for (let i = 0; i < randomUnitsGroup.subTables.length; i++) outBuffer.addInt(0); // ????
            outBuffer.addInt(randomUnitsGroup.subTables.length);
            for (let i = 0; i < randomUnitsGroup.subTables.length; i++) {
                outBuffer.addFourCCTwice(randomUnitsGroup.subTables[i].variants.length);
                for (let j = 0; j < randomUnitsGroup.subTables[i].variants.length; j++) {
                    outBuffer.addString(randomUnitsGroup.subTables[i].variants[j].object, false);
                }
            }
        }

        // Item table (random) - unsupported
        outBuffer.addInt(0);

        return {
            errors: [],
            buffer: outBuffer.getBuffer()
        };
    },
    warToJson: function(buffer) {
        let result = { map: {}, loadingScreen: {}, prologue: {}, fog: {}, camera: {}, players: [], forces: [], randomUnits: [], randomItems: [] },
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
        if (numUpgrades !== 0) throw new Error(`Custom upgrades unsupported`);
        for(let i = 0; i < numUpgrades; i++) {
            b.readInt(); // Player Flags (bit "x"=1 if this change applies for player "x")
            b.readChars(4, true); // upgrade id (as in UpgradeData.slk)
            b.readInt(); // Level of the upgrade for which the availability is changed (this is actually the level - 1, so 1 => 0)
            b.readInt(); // Availability (0 = unavailable, 1 = available, 2 = researched)
        }

        // UNSUPPORTED: Struct: tech avail.
        let numTech = b.readInt();
        if (numTech !== 0) throw new Error(`Custom tech tree unsupported`);
        for(let i = 0; i < numTech; i++) {
            b.readInt(); // Player Flags (bit "x"=1 if this change applies for player "x")
            b.readChars(4, true); // tech id (this can be an item, unit or ability)
        }

        // PARTIAL SUPPORT: Struct: random unit table
        let numUnitTable = b.readInt();
        let randomUnits = result.randomUnits;
        for(let i = 0; i < numUnitTable; i++) {
            let randomUnitsGroup = {
                id: b.readInt(), // Group number
                name: b.readString(), // Group name
                subTables: [],
            };
            randomUnits.push(randomUnitsGroup);

            let numPositions = b.readInt(); // Number "m" of positions
            for (let n = 0; n < numPositions; n++) if (b.readInt() !== 0) throw new Error(`Invalid random units spec`); // ?????
            let numPositions2 = b.readInt();
            if (numPositions !== numPositions2) throw new Error(`Invalid random units spec`);
            
            for(let j = 0; j < numPositions; j++) {
                let thisTable = {
                    //type: b.readInt(), // unit table (=0), a building table (=1) or an item table (=2)
                    variants: [],
                };
                randomUnitsGroup.subTables.push(thisTable);

                let numLinesInTable = b.readFourCCTwice();
                for(let k = 0; k < numLinesInTable; k++) {
                    thisTable.variants.push({
                        //chance: b.readInt(), // Chance of the unit/item (percentage)
                        object: b.readChars(4, true), // unit/item id's for this line specified
                    });
                }
            }
        }

        // UNSUPPORTED: Struct: random item table
        let numItemTable = b.readInt();
        if (numItemTable !== 0) throw new Error(`Custom random item table unsupported`);
        let randomItems = result.randomItems;
        for(let i = 0; i < numItemTable; i++) {
            let randomItemsGroup = {
                id: b.readInt(), // Table number
                name: b.readString(), // Table name
                subTables: [],
            };
            randomItems.push(randomItemsGroup);

            let itemSetsCurrentTable = b.readInt(); // Number "m" of item sets on the current item table
            for(let j = 0; j < itemSetsCurrentTable; j++) {
                let thisTable = [];
                randomItemsGroup.push(thisTable);

                let itemsInItemSet = b.readInt(); // Number "i" of items on the current item set
                for(let k = 0; k < itemsInItemSet; k++) {
                    thisTable.push({
                        chance: b.readInt(), // Percentual chance
                        object: b.readChars(4, true), // Item id (as in ItemData.slk)
                    });
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
