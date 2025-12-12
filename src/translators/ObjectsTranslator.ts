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

interface ObjectModificationTable {
    original: Record<string, Modification[]>;
    custom: Record<string, Modification[]>;
}

export abstract class ObjectsTranslator extends ITranslator {
    // Expose the ObjectType enum as part of this abstract class
    // The enum could be "export"ed , but it wouldn't be accessible
    // via `ObjectsTranslator.ObjectType`, which is preferable.
    public static readonly ObjectType = ObjectType;

    private static varTypes = {
        int: 0,
        real: 1,
        unreal: 2,
        string: 3,
        0: 'int',
        1: 'real',
        2: 'unreal',
        3: 'string'
    };

    public static jsonToWar(type: string, json: ObjectModificationTable): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addInt(3); // file version

        const writeModification = (modification: Modification, tableType: TableType, objectId: string) => {
            // Modification id (e.g. unam = name; reference MetaData lookups)
            outBufferToWar.addChars(modification.id);

            // Determine what type of field the mod is (int, real, unreal, string)
            let modType: number = 0;
            if (modification.type) { // if a type is specified, use it
                modType = this.varTypes[modification.type];
            } else { // otherwise we try to infer between int/string (note there is no way to detect unreal or float this way, so user must specify those explicitly)
                if (typeof modification.value === 'number') {
                    modType = this.varTypes.int;
                } else if (typeof modification.value === 'string') {
                    modType = this.varTypes.string;
                } else {
                    // ERROR: no type specified and cannot infer type!
                }
            }

            outBufferToWar.addInt(modType);

            // Addl integers required for: doodads, abilities, upgrades
            if (type === ObjectType.Doodads || type === ObjectType.Abilities || type === ObjectType.Upgrades) {
                outBufferToWar.addInt(modification.level || modification.variation || 0);
                outBufferToWar.addInt(modification.column || 0); // E.g DataA1 is 1 because of col A; refer to the xyzData.slk files for Data fields
            }

            // Write mod value
            if (modType === this.varTypes.int && typeof modification.value === 'number') {
                outBufferToWar.addInt(modification.value);
            } else if ((modType === this.varTypes.real || modType === this.varTypes.unreal) && typeof modification.value === 'number') {
                // Follow-up: check if unreal values are same hex format as real
                outBufferToWar.addFloat(modification.value);
            } else if (modType === this.varTypes.string && typeof modification.value === 'string') {
                // Note that World Editor normally creates a TRIGSTR_000 for these string
                // values - WC3MapTranslator just writes the string directly to file
                outBufferToWar.addString(modification.value);
            }

            // End of struct
            if (tableType === TableType.original) {
                // Original objects are ended with their base id (e.g. hfoo)
                outBufferToWar.addChars(objectId);
            } else {
                // Custom objects are ended with 0000 bytes
                outBufferToWar.addByte(0);
                outBufferToWar.addByte(0);
                outBufferToWar.addByte(0);
                outBufferToWar.addByte(0);
            }
        };

        const writeObject = (object: ObjectDefinition) => {
            if (object.customId) {
                // e.g. "h000:hfoo"
                outBufferToWar.addChars(object.originalId);
                outBufferToWar.addChars(object.customId);
            } else {
                outBufferToWar.addChars(object.originalId);

                // no new Id is assigned
                outBufferToWar.addByte(0);
                outBufferToWar.addByte(0);
                outBufferToWar.addByte(0);
                outBufferToWar.addByte(0);
            }

            // Number of modifications made to this object
            outBufferToWar.addInt(1);
            outBufferToWar.addInt(0);
            outBufferToWar.addInt(object.modifications.length);

            for (const mod of object.modifications) {
                writeModification(
                    mod,
                    object.customId ? TableType.custom : TableType.original,
                    object.originalId
                );
            }
        };

        const writeTable = (tableType: TableType) => {
            const tableData = json[tableType === TableType.original ? 'original' : 'custom'];

            outBufferToWar.addInt(Object.keys(tableData).length);
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
                });
            }
        };

        writeTable(TableType.original);
        writeTable(TableType.custom);

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
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
