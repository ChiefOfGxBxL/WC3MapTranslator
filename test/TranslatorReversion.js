"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const diff_buf_1 = require("diff-buf");
const index_1 = require("../index");
const war3mapDir = path_1.default.resolve('examples/warToJson/files/input');
const outputDir = path_1.default.resolve('test/.output');
function readWar3MapBuffer(filename) {
    return fs_extra_1.fs.readFileSync(path_1.default.join(war3mapDir, filename));
}
function buffersAreEqual(b1, b2) {
    let comparison = diff_buf_1.diff(b1, b2, { string: false });
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
describe('Reversion: war -> json -> war', function () {
    before(function () {
        fs_extra_1.fs.emptyDirSync(outputDir);
        fs_extra_1.fs.ensureDir(outputDir);
    });
    it('Doodads reversion', function () {
        // Take war3map.doo, -> JSON, -> war3map.doo
        // Compare buffers, ensure they are equal
        let originalBuffer = readWar3MapBuffer('war3map.doo');
        let result = new index_1.Translator().Doodads.warToJson(originalBuffer);
        let translatedBuffer = new index_1.Translator().Doodads.jsonToWar(result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.doo'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Strings reversion', function () {
        // this one is pending the strings translator support for war3map -> json
        assert_1.default(false, 'Not implemented');
    });
    it('Terrain reversion', function () {
        // take war3map.w3e -> json -> war3map.w3e
        let originalBuffer = readWar3MapBuffer('war3map.w3e');
        let result = new index_1.Translator().Terrain.warToJson(originalBuffer);
        let translatedBuffer = new index_1.Translator().Terrain.jsonToWar(result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3e'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Units reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3mapUnits.doo');
        let result = new index_1.Translator().Units.warToJson(originalBuffer);
        let translatedBuffer = new index_1.Translator().Units.jsonToWar(result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3mapUnits.doo'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Regions reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3r');
        let result = new index_1.Translator().Regions.warToJson(originalBuffer);
        let translatedBuffer = new index_1.Translator().Regions.jsonToWar(result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3r'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Cameras reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3c');
        let result = new index_1.Translator().Cameras.warToJson(originalBuffer);
        let translatedBuffer = new index_1.Translator().Cameras.jsonToWar(result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3c'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Sounds reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3s');
        let result = new index_1.Translator().Sounds.warToJson(originalBuffer);
        let translatedBuffer = new index_1.Translator().Sounds.jsonToWar(result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3s'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Units (Object) reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3u');
        let result = new index_1.Translator().Objects.warToJson('units', originalBuffer);
        let translatedBuffer = new index_1.Translator().Objects.jsonToWar('units', result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3u'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Items (Object) reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3t');
        let result = new index_1.Translator().Objects.warToJson('items', originalBuffer);
        let translatedBuffer = new index_1.Translator().Objects.jsonToWar('items', result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3t'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Destructables (Object) reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3b');
        let result = new index_1.Translator().Objects.warToJson('destructables', originalBuffer);
        let translatedBuffer = new index_1.Translator().Objects.jsonToWar('destructables', result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3b'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Doodads (Object) reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3d');
        let result = new index_1.Translator().Objects.warToJson('doodads', originalBuffer);
        let translatedBuffer = new index_1.Translator().Objects.jsonToWar('doodads', result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3d'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Abilities (Object) reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3a');
        let result = new index_1.Translator().Objects.warToJson('abilities', originalBuffer);
        let translatedBuffer = new index_1.Translator().Objects.jsonToWar('abilities', result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3a'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Buffs (Object) reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3h');
        let result = new index_1.Translator().Objects.warToJson('buffs', originalBuffer);
        let translatedBuffer = new index_1.Translator().Objects.jsonToWar('buffs', result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3h'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Upgrades (Object) reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3q');
        let result = new index_1.Translator().Objects.warToJson('upgrades', originalBuffer);
        let translatedBuffer = new index_1.Translator().Objects.jsonToWar('upgrades', result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3q'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Info reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.w3i');
        let result = new index_1.Translator().Info.warToJson(originalBuffer);
        let translatedBuffer = new index_1.Translator().Info.jsonToWar(result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.w3i'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Imports reversion', function () {
        let originalBuffer = readWar3MapBuffer('war3map.imp');
        let result = new index_1.Translator().Imports.warToJson(originalBuffer);
        let translatedBuffer = new index_1.Translator().Imports.jsonToWar(result.json).buffer;
        fs_extra_1.fs.writeFileSync(path_1.default.join(outputDir, 'war3map.imp'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
});
//# sourceMappingURL=TranslatorReversion.js.map