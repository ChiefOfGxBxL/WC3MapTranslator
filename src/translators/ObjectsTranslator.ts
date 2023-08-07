import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult } from '../CommonInterfaces'

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

enum FileTypeExtension { // (*) - uses the two optional ints after variable type
    units = 'w3u',
    items = 'w3t',
    destructables = 'w3b',
    doodads = 'w3d', // (*)
    abilities = 'w3a', // (*)
    buffs = 'w3h',
    upgrades = 'w3q' // (*)
};

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
    type: ModificationType; // 'int' | 'real' | 'unreal' | 'string',
    value: any;

    // Marked optional because these fields are not needed on any table.
    // They can be specified for: Doodads, Abilities, Upgrades, but if
    // not specified, they default to the value 0.
    level?: number;
    column?: number;
    variation?: number;
}

interface ObjectModificationTable {
    original: object,
    custom: object
}

export abstract class ObjectsTranslator {

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

    public static jsonToWar(type: string, json): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addInt(2); // file version

        const generateTableFromJson = (tableType: TableType, tableData) => { // create "original" or "custom" table
            Object.keys(tableData).forEach((defKey) => {
                const obj = tableData[defKey];

                // Original and new object ids
                if (tableType === TableType.original) {
                    outBufferToWar.addChars(defKey);
                    outBufferToWar.addByte(0); outBufferToWar.addByte(0); outBufferToWar.addByte(0); outBufferToWar.addByte(0); // no new Id is assigned
                } else {
                    // e.g. "h000:hfoo"
                    outBufferToWar.addChars(defKey.substring(5, 9)); // original id
                    outBufferToWar.addChars(defKey.substring(0, 4)); // custom id
                }

                // Number of modifications made to this object
                outBufferToWar.addInt(obj.length);

                obj.forEach((mod: Modification) => {
                    let modType;

                    // Modification id (e.g. unam = name; reference MetaData lookups)
                    outBufferToWar.addChars(mod.id);

                    // Determine what type of field the mod is (int, real, unreal, string)
                    if (mod.type) { // if a type is specified, use it
                        modType = this.varTypes[mod.type];
                    } else { // otherwise we try to infer between int/string (note there is no way to detect unreal or float this way, so user must specify those explicitly)
                        if (typeof mod.value === 'number') {
                            modType = this.varTypes.int;
                        } else if (typeof mod.value === 'string') {
                            modType = this.varTypes.string;
                        } else {
                            // ERROR: no type specified and cannot infer type!
                        }
                    }

                    outBufferToWar.addInt(modType);

                    // Addl integers
                    // Required for: doodads, abilities, upgrades
                    if (type === ObjectType.Doodads || type === ObjectType.Abilities || type === ObjectType.Upgrades) {

                        // Level or variation
                        // We need to check if hasOwnProperty because these could be explititly
                        // set to 0, but JavaScript's truthiness evaluates to false to it was defaulting
                        outBufferToWar.addInt(mod.level || mod.variation || 0); // defaults to 0

                        outBufferToWar.addInt(mod.column || 0); // E.g DataA1 is 1 because of col A; refer to the xyzData.slk files for Data fields
                    }

                    // Write mod value
                    if (modType === this.varTypes.int) {
                        outBufferToWar.addInt(mod.value);
                    } else if (modType === this.varTypes.real || modType === this.varTypes.unreal) {
                        // Follow-up: check if unreal values are same hex format as real
                        outBufferToWar.addFloat(mod.value);
                    } else if (modType === this.varTypes.string) {
                        // Note that World Editor normally creates a TRIGSTR_000 for these string
                        // values - WC3MapTranslator just writes the string directly to file
                        outBufferToWar.addString(mod.value);
                    }

                    // End of struct
                    if (tableType === TableType.original) {
                        // Original objects are ended with their base id (e.g. hfoo)
                        outBufferToWar.addChars(defKey);
                    } else {
                        // Custom objects are ended with 0000 bytes
                        outBufferToWar.addByte(0);
                        outBufferToWar.addByte(0);
                        outBufferToWar.addByte(0);
                        outBufferToWar.addByte(0);
                    }
                });
            });
        };

        /*
         * Original table
         */
        outBufferToWar.addInt(Object.keys(json.original).length);
        generateTableFromJson(TableType.original, json.original);

        /*
         * Custom table
         */
        outBufferToWar.addInt(Object.keys(json.custom).length); // # entry modifications
        generateTableFromJson(TableType.custom, json.custom);

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(type: string, buffer: Buffer): JsonResult<ObjectModificationTable> {
        const result = { original: {}, custom: {} };
        const outBufferToJSON = new W3Buffer(buffer);

        const fileVersion = outBufferToJSON.readInt();

        const readModificationTable = (isOriginalTable: boolean) => {
            const numTableModifications = outBufferToJSON.readInt();

            for (let i = 0; i < numTableModifications; i++) {
                const objectDefinition = []; // object definition will store one or more modification objects

                const originalId = outBufferToJSON.readChars(4),
                    customId = outBufferToJSON.readChars(4),
                    modificationCount = outBufferToJSON.readInt();

                for (let j = 0; j < modificationCount; j++) {
                    const modification: Modification = {
                        id: '',
                        type: ModificationType.string,
                        level: 0,
                        column: 0,
                        value: {}
                    };

                    modification.id = outBufferToJSON.readChars(4);
                    modification.type = this.varTypes[outBufferToJSON.readInt()]; // 'int' | 'real' | 'unreal' | 'string',

                    if (type === ObjectType.Doodads || type === ObjectType.Abilities || type === ObjectType.Upgrades) {
                        modification.level = outBufferToJSON.readInt();
                        modification.column = outBufferToJSON.readInt();
                    }

                    if (modification.type === 'int') {
                        modification.value = outBufferToJSON.readInt();
                    } else if (modification.type === 'real' || modification.type === 'unreal') {
                        modification.value = outBufferToJSON.readFloat();
                    } else { // modification.type === 'string'
                        modification.value = outBufferToJSON.readString();
                    }

                    if (isOriginalTable) {
                        outBufferToJSON.readInt(); // should be 0 for original objects
                    } else {
                        outBufferToJSON.readChars(4); // should be object ID for custom objects
                    }

                    objectDefinition.push(modification);
                }

                if (isOriginalTable) {
                    result.original[originalId] = objectDefinition;
                } else {
                    result.custom[customId + ':' + originalId] = objectDefinition;
                }
            }
        };

        readModificationTable(true);
        readModificationTable(false);

        return {
            errors: [],
            json: result
        };
    }
}
