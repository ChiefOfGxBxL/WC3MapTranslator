import { ITranslator } from './CommonInterfaces';
import * as Translator from './index';

interface TranslatorMapping {
    name: string;
    displayName: string;
    translator: ITranslator;
    jsonFile: string;
    warFile: string;
    objectType?: string;
}

const ObjectType = Translator.ObjectsTranslator.ObjectType;
const translatorMappings: TranslatorMapping[] = [
    { name: 'cameras', displayName: 'Cameras', translator: Translator.CamerasTranslator, jsonFile: 'cameras.json', warFile: 'war3map.w3c' },
    { name: 'doodads', displayName: 'Doodads', translator: Translator.DoodadsTranslator, jsonFile: 'doodads.json', warFile: 'war3map.doo' },
    { name: 'imports', displayName: 'Imports', translator: Translator.ImportsTranslator, jsonFile: 'imports.json', warFile: 'war3map.imp' },
    { name: 'info', displayName: 'Info', translator: Translator.InfoTranslator, jsonFile: 'info.json', warFile: 'war3map.w3i' },
    { name: 'regions', displayName: 'Regions', translator: Translator.RegionsTranslator, jsonFile: 'regions.json', warFile: 'war3map.w3r' },
    { name: 'sounds', displayName: 'Sounds', translator: Translator.SoundsTranslator, jsonFile: 'sounds.json', warFile: 'war3map.w3s' },
    { name: 'strings', displayName: 'Strings', translator: Translator.StringsTranslator, jsonFile: 'strings.json', warFile: 'war3map.wts' },
    { name: 'terrain', displayName: 'Terrain', translator: Translator.TerrainTranslator, jsonFile: 'terrain.json', warFile: 'war3map.w3e' },
    { name: 'units', displayName: 'Units', translator: Translator.UnitsTranslator, jsonFile: 'units.json', warFile: 'war3mapUnits.doo' },

    { name: 'objects', displayName: 'Abilities (Object)', translator: Translator.ObjectsTranslator, jsonFile: 'obj-abilities.json', warFile: 'war3map.w3a', objectType: ObjectType.Abilities },
    { name: 'objects', displayName: 'Buffs (Object)', translator: Translator.ObjectsTranslator, jsonFile: 'obj-buffs.json', warFile: 'war3map.w3h', objectType: ObjectType.Buffs },
    { name: 'objects', displayName: 'Destructables (Object)', translator: Translator.ObjectsTranslator, jsonFile: 'obj-destructables.json', warFile: 'war3map.w3b', objectType: ObjectType.Destructables },
    { name: 'objects', displayName: 'Doodads (Object)', translator: Translator.ObjectsTranslator, jsonFile: 'obj-doodads.json', warFile: 'war3map.w3d', objectType: ObjectType.Doodads },
    { name: 'objects', displayName: 'Items (Object)', translator: Translator.ObjectsTranslator, jsonFile: 'obj-items.json', warFile: 'war3map.w3t', objectType: ObjectType.Items },
    { name: 'objects', displayName: 'Units (Object)', translator: Translator.ObjectsTranslator, jsonFile: 'obj-units.json', warFile: 'war3map.w3u', objectType: ObjectType.Units },
    { name: 'objects', displayName: 'Upgrades (Object)', translator: Translator.ObjectsTranslator, jsonFile: 'obj-upgrades.json', warFile: 'war3map.w3q', objectType: ObjectType.Upgrades }
];

export default translatorMappings;
