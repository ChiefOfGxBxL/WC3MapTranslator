import { ITranslator } from './CommonInterfaces';
import {
    CamerasTranslator,
    DoodadsTranslator,
    ImportsTranslator,
    InfoTranslator,
    ObjectsTranslator,
    RegionsTranslator,
    SoundsTranslator,
    StringsTranslator,
    TerrainTranslator,
    UnitsTranslator
} from './translators';

export {
    CamerasTranslator,
    DoodadsTranslator,
    ImportsTranslator,
    InfoTranslator,
    ObjectsTranslator,
    RegionsTranslator,
    SoundsTranslator,
    StringsTranslator,
    TerrainTranslator,
    UnitsTranslator
};

interface TranslatorMapping {
    name: string;
    displayName: string;
    translator: ITranslator;
    jsonFile: string;
    warFile: string;
    objectType?: string;
}

const ObjectType = ObjectsTranslator.ObjectType;
export const translatorMappings: TranslatorMapping[] = [
    { name: 'cameras', displayName: 'Cameras', translator: CamerasTranslator, jsonFile: 'cameras.json', warFile: 'war3map.w3c' },
    { name: 'doodads', displayName: 'Doodads', translator: DoodadsTranslator, jsonFile: 'doodads.json', warFile: 'war3map.doo' },
    { name: 'imports', displayName: 'Imports', translator: ImportsTranslator, jsonFile: 'imports.json', warFile: 'war3map.imp' },
    { name: 'info', displayName: 'Info', translator: InfoTranslator, jsonFile: 'info.json', warFile: 'war3map.w3i' },
    { name: 'regions', displayName: 'Regions', translator: RegionsTranslator, jsonFile: 'regions.json', warFile: 'war3map.w3r' },
    { name: 'sounds', displayName: 'Sounds', translator: SoundsTranslator, jsonFile: 'sounds.json', warFile: 'war3map.w3s' },
    { name: 'strings', displayName: 'Strings', translator: StringsTranslator, jsonFile: 'strings.json', warFile: 'war3map.wts' },
    { name: 'terrain', displayName: 'Terrain', translator: TerrainTranslator, jsonFile: 'terrain.json', warFile: 'war3map.w3e' },
    { name: 'units', displayName: 'Units', translator: UnitsTranslator, jsonFile: 'units.json', warFile: 'war3mapUnits.doo' },

    { name: 'objects', displayName: 'Abilities (Object)', translator: ObjectsTranslator, jsonFile: 'obj-abilities.json', warFile: 'war3map.w3a', objectType: ObjectType.Abilities },
    { name: 'objects', displayName: 'Buffs (Object)', translator: ObjectsTranslator, jsonFile: 'obj-buffs.json', warFile: 'war3map.w3h', objectType: ObjectType.Buffs },
    { name: 'objects', displayName: 'Destructables (Object)', translator: ObjectsTranslator, jsonFile: 'obj-destructables.json', warFile: 'war3map.w3b', objectType: ObjectType.Destructables },
    { name: 'objects', displayName: 'Doodads (Object)', translator: ObjectsTranslator, jsonFile: 'obj-doodads.json', warFile: 'war3map.w3d', objectType: ObjectType.Doodads },
    { name: 'objects', displayName: 'Items (Object)', translator: ObjectsTranslator, jsonFile: 'obj-items.json', warFile: 'war3map.w3t', objectType: ObjectType.Items },
    { name: 'objects', displayName: 'Units (Object)', translator: ObjectsTranslator, jsonFile: 'obj-units.json', warFile: 'war3map.w3u', objectType: ObjectType.Units },
    { name: 'objects', displayName: 'Upgrades (Object)', translator: ObjectsTranslator, jsonFile: 'obj-upgrades.json', warFile: 'war3map.w3q', objectType: ObjectType.Upgrades }
];
