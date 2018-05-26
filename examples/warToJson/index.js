const chalk = require('chalk');

const section = function(title, bgColor) { console.log(chalk[bgColor].white.underline(title)); }
const entry = function(type, command, color) { console.log(chalk[color](`  ${type}\t\t${command}`)); }
const breakSection = function() { console.log(); }

section('Placing entities on the map ("world entities")', 'bgGreen');
// entry('Units', '\tnode entity/units.js', 'green');
// entry('Doodads', 'node entity/doodads.js', 'green');
// entry('Terrain', 'node entity/terrain.js', 'green');
entry('Regions', 'node entity/regions.js', 'green');
entry('Cameras', 'node entity/cameras.js', 'green');
entry('Sounds', 'node entity/sounds.js', 'green');

breakSection();

section('Modifying object editor data ("object entities")', 'bgBlue');
// entry('Units', '\tnode object/units.js', 'blue');
// entry('Items', '\tnode object/items.js', 'blue');
// entry('Destructables', 'node object/destructables.js', 'blue');
// entry('Doodads', 'node object/doodads.js', 'blue');
// entry('Abilities', 'node object/abilities.js', 'blue');
// entry('Buffs', '\tnode object/buffs.js', 'blue');
// entry('Upgrades', 'node object/upgrades.js', 'blue');

breakSection();

section('Other map files', 'bgRed');
// entry('Imports', 'node other/imports.js', 'red');
// entry('Strings', 'node other/strings.js', 'red');
entry('Info', '\tnode other/info.js', 'red');
