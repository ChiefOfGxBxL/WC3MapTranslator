import assert from 'assert';
import * as diff from 'diff-buf';
import * as fs from 'fs-extra';
import * as Path from 'path';

import { Translator } from '../index';

const testTranslator = new Translator();
const war3mapDir = Path.resolve('examples/warToJson/files/input');
const outputDir = Path.resolve('test/.output');

function readWar3MapBuffer(filename) {
    return fs.readFileSync(Path.join(war3mapDir, filename));
}

function buffersAreEqual(b1, b2) {
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
        fs.ensureDir(outputDir);
    });

    it('Doodads reversion', () => {
        // Take war3map.doo, -> JSON, -> war3map.doo
        // Compare buffers, ensure they are equal
        const originalBuffer = readWar3MapBuffer('war3map.doo');
        const result = testTranslator.Doodads.warToJson(originalBuffer);
        const translatedBuffer = testTranslator.Doodads.jsonToWar(result.json).buffer;
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
        const result = testTranslator.Terrain.warToJson(originalBuffer);
        const translatedBuffer = testTranslator.Terrain.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3e'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Units reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3mapUnits.doo');
        const result = testTranslator.Units.warToJson(originalBuffer);
        const translatedBuffer = testTranslator.Units.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3mapUnits.doo'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Regions reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3r');
        const result = testTranslator.Regions.warToJson(originalBuffer);
        const translatedBuffer = testTranslator.Regions.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3r'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Cameras reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3c');
        const result = testTranslator.Cameras.warToJson(originalBuffer);
        const translatedBuffer = testTranslator.Cameras.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3c'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Sounds reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3s');
        const result = testTranslator.Sounds.warToJson(originalBuffer);
        const translatedBuffer = testTranslator.Sounds.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3s'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Units (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3u');
        const result = testTranslator.Objects.warToJson('units', originalBuffer);
        const translatedBuffer = testTranslator.Objects.jsonToWar('units', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3u'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Items (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3t');
        const result = testTranslator.Objects.warToJson('items', originalBuffer);
        const translatedBuffer = testTranslator.Objects.jsonToWar('items', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3t'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Destructables (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3b');
        const result = testTranslator.Objects.warToJson('destructables', originalBuffer);
        const translatedBuffer = testTranslator.Objects.jsonToWar('destructables', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3b'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Doodads (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3d');
        const result = testTranslator.Objects.warToJson('doodads', originalBuffer);
        const translatedBuffer = testTranslator.Objects.jsonToWar('doodads', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3d'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Abilities (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3a');
        const result = testTranslator.Objects.warToJson('abilities', originalBuffer);
        const translatedBuffer = testTranslator.Objects.jsonToWar('abilities', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3a'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Buffs (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3h');
        const result = testTranslator.Objects.warToJson('buffs', originalBuffer);
        const translatedBuffer = testTranslator.Objects.jsonToWar('buffs', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3h'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Upgrades (Object) reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3q');
        const result = testTranslator.Objects.warToJson('upgrades', originalBuffer);
        const translatedBuffer = testTranslator.Objects.jsonToWar('upgrades', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3q'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Info reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.w3i');
        const result = testTranslator.Info.warToJson(originalBuffer);
        const translatedBuffer = testTranslator.Info.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3i'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Imports reversion', () => {
        const originalBuffer = readWar3MapBuffer('war3map.imp');
        const result = testTranslator.Imports.warToJson(originalBuffer);
        const translatedBuffer = testTranslator.Imports.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.imp'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

});
