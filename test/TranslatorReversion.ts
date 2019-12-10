import assert from 'assert';
import * as fs from 'fs-extra';
import * as Path from 'path';
import * as diff from 'diff-buf';

import Translator = require('../index');

const war3mapDir = Path.resolve('examples/warToJson/files/input');
const outputDir = Path.resolve('test/.output');

function readWar3MapBuffer(filename) {
    return fs.readFileSync(Path.join(war3mapDir, filename));
}

function buffersAreEqual(b1, b2) {
    let comparison = diff.default(b1, b2, { string: false });

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
        let originalBuffer = readWar3MapBuffer('war3map.doo');
        let result = Translator.Doodads.warToJson(originalBuffer);
        let translatedBuffer = Translator.Doodads.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.doo'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Strings reversion', () => {
        // this one is pending the strings translator support for war3map -> json
        assert(false, 'Not implemented');
    });

    it('Terrain reversion', () => {
        // take war3map.w3e -> json -> war3map.w3e
        let originalBuffer = readWar3MapBuffer('war3map.w3e');
        let result = Translator.Terrain.warToJson(originalBuffer);
        let translatedBuffer = Translator.Terrain.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3e'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Units reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3mapUnits.doo');
        let result = Translator.Units.warToJson(originalBuffer);
        let translatedBuffer = Translator.Units.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3mapUnits.doo'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Regions reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3r');
        let result = Translator.Regions.warToJson(originalBuffer);
        let translatedBuffer = Translator.Regions.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3r'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Cameras reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3c');
        let result = Translator.Cameras.warToJson(originalBuffer);
        let translatedBuffer = Translator.Cameras.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3c'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Sounds reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3s');
        let result = Translator.Sounds.warToJson(originalBuffer);
        let translatedBuffer = Translator.Sounds.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3s'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Units (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3u');
        let result = Translator.Objects.warToJson('units', originalBuffer);
        let translatedBuffer = Translator.Objects.jsonToWar('units', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3u'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Items (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3t');
        let result = Translator.Objects.warToJson('items', originalBuffer);
        let translatedBuffer = Translator.Objects.jsonToWar('items', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3t'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Destructables (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3b');
        let result = Translator.Objects.warToJson('destructables', originalBuffer);
        let translatedBuffer = Translator.Objects.jsonToWar('destructables', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3b'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Doodads (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3d');
        let result = Translator.Objects.warToJson('doodads', originalBuffer);
        let translatedBuffer = Translator.Objects.jsonToWar('doodads', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3d'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Abilities (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3a');
        let result = Translator.Objects.warToJson('abilities', originalBuffer);
        let translatedBuffer = Translator.Objects.jsonToWar('abilities', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3a'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Buffs (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3h');
        let result = Translator.Objects.warToJson('buffs', originalBuffer);
        let translatedBuffer = Translator.Objects.jsonToWar('buffs', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3h'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Upgrades (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3q');
        let result = Translator.Objects.warToJson('upgrades', originalBuffer);
        let translatedBuffer = Translator.Objects.jsonToWar('upgrades', result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3q'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Info reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3i');
        let result = Translator.Info.warToJson(originalBuffer);
        let translatedBuffer = Translator.Info.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.w3i'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

    it('Imports reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.imp');
        let result = Translator.Imports.warToJson(originalBuffer);
        let translatedBuffer = Translator.Imports.jsonToWar(result.json).buffer;

        fs.writeFileSync(Path.join(outputDir, 'war3map.imp'), translatedBuffer);

        assert(buffersAreEqual(originalBuffer, translatedBuffer));
    });

});
