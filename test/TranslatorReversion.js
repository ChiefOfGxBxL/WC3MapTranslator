"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const fs = __importStar(require("fs-extra"));
const Path = __importStar(require("path"));
const diff = __importStar(require("diff-buf"));
const Translator = __importStar(require("../index"));
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
        let result = new Translator.default().Doodads.warToJson(originalBuffer);
        let translatedBuffer = new Translator.default().Doodads.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.doo'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Strings reversion', () => {
        // this one is pending the strings translator support for war3map -> json
        assert_1.default(false, 'Not implemented');
    });
    it('Terrain reversion', () => {
        // take war3map.w3e -> json -> war3map.w3e
        let originalBuffer = readWar3MapBuffer('war3map.w3e');
        let result = new Translator.default().Terrain.warToJson(originalBuffer);
        let translatedBuffer = new Translator.default().Terrain.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3e'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Units reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3mapUnits.doo');
        let result = new Translator.default().Units.warToJson(originalBuffer);
        let translatedBuffer = new Translator.default().Units.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3mapUnits.doo'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Regions reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3r');
        let result = new Translator.default().Regions.warToJson(originalBuffer);
        let translatedBuffer = new Translator.default().Regions.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3r'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Cameras reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3c');
        let result = new Translator.default().Cameras.warToJson(originalBuffer);
        let translatedBuffer = new Translator.default().Cameras.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3c'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Sounds reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3s');
        let result = new Translator.default().Sounds.warToJson(originalBuffer);
        let translatedBuffer = new Translator.default().Sounds.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3s'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Units (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3u');
        let result = new Translator.default().Objects.warToJson('units', originalBuffer);
        let translatedBuffer = new Translator.default().Objects.jsonToWar('units', result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3u'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Items (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3t');
        let result = new Translator.default().Objects.warToJson('items', originalBuffer);
        let translatedBuffer = new Translator.default().Objects.jsonToWar('items', result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3t'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Destructables (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3b');
        let result = new Translator.default().Objects.warToJson('destructables', originalBuffer);
        let translatedBuffer = new Translator.default().Objects.jsonToWar('destructables', result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3b'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Doodads (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3d');
        let result = new Translator.default().Objects.warToJson('doodads', originalBuffer);
        let translatedBuffer = new Translator.default().Objects.jsonToWar('doodads', result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3d'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Abilities (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3a');
        let result = new Translator.default().Objects.warToJson('abilities', originalBuffer);
        let translatedBuffer = new Translator.default().Objects.jsonToWar('abilities', result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3a'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Buffs (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3h');
        let result = new Translator.default().Objects.warToJson('buffs', originalBuffer);
        let translatedBuffer = new Translator.default().Objects.jsonToWar('buffs', result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3h'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Upgrades (Object) reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3q');
        let result = new Translator.default().Objects.warToJson('upgrades', originalBuffer);
        let translatedBuffer = new Translator.default().Objects.jsonToWar('upgrades', result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3q'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Info reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.w3i');
        let result = new Translator.default().Info.warToJson(originalBuffer);
        let translatedBuffer = new Translator.default().Info.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.w3i'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
    it('Imports reversion', () => {
        let originalBuffer = readWar3MapBuffer('war3map.imp');
        let result = new Translator.default().Imports.warToJson(originalBuffer);
        let translatedBuffer = new Translator.default().Imports.jsonToWar(result.json).buffer;
        fs.writeFileSync(Path.join(outputDir, 'war3map.imp'), translatedBuffer);
        assert_1.default(buffersAreEqual(originalBuffer, translatedBuffer));
    });
});
//# sourceMappingURL=TranslatorReversion.js.map