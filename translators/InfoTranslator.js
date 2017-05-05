var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path');

var InfoTranslator = function(infoJson) {
    outBuffer = new BufferedHexFileWriter();
    
    outBuffer.addInt(19); // file version
    outBuffer.addInt(infoJson.saves);
    outBuffer.addInt(infoJson.editorVersion);
    
    // Map information
    outBuffer.addString(infoJson.map.name, true);
    outBuffer.addString(infoJson.map.author, true);
    outBuffer.addString(infoJson.map.description, true);
    outBuffer.addString(infoJson.map.recommendedPlayers, true);
    
    // Camera bounds (8 floats total)
    for(var i = 0; i < 8; i++) {
        outBuffer.addFloat(infoJson.camera.bounds[i]);
    }
    
    // Camera complements (4 floats total)
    for(var j = 0; j < 4; j++) {
        outBuffer.addFloat(infoJson.camera.complements[j]);
    }
    
    // Playable area
    outBuffer.addInt(infoJson.map.playableArea.width);
    outBuffer.addInt(infoJson.map.playableArea.height);
    
    /*
     * Flags
     */
    var flags = 0;
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
    outBuffer.addInt(infoJson.globalWeather);
    outBuffer.addString(infoJson.customSoundEnvironment, true);
    outBuffer.addChar(infoJson.customLightEnv);
    
    // Custom water tinting
    outBuffer.addByte(infoJson.water[0]);
    outBuffer.addByte(infoJson.water[1]);
    outBuffer.addByte(infoJson.water[2]);
    outBuffer.addByte(255); // Water alpha - unsupported
    
    // Players - unsupported
    outBuffer.addInt(0);
    
    // Forces - unsupported
    outBuffer.addInt(0);
    
    // Upgrades - unsupported
    outBuffer.addInt(0);
    
    // Tech availability - unsupported
    outBuffer.addInt(0);
    
    // Unit table (random) - unsupported
    outBuffer.addInt(0);
    
    // Item table (random) - unsupported
    outBuffer.addInt(0);
    
    return {
        write: function(outputPath) {
            var path = (outputPath) ? Path.join(outputPath, 'war3map.w3i') : 'war3map.w3i';
            outBuffer.writeFile(path);
        }
    };
}

module.exports = InfoTranslator;
