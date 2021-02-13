import assert from 'assert';
import * as diff from 'diff-buf';
import * as fs from 'fs-extra';
import * as Path from 'path';

import * as Translator from '../index';

const ObjectType = Translator.ObjectsTranslator.ObjectType;
const war3mapDir = Path.resolve('test/data');
const outputDir = Path.resolve('test/.output');

function readWar3MapBuffer(filename: string) {
    return fs.readFileSync(Path.join(war3mapDir, filename));
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

// Ensures that when a war3map file is converted to JSON and back again,
// the two war3map files are the same; converting between the two data formats
// should be a reversible process
describe('Reversion: war -> json -> war', () => {

    before(() => {
        fs.emptyDirSync(outputDir);
        fs.ensureDirSync(outputDir);
    });

    it('Doodads reversion', () => {
        // Take war3map.doo, -> JSON, -> war3map.doo
        // Compare buffers, ensure they are equal
        const originalBuffer = readWar3MapBuffer('war3map.doo');
        const result = Translator.DoodadsTranslator.warToJson(originalBuffer);
        const translatedBuffer = Translator.DoodadsTranslator.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.doo'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Strings reversion', () => {
        // this one is pending the strings translator support for war3map -> json
        assert(false, 'Not implemented');
    });

    it('Terrain reversion', () => {
        // take war3map.w3e -> json -> war3map.w3e
        const originalBuffer = readWar3MapBuffer('war3map.w3e');
        const result = Translator.TerrainTranslator.warToJson(originalBuffer);
        const translatedBuffer = Translator.TerrainTranslator.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3e'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Units reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3mapUnits.doo');
        const result = Translator.UnitsTranslator.warToJson(originalBuffer);
        const translatedBuffer = Translator.UnitsTranslator.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3mapUnits.doo'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Regions reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3r');
        const result = Translator.RegionsTranslator.warToJson(originalBuffer);
        const translatedBuffer = Translator.RegionsTranslator.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3r'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Cameras reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3c');
        const result = Translator.CamerasTranslator.warToJson(originalBuffer);
        const translatedBuffer = Translator.CamerasTranslator.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3c'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Sounds reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3s');
        const result = Translator.SoundsTranslator.warToJson(originalBuffer);
        const translatedBuffer = Translator.SoundsTranslator.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3s'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Units (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3u');
        const result = Translator.ObjectsTranslator.warToJson(ObjectType.Units, originalBuffer);
        const translatedBuffer = Translator.ObjectsTranslator.jsonToWar(ObjectType.Units, result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3u'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Items (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3t');
        const result = Translator.ObjectsTranslator.warToJson(ObjectType.Items, originalBuffer);
        const translatedBuffer = Translator.ObjectsTranslator.jsonToWar(ObjectType.Items, result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3t'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Destructables (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3b');
        const result = Translator.ObjectsTranslator.warToJson(ObjectType.Items, originalBuffer);
        const translatedBuffer = Translator.ObjectsTranslator.jsonToWar(ObjectType.Items, result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3b'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Doodads (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3d');
        const result = Translator.ObjectsTranslator.warToJson(ObjectType.Doodads, originalBuffer);
        const translatedBuffer = Translator.ObjectsTranslator.jsonToWar(ObjectType.Doodads, result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3d'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Abilities (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3a');
        const result = Translator.ObjectsTranslator.warToJson(ObjectType.Abilities, originalBuffer);
        const translatedBuffer = Translator.ObjectsTranslator.jsonToWar(ObjectType.Abilities, result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3a'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Buffs (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3h');
        const result = Translator.ObjectsTranslator.warToJson(ObjectType.Buffs, originalBuffer);
        const translatedBuffer = Translator.ObjectsTranslator.jsonToWar(ObjectType.Buffs, result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3h'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Upgrades (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3q');
        const result = Translator.ObjectsTranslator.warToJson(ObjectType.Upgrades, originalBuffer);
        const translatedBuffer = Translator.ObjectsTranslator.jsonToWar(ObjectType.Upgrades, result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3q'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Info reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3i');
        const result = Translator.InfoTranslator.warToJson(originalBuffer);
        const translatedBuffer = Translator.InfoTranslator.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3i'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Imports reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.imp');
        const result = Translator.ImportsTranslator.warToJson(originalBuffer);
        const translatedBuffer = Translator.ImportsTranslator.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.imp'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

});
