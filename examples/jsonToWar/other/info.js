/**
 * Example usage of a translator
 * In projects you make, you'll want to use the second `require` statement
 * instead of the first. That is, when using wc3maptranslator in your code,
 * call `require('wc3maptranslator')` instead of `require('../../index.js')`.
 */
 const Translator = require('../../../index.js'); // require('wc3maptranslator');
 const { WarFile, Write } = require('../writeHelper.js');

// Specify some information in the map file
const data = {
    "saves": 0,
    "editorVersion": 0,
    "map": {
        "name": "map name goes here",
        "author": "chiefofgxbxl",
        "description": "Just Another WarCraft III Map",
        "recommendedPlayers": "Any",
        "playableArea": {
            "width": 52,
            "height": 52
        },
        "flags": {
            "hideMinimapInPreview": false,
            "modifyAllyPriorities": false,
            "isMeleeMap": false,
            "maskedPartiallyVisible": true,
            "fixedPlayerSetting": false,
            "useCustomForces": false,
            "useCustomTechtree": false,
            "useCustomAbilities": false,
            "useCustomUpgrades": false,
            "waterWavesOnCliffShores": true,
            "waterWavesOnRollingShores": true
        },
        "mainTileType": "L"
    },
    "loadingScreen": {
        "background": -1,
        "path": "",
        "text": "",
        "title": "",
        "subtitle": ""
    },
    "prologue": {
        "path": "",
        "text": "",
        "title": "",
        "subtitle": ""
    },
    "fog": {
        "type": 0,
        "startHeight": 3000,
        "endHeight": 5000,
        "density": 0.5,
        "color": [0, 0, 0]
    },
    "globalWeather": "NONE",
    "customSoundEnvironment": "",
    "customLightEnv": "",
    "water": [0, 0, 0],
    "camera": {
        "bounds": [-2816, -3328, 2816, 2816, -2816, 2816, 2816, -3328],
        "complements": [6, 6, 4, 8]
    },
    "players": [
        {
            "type": 1,
            "race": 1,
            "playerNum": 0,
            "name": "Frodo Baggins",
            "startingPos": { "x": 2368, "y": 256 },
            "priorities": {
                "low": 0,
                "high": 0
            }
        },
        {
            "type": 2,
            "race": 3,
            "playerNum": 10,
            "name": "Smeagul",
            "startingPos": { "x": 2368, "y": 256 }
        }
    ],
    "forces": [
        {
            "name": "Force 1",
            "players": [0],
            "flags": {
                "allied": false,
                "alliedVictory": false,
                "shareVision": false,
                "shareUnitControl": false,
                "shareAdvUnitControl": false
            }
        }
    ]
};

var infoResult = new Translator.Info(data);
Write(WarFile.Other.Info, infoResult.buffer);
