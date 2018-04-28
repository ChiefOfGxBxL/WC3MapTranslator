let HexBuffer = require('../lib/HexBuffer'),
    outBuffer;

const InfoTranslator = function(infoJson) {
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
};

module.exports = InfoTranslator;
