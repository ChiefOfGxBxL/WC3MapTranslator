/**
 * WC3MapTranslator examples using TypeScript
 *
 * Learn how to translate between JSON and war3map
 * formats using the TypeScript library.
 *
 * To use regular JavaScript, `import`s need to be changed
 * to `require()`s, and you'd build WC3MapTranslator and
 * require the `index.js` file instead of the .ts one.
 */

// Import the translator class - in your own code
// you'd want to `npm install wc3maptranslator` and
// then import it from node_modules. These examples
// load from '../index' to avoid versioning issues.
import { Translator } from '../index';

// NodeJS file system library for writing output files
import fs from 'fs';

// Define the translators to be used. We'll demonstrate
// how to use all of them, but your use-case may vary,
// so there may not be a need to define all of them.
const UnitsTranslator = new Translator().Units;
const DoodadsTranslator = new Translator().Doodads;
const TerrainTranslator = new Translator().Terrain;
const RegionsTranslator = new Translator().Regions;
const CamerasTranslator = new Translator().Cameras;
const SoundsTranslator = new Translator().Sounds;
const ObjectsTranslator = new Translator().Objects;
const ImportsTranslator = new Translator().Imports;
const InfoTranslator = new Translator().Info;
const StringsTranslator = new Translator().Strings;

/* * * * * * * * * * * * * * *
 *                           *
 *     JSON --> War3map      *
 *                           *
 * * * * * * * * * * * * * * */

// Taking JSON and converting it into the war3map format is easy!
// Just use the appropriate translator to call `.jsonToWar()`,
// providing the JSON input. Here, the JSON is saved in a subdirectory,
// and NodeJS can read in JSON using `require()` with the path.
//
// The `.jsonToWar()` function returns an object containing:
//  * buffer (Buffer)
//  * errors (array)
// The `buffer` contains the data you'll write to a war3map file,
// and `errors` is an array of errors in case the JSON is incorrect.
const unitResults = UnitsTranslator.jsonToWar(require('./json/units.json'));
DoodadsTranslator.jsonToWar(require('./json/doodads.json'));
TerrainTranslator.jsonToWar(require('./json/terrain.json'));
RegionsTranslator.jsonToWar(require('./json/regions.json'));
CamerasTranslator.jsonToWar(require('./json/cameras.json'));
SoundsTranslator.jsonToWar(require('./json/sounds.json'));
ImportsTranslator.jsonToWar(require('./json/imports.json'));
InfoTranslator.jsonToWar(require('./json/info.json'));
StringsTranslator.jsonToWar(require('./json/strings.json'));

// The ObjectTranslator `.jsonToWar()` function needs to be given the
// type of object it is translating, e.g. units, items, buffs, etc.
// This is done by using the ObjectType enum under the ObjectsTranslator
// instance.
ObjectsTranslator.jsonToWar(ObjectsTranslator.ObjectType.Units, require('./json/object-units.json'));
ObjectsTranslator.jsonToWar(ObjectsTranslator.ObjectType.Items, require('./json/object-items.json'));
ObjectsTranslator.jsonToWar(ObjectsTranslator.ObjectType.Destructables, require('./json/object-destructables.json'));
ObjectsTranslator.jsonToWar(ObjectsTranslator.ObjectType.Doodads, require('./json/object-doodads.json'));
ObjectsTranslator.jsonToWar(ObjectsTranslator.ObjectType.Abilities, require('./json/object-abilities.json'));
ObjectsTranslator.jsonToWar(ObjectsTranslator.ObjectType.Buffs, require('./json/object-buffs.json'));
ObjectsTranslator.jsonToWar(ObjectsTranslator.ObjectType.Upgrades, require('./json/object-upgrades.json'));

// Above you learned how easy it is to use the `.jsonToWar()` function
// to get an output buffer in the war3map format. Now all we have to
// do is save the buffer to a file. This is the file you'd put into
// a .w3x WarCraft III map file (e.g. using an MPQ Editor). You may
// also consider using an asynchronous method for performance.
fs.writeFileSync('war3mapUnits.doo', unitResults.buffer);

// `war3mapUnits.doo` is the file name that WC3 uses for units that
// are placed on the map (not to be confused with `war3map.w3u`, which
// is for units defined in the object editor).

// Now that you know how to write the buffer results from the `.jsonToWar()`
// function, give it a try on some other files! Then use an MPQ Editor
// to drag and drop the war3map files into a map and check it out using
// World Editor!

/* * * * * * * * * * * * * * *
 *                           *
 *     War3map --> JSON      *
 *                           *
 * * * * * * * * * * * * * * */

// Now that you're familiar with how to convert JSON to war3map
// as detailed above, converting war3map files to JSON is easy!

// The only difference is that we'll use the `.warToJson()` function,
// and what it returns will be:
//  * json (object)
//  * errors (array)
// so we have JSON instead of a buffer.
UnitsTranslator.warToJson(fs.readFileSync('./war/war3mapUnits.doo'));
DoodadsTranslator.warToJson(fs.readFileSync('./war/war3map.doo'));
TerrainTranslator.warToJson(fs.readFileSync('./war/war3map.w3e'));

// Regions, Cameras, Sounds, Imports, Info, and Strings have purposely
// been omitted for learning. The process is the same as the above lines.
// Give it a try!

// Moving on to translating object editor data from war3map to JSON format:
ObjectsTranslator.warToJson(ObjectsTranslator.ObjectType.Units, fs.readFileSync('./war/war3map.w3u'));
const objectItemsResult = ObjectsTranslator.warToJson(ObjectsTranslator.ObjectType.Items, fs.readFileSync('./war/war3map.w3t'));
ObjectsTranslator.warToJson(ObjectsTranslator.ObjectType.Destructables, fs.readFileSync('./war/war3map.w3b'));

// Note that the object translation examples for Doodads, Abilities, Buffs
// and Upgrades have purposely been omitted for learning. Try your hand at
// using the ObjectsTranslator to translate the files in the `./war` directory
// into JSON format!
// For file names and extensions, see: https://github.com/ChiefOfGxBxL/WC3MapTranslator#file-support

// We can use the result of `.warToJson()` to save our JSON file:
// Caution: the value in `.json` might yield [object Object]
// depending on where you're printing or saving it, because that is the
// default .toString() representation of JSON. You'll want to stringify
// the JSON to get the actual readable format.
fs.writeFileSync('objectEditorItems.json', JSON.stringify(objectItemsResult.json, null, 4));

console.info('\n[v] [WC3MapTranslator examples]');
console.info('  Demonstrates how to translate between JSON and war3map');
console.info('  ✔ Success! Output files written to ./examples/');
console.info('    * war3mapUnits.doo');
console.info('    * objectEditorItems.json');
console.info('[^] [WC3MapTranslator examples]\n');
