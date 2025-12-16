import * as fs from 'fs-extra';
import assert from 'node:assert';
import path from 'node:path';
import { before, suite, test } from 'node:test';

import * as Translator from '../src';
import translatorMappings from '../src/TranslatorMappings';

const war3mapDir = path.resolve('test/data');
const outputDir = path.resolve('test/.output');

const readWar3MapBuffer = (filename: string) => fs.readFileSync(path.join(war3mapDir, filename));
const writeWar3TestFile = (filename: string, data: Buffer) => fs.writeFileSync(path.join(outputDir, filename), data);
const readJsonTestFile = (filename: string) => fs.readJsonSync(path.join(war3mapDir, filename));
const writeJsonTestFile = (filename: string, json: object) => fs.writeJsonSync(path.join(outputDir, filename), json, { spaces: 2 });

const tests = translatorMappings;

// Ensures that when a JSON file is converted to war3map and back again,
// the two JSON files are the same; converting between the two data formats
// must yield the original results back (except for some differences in rounding)
suite('Reversions', () => {
    before(() => {
        fs.emptyDirSync(outputDir);
        fs.ensureDirSync(outputDir);
    });

    suite('Reversion: json -> war -> json', () => {
        for (const { displayName, jsonFile, translator, objectType } of tests) {
            test(`should revert ${displayName}`, () => {
                const originalJson = readJsonTestFile(jsonFile);

                const translatedBuffer = translator === Translator.ObjectsTranslator
                    ? translator.jsonToWar(objectType, originalJson).buffer
                    : translator.jsonToWar(originalJson).buffer;

                const translatedJson = translator === Translator.ObjectsTranslator
                    ? translator.warToJson(objectType, translatedBuffer).json
                    : translator.warToJson(translatedBuffer).json;

                writeJsonTestFile(jsonFile, translatedJson);
                assert.deepStrictEqual(originalJson, translatedJson);
            });
        }
    });

    suite('Reversion: war -> json -> war', () => {
        for (const { displayName, warFile, translator, objectType } of tests) {
            test(`should revert ${displayName}`, () => {
                const originalBuffer = readWar3MapBuffer(warFile);

                const translatedJson = translator === Translator.ObjectsTranslator
                    ? translator.warToJson(objectType, originalBuffer).json
                    : translator.warToJson(originalBuffer).json;

                const translatedBuffer = translator === Translator.ObjectsTranslator
                    ? translator.jsonToWar(objectType, translatedJson).buffer
                    : translator.jsonToWar(translatedJson).buffer;

                writeWar3TestFile(warFile, translatedBuffer);
                assert.ok(originalBuffer.equals(translatedBuffer));
            });
        }
    });
});
