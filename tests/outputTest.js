var Translator = require('../index.js'),
    mapJson = {
        units: [{
            type: 'HPal',
            variation: 0,
            position: [1, 2, 3],
            rotation: 0.0, // in radians
            scale: [1, 2, 3],
            flags: 0x100,
            player: 0,
            hitpoints: 500,
            mana: 200,
            droppedItemSets: [], // Unsupported - keep as empty array
            gold: 100,
            targetAcquisition: 100,
            hero: {
                level: 2,
                str: 15,
                agi: 16,
                int: 12
            },
            inventory: [
                { slot: 1, type: 'WXYZ' },
                { slot: 2, type: 'WXYZ' }
            ],
            abilities: [
                { ability: '', active: true, level: 1 },
                { ability: '', active: false, level: 2 }
            ],
            color: 0,
            waygate: false, // Unsupported - always use false!
            id: 0
        }],
        doodads: [{
            type: 'Wxyz',
            variation: 0,
            position: [1.0, 2.0, 3.55],
            angle: 9.95,
            scale: [0.0, 0.0, 0.0],
            life: 77,
            id: 0
        }],
        //terrain: [],
        strings: {
            player0: "Joueur 0",
            player1: "Joueur 1"
        }
    };

Translator.fromJson(mapJson, './test_output');
