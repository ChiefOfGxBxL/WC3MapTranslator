import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, ITranslator } from '../CommonInterfaces';

enum TableType {
    original = 'original',
    custom = 'custom'
}

enum ModificationType {
    int = 'int',
    real = 'real',
    unreal = 'unreal',
    string = 'string'
}

enum ObjectType {
    Units = 'units',
    Items = 'items',
    Destructables = 'destructables',
    Doodads = 'doodads',
    Abilities = 'abilities',
    Buffs = 'buffs',
    Upgrades = 'upgrades'
};

interface Modification {
    id: string;
    type: ModificationType;
    value: number | string;

    // Marked optional because these fields are not needed on any table.
    // They can be specified for: Doodads, Abilities, Upgrades, but if
    // not specified, they default to the value 0.
    level?: number;
    column?: number;
    variation?: number;
}

interface ObjectDefinition {
    originalId: string;
    customId: string;
    modifications: Modification[];
}

type ModificationTableRecords = Record<string, Modification[]>;

interface ObjectModificationTable {
    original: ModificationTableRecords;
    custom: ModificationTableRecords;
}

const varTypes = {
    int: 0,
    real: 1,
    unreal: 2,
    string: 3,
    0: 'int',
    1: 'real',
    2: 'unreal',
    3: 'string'
};

// Destructables now have two files, `war3map.w3b` and `war3mapSkin.w3b`.
// Fields in the `units/destructablemetadata.slk` file with `netsafe` = 1
// are placed in the new `war3mapSkin.w3b` file.
const destructableSkinFields = [
    'bnam', 'bsuf', 'bfil', 'blit',
    'btxi', 'btxf', 'buch', 'bvar',
    'bfxr', 'bsel', 'bmis', 'bmas',
    'bcpr', 'bmap', 'bmar', 'bptx',
    'bptd', 'bdsn', 'bsnd', 'bshd',
    'bsmm', 'bmmr', 'bmmg', 'bmmb',
    'bumm', 'bvcr', 'bvcg', 'bvcb',
    'bgsc', 'bgpm'
];

export default abstract class ObjectsTranslator extends ITranslator {
    // Expose the ObjectType enum as part of this abstract class
    // The enum could be "export"ed , but it wouldn't be accessible
    // via `ObjectsTranslator.ObjectType`, which is preferable.
    public static readonly ObjectType = ObjectType;

    public static jsonToWar(type: string, json: ObjectModificationTable): WarResult {
        const outBufferToWar = new HexBuffer();
        const outBufferSkin = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addInt(3); // file version
        outBufferSkin.addInt(3); // file version

        const writeModification = (modification: Modification, tableType: TableType, objectId: string, buffer: HexBuffer) => {
            // Modification id (e.g. unam = name; reference MetaData lookups)
            buffer.addChars(modification.id);

            // Determine what type of field the mod is (int, real, unreal, string)
            let modType: number = 0;
            if (modification.type) { // if a type is specified, use it
                modType = varTypes[modification.type];
            } else { // otherwise we try to infer between int/string (note there is no way to detect unreal or float this way, so user must specify those explicitly)
                if (typeof modification.value === 'number') {
                    modType = varTypes.int;
                } else if (typeof modification.value === 'string') {
                    modType = varTypes.string;
                } else {
                    // ERROR: no type specified and cannot infer type!
                }
            }

            buffer.addInt(modType);

            // Addl integers required for: doodads, abilities, upgrades
            if (type === ObjectType.Doodads || type === ObjectType.Abilities || type === ObjectType.Upgrades) {
                buffer.addInt(modification.level || modification.variation || 0);
                buffer.addInt(modification.column || 0); // E.g DataA1 is 1 because of col A; refer to the xyzData.slk files for Data fields
            }

            // Write mod value
            if (modType === varTypes.int && typeof modification.value === 'number') {
                buffer.addInt(modification.value);
            } else if ((modType === varTypes.real || modType === varTypes.unreal) && typeof modification.value === 'number') {
                // Follow-up: check if unreal values are same hex format as real
                buffer.addFloat(modification.value);
            } else if (modType === varTypes.string && typeof modification.value === 'string') {
                // Note that World Editor normally creates a TRIGSTR_000 for these string
                // values - WC3MapTranslator just writes the string directly to file
                buffer.addString(modification.value);
            }

            // End of struct
            if (tableType === TableType.original) {
                // Original objects are ended with their base id (e.g. hfoo)
                buffer.addChars(objectId);
            } else {
                // Custom objects are ended with 0000 bytes
                buffer.addByte(0);
                buffer.addByte(0);
                buffer.addByte(0);
                buffer.addByte(0);
            }
        };

        const writeObject = (object: ObjectDefinition, buffer: HexBuffer) => {
            if (object.customId) {
                // e.g. "h000:hfoo"
                buffer.addChars(object.originalId);
                buffer.addChars(object.customId);
            } else {
                buffer.addChars(object.originalId);

                // no new Id is assigned
                buffer.addByte(0);
                buffer.addByte(0);
                buffer.addByte(0);
                buffer.addByte(0);
            }

            // Number of modifications made to this object
            buffer.addInt(1);
            buffer.addInt(0);
            buffer.addInt(object.modifications.length);

            for (const mod of object.modifications) {
                writeModification(
                    mod,
                    object.customId ? TableType.custom : TableType.original,
                    object.originalId,
                    buffer
                );
            }
        };

        const writeTable = (tableType: TableType, buffer: HexBuffer, data: ObjectModificationTable) => {
            const tableData = data[tableType];

            buffer.addInt(Object.keys(tableData).length);
            for (const objectId of Object.keys(tableData)) {
                let originalId = '';
                let customId = '';

                if (objectId.indexOf(':') !== -1) {
                    [customId, originalId] = objectId.split(':');
                } else {
                    originalId = objectId;
                }

                writeObject({
                    originalId,
                    customId,
                    modifications: tableData[objectId]
                }, buffer);
            }
        };

        const splitObjectModificationTable = (input: ObjectModificationTable) => {
            const original: ModificationTableRecords = {};
            const originalSkin: ModificationTableRecords = {};
            const custom: ModificationTableRecords = {};
            const customSkin: ModificationTableRecords = {};

            for (const table of [input.original, input.custom]) {
                const isCustom = table === input.custom;

                for (const objectId of Object.keys(table)) {
                    const regularFields = table[objectId].filter((d) => !destructableSkinFields.includes(d.id));
                    const skinFields = table[objectId].filter((d) => destructableSkinFields.includes(d.id));

                    if (regularFields.length) (isCustom ? custom : original)[objectId] = regularFields;
                    if (skinFields.length) (isCustom ? customSkin : originalSkin)[objectId] = skinFields;
                }
            }

            return { original, custom, originalSkin, customSkin };
        };

        let usingSkinFile = false;
        if (type === ObjectType.Destructables) {
            const { original, custom, originalSkin, customSkin } = splitObjectModificationTable(json);

            // Regular
            const jsonRegular: ObjectModificationTable = { original, custom };
            writeTable(TableType.original, outBufferToWar, jsonRegular);
            writeTable(TableType.custom, outBufferToWar, jsonRegular);

            // Skin
            if (type === ObjectType.Destructables) {
                const jsonSkin: ObjectModificationTable = { original: originalSkin, custom: customSkin };
                usingSkinFile = Object.keys(jsonSkin.original).length > 0 || Object.keys(jsonSkin.custom).length > 0;
                writeTable(TableType.original, outBufferSkin, jsonSkin);
                writeTable(TableType.custom, outBufferSkin, jsonSkin);
            }
        } else {
            writeTable(TableType.original, outBufferToWar, json);
            writeTable(TableType.custom, outBufferToWar, json);
        }

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer(),
            bufferSkin: (type === ObjectType.Destructables && usingSkinFile) ? outBufferSkin.getBuffer() : undefined
        };
    }

    public static warToJson(type: string, buffer: Buffer): JsonResult<ObjectModificationTable> {
        const result: ObjectModificationTable = { original: {}, custom: {} };
        const outBufferToJSON = new W3Buffer(buffer);

        outBufferToJSON.readInt(); // fileVersion

        const readModification = (): Modification => {
            const id = outBufferToJSON.readFourCC();
            const valueType = Object.values(ModificationType)[outBufferToJSON.readInt()];

            let level = 0;
            let column = 0;
            if (type === ObjectType.Doodads || type === ObjectType.Abilities || type === ObjectType.Upgrades) {
                level = outBufferToJSON.readInt();
                column = outBufferToJSON.readInt();
            }

            let value = null;
            if (valueType === 'int') {
                value = outBufferToJSON.readInt();
            } else if (valueType === 'real' || valueType === 'unreal') {
                value = outBufferToJSON.readFloat();
            } else { // valueType === 'string'
                value = outBufferToJSON.readString();
            }

            outBufferToJSON.readFourCC(); // original fields end with object ID, custom fields end with (00 00 00 00)

            return { id, type: valueType, level, column, value };
        };

        const readObject = (): ObjectDefinition => {
            const originalId = outBufferToJSON.readFourCC();
            const customId = outBufferToJSON.readFourCC();
            outBufferToJSON.readInt();
            outBufferToJSON.readInt();
            const modificationCount = outBufferToJSON.readInt();

            const modifications: Modification[] = [];
            for (let j = 0; j < modificationCount; j++) {
                modifications.push(readModification());
            }

            return {
                originalId,
                customId,
                modifications
            };
        };

        const readTable = (isOriginalTable: boolean) => {
            const numTableModifications = outBufferToJSON.readInt();

            for (let i = 0; i < numTableModifications; i++) {
                const modifiedObject = readObject();

                const idInTable = isOriginalTable ? modifiedObject.originalId : `${modifiedObject.customId}:${modifiedObject.originalId}`;
                result[isOriginalTable ? 'original' : 'custom'][idInTable] = modifiedObject.modifications;
            }
        };

        readTable(true);
        readTable(false);

        return {
            errors: [],
            json: result
        };
    }
}
