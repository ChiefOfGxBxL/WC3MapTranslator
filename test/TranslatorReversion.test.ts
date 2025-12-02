import * as fs from 'fs-extra';
import assert from 'node:assert';
import path from 'node:path';
import { before, suite, test } from 'node:test';

import * as Translator from '../src';
import { ITranslator } from '../src/CommonInterfaces';

const war3mapDir = path.resolve('test/data');
const outputDir = path.resolve('test/.output');

const readWar3MapBuffer = (filename: string) => fs.readFileSync(path.join(war3mapDir, filename));
const writeWar3TestFile = (filename: string, data: Buffer) => fs.writeFileSync(path.join(outputDir, filename), data);
const readJsonTestFile = (filename: string) => fs.readJsonSync(path.join(war3mapDir, filename));
const writeJsonTestFile = (filename: string, json: object) => fs.writeJsonSync(path.join(outputDir, filename), json);

const ObjectType = Translator.ObjectsTranslator.ObjectType;
const tests: { name: string, jsonFile: string, warFile: string, translator: ITranslator, objectType?: string }[] = [
    { name: 'Doodads', jsonFile: 'doodads.json', warFile: 'war3map.doo', translator: Translator.DoodadsTranslator },
    { name: 'Strings', jsonFile: 'strings.json', warFile: 'war3map.wts', translator: Translator.StringsTranslator },
    { name: 'Terrain', jsonFile: 'terrain.json', warFile: 'war3map.w3e', translator: Translator.TerrainTranslator },
    { name: 'Units', jsonFile: 'units.json', warFile: 'war3mapUnits.doo', translator: Translator.UnitsTranslator },
    { name: 'Regions', jsonFile: 'regions.json', warFile: 'war3map.w3r', translator: Translator.RegionsTranslator },
    { name: 'Cameras', jsonFile: 'cameras.json', warFile: 'war3map.w3c', translator: Translator.CamerasTranslator },
    { name: 'Sounds', jsonFile: 'sounds.json', warFile: 'war3map.w3s', translator: Translator.SoundsTranslator },
    { name: 'Info', jsonFile: 'info.json', warFile: 'war3map.w3i', translator: Translator.InfoTranslator },
    { name: 'Imports', jsonFile: 'imports.json', warFile: 'war3map.imp', translator: Translator.ImportsTranslator },

    { name: 'Units (Object)', jsonFile: 'obj-units.json', warFile: 'war3map.w3u', translator: Translator.ObjectsTranslator, objectType: ObjectType.Units },
    { name: 'Items (Object)', jsonFile: 'obj-items.json', warFile: 'war3map.w3t', translator: Translator.ObjectsTranslator, objectType: ObjectType.Items },
    { name: 'Destructables (Object)', jsonFile: 'obj-destructables.json', warFile: 'war3map.w3b', translator: Translator.ObjectsTranslator, objectType: ObjectType.Destructables },
    { name: 'Doodads (Object)', jsonFile: 'obj-doodads.json', warFile: 'war3map.w3d', translator: Translator.ObjectsTranslator, objectType: ObjectType.Doodads },
    { name: 'Abilities (Object)', jsonFile: 'obj-abilities.json', warFile: 'war3map.w3a', translator: Translator.ObjectsTranslator, objectType: ObjectType.Abilities },
    { name: 'Buffs (Object)', jsonFile: 'obj-buffs.json', warFile: 'war3map.w3h', translator: Translator.ObjectsTranslator, objectType: ObjectType.Buffs },
    { name: 'Upgrades (Object)', jsonFile: 'obj-upgrades.json', warFile: 'war3map.w3q', translator: Translator.ObjectsTranslator, objectType: ObjectType.Upgrades }
];

// Ensures that when a JSON file is converted to war3map and back again,
// the two JSON files are the same; converting between the two data formats
// must yield the original results back (except for some differences in rounding)
suite('Reversion: json -> war -> json', () => {

    before(() => {
        fs.emptyDirSync(outputDir);
        fs.ensureDirSync(outputDir);
    });

    tests.forEach(({ name, jsonFile, translator, objectType }) => {
        test(`should revert ${name}`, () => {
            const originalJson = readJsonTestFile(jsonFile);

            const translatedBuffer = translator === Translator.ObjectsTranslator ?
                translator.jsonToWar(objectType, originalJson).buffer :
                translator.jsonToWar(originalJson).buffer;

            const translatedJson = translator === Translator.ObjectsTranslator ?
                translator.warToJson(objectType, translatedBuffer).json :
                translator.warToJson(translatedBuffer).json;

            writeJsonTestFile(jsonFile, translatedJson);

            assert.deepStrictEqual(originalJson, translatedJson);
        });
    });

});

suite('Reversion: war -> json -> war', () => {

    before(() => {
        fs.emptyDirSync(outputDir);
        fs.ensureDirSync(outputDir);
    });

    tests.forEach(({ name, warFile, translator, objectType }) => {
        test(`should revert ${name}`, () => {
            const originalBuffer = readWar3MapBuffer(warFile);

            const translatedJson = translator === Translator.ObjectsTranslator ?
                translator.warToJson(objectType, originalBuffer).json :
                translator.warToJson(originalBuffer).json;

            const translatedBuffer = translator === Translator.ObjectsTranslator ?
                translator.jsonToWar(objectType, translatedJson).buffer :
                translator.jsonToWar(translatedJson).buffer;

            writeWar3TestFile(warFile, translatedBuffer);
            assert.ok(originalBuffer.equals(translatedBuffer));
        });
    });

});
