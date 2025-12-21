import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, ITranslator, expectVersion } from '../CommonInterfaces';

enum Tileset {
    Ashenvale = 'A',
    Barrens = 'B',
    BlackCitadel = 'K',
    Cityscape = 'Y',
    Dalaran = 'X',
    DalaranRuins = 'J',
    Dungeon = 'D',
    Felwood = 'C',
    IcecrownGlacier = 'I',
    LordaeronFall = 'F',
    LordaeronSummer = 'L',
    LordaeronWinter = 'W',
    Northrend = 'N',
    Outland = 'O',
    SunkenRuins = 'Z',
    Underground = 'G',
    Village = 'V',
    VillageFall = 'Q'
}

interface Terrain {
    tileset: string;
    customTileset: boolean;
    tilePalette: string[];
    cliffTilePalette: string[];
    map: Map;
    // "Masks"
    groundHeight: number[];
    waterHeight: number[];
    boundaryFlag: boolean[];
    flags: number[];
    groundTexture: number[];
    groundVariation: number[];
    cliffVariation: number[];
    cliffTexture: number[];
    layerHeight: number[];
}

interface Map {
    width: number;
    height: number;
    offset: Offset;
}

interface Offset {
    x: number;
    y: number;
}

function flatten<T>(arrays: T[][]): T[] {
    return arrays.flat();
}

function chunkArray<T>(array: T[], size: number): T[][] {
    const rows = [];
    for (let i = 0; i < array.length / size; i++) {
        rows.push(array.slice(i * size, (i + 1) * size));
    }
    return rows;
}

export default abstract class TerrainTranslator extends ITranslator {
    public static readonly Tileset = Tileset;

    public static jsonToWar(terrainJson: Terrain): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addChars('W3E!'); // file id
        outBufferToWar.addInt(12); // file version

        outBufferToWar.addChar(terrainJson.tileset); // base tileset
        outBufferToWar.addInt(+terrainJson.customTileset); // 1 = using custom tileset, 0 = not

        /*
         * Tiles
         */
        outBufferToWar.addInt(terrainJson.tilePalette.length);
        for (const tile of terrainJson.tilePalette) {
            outBufferToWar.addChars(tile);
        }

        /*
         * Cliffs
         */
        outBufferToWar.addInt(terrainJson.cliffTilePalette.length);
        for (const cliffTile of terrainJson.cliffTilePalette) {
            outBufferToWar.addChars(cliffTile);
        }

        /*
         * Map size data
         */
        outBufferToWar.addInt(terrainJson.map.width + 1);
        outBufferToWar.addInt(terrainJson.map.height + 1);

        /*
         * Map offset
         */
        outBufferToWar.addFloat(terrainJson.map.offset.x);
        outBufferToWar.addFloat(terrainJson.map.offset.y);

        /*
         * Tile points
         */
        // Partition the terrainJson masks into "chunks" (i.e. rows) of (width+1) length,
        // reverse that list of rows (due to vertical flipping), and then write the rows out
        const rows = {
            groundHeight: chunkArray(terrainJson.groundHeight, terrainJson.map.width + 1),
            waterHeight: chunkArray(terrainJson.waterHeight, terrainJson.map.width + 1),
            boundaryFlag: chunkArray(terrainJson.boundaryFlag, terrainJson.map.width + 1),
            flags: chunkArray(terrainJson.flags, terrainJson.map.width + 1),
            groundTexture: chunkArray(terrainJson.groundTexture, terrainJson.map.width + 1),
            groundVariation: chunkArray(terrainJson.groundVariation, terrainJson.map.width + 1),
            cliffVariation: chunkArray(terrainJson.cliffVariation, terrainJson.map.width + 1),
            cliffTexture: chunkArray(terrainJson.cliffTexture, terrainJson.map.width + 1),
            layerHeight: chunkArray(terrainJson.layerHeight, terrainJson.map.width + 1)
        };

        rows.groundHeight.reverse();
        rows.waterHeight.reverse();
        rows.boundaryFlag.reverse();
        rows.flags.reverse();
        rows.groundTexture.reverse();
        rows.groundVariation.reverse();
        rows.cliffVariation.reverse();
        rows.cliffTexture.reverse();
        rows.layerHeight.reverse();

        for (let i = 0; i < rows.groundHeight.length; i++) {
            for (let j = 0; j < rows.groundHeight[i].length; j++) {
                const groundHeight = rows.groundHeight[i][j];
                const waterHeight = rows.waterHeight[i][j];
                const boundaryFlag = rows.boundaryFlag[i][j];
                const flags = rows.flags[i][j];
                const groundTexture = rows.groundTexture[i][j];
                const groundVariation = rows.groundVariation[i][j];
                const cliffVariation = rows.cliffVariation[i][j];
                const cliffTexture = rows.cliffTexture[i][j];
                const layerHeight = rows.layerHeight[i][j];

                const hasBoundaryFlag = boundaryFlag ? 0x4000 : 0;

                outBufferToWar.addShort(groundHeight);
                outBufferToWar.addShort(waterHeight | hasBoundaryFlag);
                outBufferToWar.addShort(flags | groundTexture);
                outBufferToWar.addByte(groundVariation | cliffVariation);
                outBufferToWar.addByte(cliffTexture | layerHeight);
            }
        }

        return {
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<Terrain> {
        const outBufferToJSON = new W3Buffer(buffer);
        const result: Terrain = {
            tileset: Tileset.LordaeronSummer,
            customTileset: false,
            tilePalette: [],
            cliffTilePalette: [],
            map: {
                width: 1,
                height: 1,
                offset: {
                    x: 0,
                    y: 0
                }
            },
            groundHeight: [],
            waterHeight: [],
            boundaryFlag: [],
            flags: [],
            groundTexture: [],
            groundVariation: [],
            cliffVariation: [],
            cliffTexture: [],
            layerHeight: []
        };

        /**
         * Header
         */
        outBufferToJSON.readChars(4); // w3eHeader: W3E!
        expectVersion(12, outBufferToJSON.readInt()); // version: 0C 00 00 00

        const tileset = outBufferToJSON.readChars(1); // tileset
        const customTileset = (outBufferToJSON.readInt() === 1);

        result.tileset = tileset;
        result.customTileset = customTileset;

        /**
         * Tiles
         */
        const numTilePalettes = outBufferToJSON.readInt();
        const tilePalettes = [];
        for (let i = 0; i < numTilePalettes; i++) {
            tilePalettes.push(outBufferToJSON.readChars(4));
        }
        result.tilePalette = tilePalettes;

        /**
         * Cliffs
         */
        const numCliffTilePalettes = outBufferToJSON.readInt();
        const cliffPalettes = [];
        for (let i = 0; i < numCliffTilePalettes; i++) {
            cliffPalettes.push(outBufferToJSON.readChars(4));
        }
        result.cliffTilePalette = cliffPalettes;

        /**
         * Map dimensions
         */
        const width = outBufferToJSON.readInt() - 1;
        const height = outBufferToJSON.readInt() - 1;
        const offsetX = outBufferToJSON.readFloat();
        const offsetY = outBufferToJSON.readFloat();
        result.map = { width, height, offset: { x: offsetX, y: offsetY } };

        /**
         * Map tiles
         */
        const arr_groundHeight: number[] = [];
        const arr_waterHeight: number[] = [];
        const arr_boundaryFlag: boolean[] = [];
        const arr_flags: number[] = [];
        const arr_groundTexture: number[] = [];
        const arr_groundVariation: number[] = [];
        const arr_cliffVariation: number[] = [];
        const arr_cliffTexture: number[] = [];
        const arr_layerHeight: number[] = [];

        while (!outBufferToJSON.isExhausted()) {
            const groundHeight = outBufferToJSON.readShort();

            const waterHeightAndBoundary = outBufferToJSON.readShort();
            const waterHeight = waterHeightAndBoundary & 32767;
            const boundaryFlag = (waterHeightAndBoundary & 0x4000) === 0x4000;

            const flagsAndGroundTexture = outBufferToJSON.readShort();
            const flags =         flagsAndGroundTexture & 0b1111_1111_1100_0000; // upper 10 bits
            const groundTexture = flagsAndGroundTexture & 0b0000_0000_0011_1111; // lower 6 bits

            const groundAndCliffVariation = outBufferToJSON.readByte();
            const groundVariation = groundAndCliffVariation & 0b11111000; // upper 5 bits
            const cliffVariation =  groundAndCliffVariation & 0b00000111; // lower 3 bits

            const cliffTextureAndLayerHeight = outBufferToJSON.readByte();
            const cliffTexture = cliffTextureAndLayerHeight & 0b11110000; // upper 4 bits
            const layerHeight =  cliffTextureAndLayerHeight & 0b00001111; // lower 4 bits

            arr_groundHeight.push(groundHeight);
            arr_waterHeight.push(waterHeight);
            arr_boundaryFlag.push(boundaryFlag);
            arr_flags.push(flags);
            arr_groundTexture.push(groundTexture);
            arr_groundVariation.push(groundVariation);
            arr_cliffVariation.push(cliffVariation);
            arr_cliffTexture.push(cliffTexture);
            arr_layerHeight.push(layerHeight);
        }

        // The map was read in "backwards" because wc3 maps have origin (0,0)
        // at the bottom left instead of top left as we desire. Flip the rows
        // vertically to fix this.
        result.groundHeight = flatten(chunkArray(arr_groundHeight, result.map.width + 1).reverse());
        result.waterHeight = flatten(chunkArray(arr_waterHeight, result.map.width + 1).reverse());
        result.boundaryFlag = flatten(chunkArray(arr_boundaryFlag, result.map.width + 1).reverse());
        result.flags = flatten(chunkArray(arr_flags, result.map.width + 1).reverse());
        result.groundTexture = flatten(chunkArray(arr_groundTexture, result.map.width + 1).reverse());
        result.groundVariation = flatten(chunkArray(arr_groundVariation, result.map.width + 1).reverse());
        result.cliffVariation = flatten(chunkArray(arr_cliffVariation, result.map.width + 1).reverse());
        result.cliffTexture = flatten(chunkArray(arr_cliffTexture, result.map.width + 1).reverse());
        result.layerHeight = flatten(chunkArray(arr_layerHeight, result.map.width + 1).reverse());

        return {
            json: result
        };
    }
}
