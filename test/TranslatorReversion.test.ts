import assert from 'assert';
import * as diff from 'diff-buf';
import * as fs from 'fs-extra';
import * as Path from 'path';

import * as Translator from '../src';
import { ITranslator } from '../src/CommonInterfaces';

const war3mapDir = Path.resolve('test/data');
const outputDir = Path.resolve('test/.output');

function readWar3MapBuffer(filename: string) {
    return fs.readFileSync(Path.join(war3mapDir, filename));
}

function readJsonTestFile(filename: string) {
    return fs.readJsonSync(Path.join(war3mapDir, filename));
}

function writeJsonTestFile(filename: string, json: object) {
    return fs.writeJsonSync(Path.join(outputDir, filename), json);
}

function buffersAreEqual(b1: Buffer, b2: Buffer) {
    const comparison = diff.default(b1, b2, { string: false });

    // Library `diff` returns an array of objects documenting comparison
    // e.g. { added: undefined, removed: undefined, value: 10 }
    // We want all `added` and `removed` fields to be "undefined" for
    // the buffers to be considered equal
    let buffersEqual = true;
    comparison.forEach((compare) => {
        if (compare.added || compare.removed) {
            buffersEqual = false;
        }
    });

    return buffersEqual;
}

// Ensures that when a JSON file is converted to war3map and back again,
// the two JSON files are the same; converting between the two data formats
// must yield the original results back (except for some differences in rounding)
describe('Reversion: json -> war -> json', () => {

    before(() => {
        fs.emptyDirSync(outputDir);
        fs.ensureDirSync(outputDir);
    });

    const ObjectType = Translator.ObjectsTranslator.ObjectType;

    const tests: { name: string, file: string, translator: ITranslator, objectType?: string }[] = [
        { name: 'Doodads', file: 'doodads.json', translator: Translator.DoodadsTranslator },
        { name: 'Strings', file: 'strings.json', translator: Translator.StringsTranslator },
        { name: 'Terrain', file: 'terrain.json', translator: Translator.TerrainTranslator },
        { name: 'Units', file: 'units.json', translator: Translator.UnitsTranslator },
        { name: 'Regions', file: 'regions.json', translator: Translator.RegionsTranslator },
        { name: 'Cameras', file: 'cameras.json', translator: Translator.CamerasTranslator },
        { name: 'Sounds', file: 'sounds.json', translator: Translator.SoundsTranslator },
        { name: 'Info', file: 'info.json', translator: Translator.InfoTranslator },
        { name: 'Imports', file: 'imports.json', translator: Translator.ImportsTranslator },

        { name: 'Units (Object)', file: 'obj-units.json', translator: Translator.ObjectsTranslator, objectType: ObjectType.Units },
        { name: 'Items (Object)', file: 'obj-items.json', translator: Translator.ObjectsTranslator, objectType: ObjectType.Items },
        { name: 'Destructables (Object)', file: 'obj-destructables.json', translator: Translator.ObjectsTranslator, objectType: ObjectType.Destructables },
        { name: 'Doodads (Object)', file: 'obj-doodads.json', translator: Translator.ObjectsTranslator, objectType: ObjectType.Doodads },
        { name: 'Abilities (Object)', file: 'obj-abilities.json', translator: Translator.ObjectsTranslator, objectType: ObjectType.Abilities },
        { name: 'Buffs (Object)', file: 'obj-buffs.json', translator: Translator.ObjectsTranslator, objectType: ObjectType.Buffs },
        { name: 'Upgrades (Object)', file: 'obj-upgrades.json', translator: Translator.ObjectsTranslator, objectType: ObjectType.Upgrades },
    ];

    tests.forEach(({ name, file, translator, objectType }) => {
        it(`should revert ${name}`, () => {
            const originalJson = readJsonTestFile(file);

            const translatedBuffer = translator === Translator.ObjectsTranslator ?
                translator.jsonToWar(objectType, originalJson).buffer :
                translator.jsonToWar(originalJson).buffer;

            const translatedJson = translator === Translator.ObjectsTranslator ?
                translator.warToJson(objectType, translatedBuffer).json :
                translator.warToJson(translatedBuffer).json;

            writeJsonTestFile(file, translatedJson);

            assert.deepStrictEqual(originalJson, translatedJson);
        })
    })

});
