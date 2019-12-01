"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const translators_1 = require("./lib/translators");
class Translator {
    constructor() {
        this.Doodads = new translators_1.DoodadsTranslator();
        this.Strings = new translators_1.StringsTranslator();
        this.Terrain = new translators_1.TerrainTranslator();
        this.Units = new translators_1.UnitsTranslator();
        this.Regions = new translators_1.RegionsTranslator();
        this.Cameras = new translators_1.CamerasTranslator();
        this.Sounds = new translators_1.SoundsTranslator();
        this.Objects = new translators_1.ObjectsTranslator();
        this.Imports = new translators_1.ImportsTranslator();
        this.Info = new translators_1.InfoTranslator();
    }
}
exports.default = Translator;
//# sourceMappingURL=index.js.map