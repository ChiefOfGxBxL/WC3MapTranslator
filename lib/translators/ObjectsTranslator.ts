import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';

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

export class ObjectsTranslator {

    public ObjectType = {
        Units: 'units',
        Items: 'items',
        Destructables: 'destructables',
        Doodads: 'doodads',
        Abilities: 'abilities',
        Buffs: 'buffs',
        Upgrades: 'upgrades'
    };

    public varTypes: any;
    public fileTypeExt: any;

    private _outBufferToWar: HexBuffer;
    private _outBufferToJSON: W3Buffer;

    constructor() {
        this.varTypes = {
            int: 0,
            real: 1,
            unreal: 2,
            string: 3,
            0: 'int',
            1: 'real',
            2: 'unreal',
            3: 'string'
        };

        this.fileTypeExt = { // (*) - uses the two optional ints after variable type
            units: 'w3u',
            items: 'w3t',
            destructables: 'w3b',
            doodads: 'w3d', // (*)
            abilities: 'w3a', // (*)
            buffs: 'w3h',
            upgrades: 'w3q' // (*)
        };
    }

    public jsonToWar(type: string, json) {
        this._outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        this._outBufferToWar.addInt(2); // file version

        const generateTableFromJson = (tableType: TableType, tableData) => { // create "original" or "custom" table
            Object.keys(tableData).forEach((defKey) => {
                const obj = tableData[defKey];

                // Original and new object ids
                if (tableType === TableType.original) {
                    this._outBufferToWar.addString(defKey);
                    this._outBufferToWar.addByte(0); this._outBufferToWar.addByte(0); this._outBufferToWar.addByte(0); this._outBufferToWar.addByte(0); // no new Id is assigned
                } else {
                    // e.g. "h000:hfoo"
                    this._outBufferToWar.addString(defKey.substring(5, 9)); // original id
                    this._outBufferToWar.addString(defKey.substring(0, 4)); // custom id
                }

                // Number of modifications made to this object
                this._outBufferToWar.addInt(obj.length);

                obj.forEach((mod: Modification) => {
                    let modType;

                    // Modification id (e.g. unam = name; reference MetaData lookups)
                    this._outBufferToWar.addString(mod.id);

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

                    this._outBufferToWar.addInt(modType);

                    // Addl integers
                    // Required for: doodads, abilities, upgrades
                    if (type === this.ObjectType.Doodads || type === this.ObjectType.Abilities || type === this.ObjectType.Upgrades) {

                        // Level or variation
                        // We need to check if hasOwnProperty because these could be explititly
                        // set to 0, but JavaScript's truthiness evaluates to false to it was defaulting
                        this._outBufferToWar.addInt(mod.level || mod.variation || 0); // defaults to 0

                        this._outBufferToWar.addInt(mod.column || 0); // E.g DataA1 is 1 because of col A; refer to the xyzData.slk files for Data fields
                    }

                    // Write mod value
                    if (modType === this.varTypes.int) {
                        this._outBufferToWar.addInt(mod.value);
                    } else if (modType === this.varTypes.real || modType === this.varTypes.unreal) {
                        // Follow-up: check if unreal values are same hex format as real
                        this._outBufferToWar.addFloat(mod.value);
                    } else if (modType === this.varTypes.string) {
                        // Note that World Editor normally creates a TRIGSTR_000 for these string
                        // values - WC3MapTranslator just writes the string directly to file
                        this._outBufferToWar.addString(mod.value);
                        this._outBufferToWar.addNullTerminator();
                    }

                    // End of struct
                    if (tableType === TableType.original) {
                        // Original objects are ended with their base id (e.g. hfoo)
                        this._outBufferToWar.addString(defKey);
                    } else {
                        // Custom objects are ended with 0000 bytes
                        this._outBufferToWar.addByte(0);
                        this._outBufferToWar.addByte(0);
                        this._outBufferToWar.addByte(0);
                        this._outBufferToWar.addByte(0);
                    }
                });
            });
        };

        /*
         * Original table
         */
        this._outBufferToWar.addInt(Object.keys(json.original).length);
        generateTableFromJson(TableType.original, json.original);

        /*
         * Custom table
         */
        this._outBufferToWar.addInt(Object.keys(json.custom).length); // # entry modifications
        generateTableFromJson(TableType.custom, json.custom);

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }

    public warToJson(type: string, buffer: Buffer) {
        const result = { original: {}, custom: {} };
        this._outBufferToJSON = new W3Buffer(buffer);

        const fileVersion = this._outBufferToJSON.readInt();

        const readModificationTable = (isOriginalTable: boolean) => {
            const numTableModifications = this._outBufferToJSON.readInt();

            for (let i = 0; i < numTableModifications; i++) {
                const objectDefinition = []; // object definition will store one or more modification objects

                const originalId = this._outBufferToJSON.readChars(4),
                    customId = this._outBufferToJSON.readChars(4),
                    modificationCount = this._outBufferToJSON.readInt();

                for (let j = 0; j < modificationCount; j++) {
                    const modification: Modification = {
                        id: '',
                        type: ModificationType.string,
                        level: 0,
                        column: 0,
                        value: {}
                    };

                    modification.id = this._outBufferToJSON.readChars(4);
                    modification.type = this.varTypes[this._outBufferToJSON.readInt()]; // 'int' | 'real' | 'unreal' | 'string',

                    if (type === this.ObjectType.Doodads || type === this.ObjectType.Abilities || type === this.ObjectType.Upgrades) {
                        modification.level = this._outBufferToJSON.readInt();
                        modification.column = this._outBufferToJSON.readInt();
                    }

                    if (modification.type === 'int') {
                        modification.value = this._outBufferToJSON.readInt();
                    } else if (modification.type === 'real' || modification.type === 'unreal') {
                        modification.value = this._outBufferToJSON.readFloat();
                    } else { // modification.type === 'string'
                        modification.value = this._outBufferToJSON.readString();
                    }

                    if (isOriginalTable) {
                        this._outBufferToJSON.readInt(); // should be 0 for original objects
                    } else {
                        this._outBufferToJSON.readChars(4); // should be object ID for custom objects
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
