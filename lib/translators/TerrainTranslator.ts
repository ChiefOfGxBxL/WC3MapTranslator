import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult } from '../CommonInterfaces'

interface Terrain {
    tileset: string;
    customTileset: boolean;
    tilePalette: string[];
    cliffTilePalette: string[];
    map: Map;
    // "Masks"
    groundHeight: number[],
    waterHeight: number[],
    boundaryFlag: boolean[],
    flags: number[],
    groundTexture: number[],
    groundVariation: number[],
    cliffVariation: number[],
    cliffTexture: number[],
    layerHeight: number[]
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

function splitLargeArrayIntoWidthArrays(array: any[], width: number) {
    const rows = [];
    for(let i = 0; i < array.length / width; i++) {
        rows.push(array.slice(i * width, (i+1) * width));
    }
    return rows;
}

export abstract class TerrainTranslator {

    public static jsonToWar(terrainJson: Terrain): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addChars('W3E!'); // file id
        outBufferToWar.addInt(11); // file version
        outBufferToWar.addChar(terrainJson.tileset); // base tileset
        outBufferToWar.addInt(+terrainJson.customTileset); // 1 = using custom tileset, 0 = not

        /*
         * Tiles
         */
        outBufferToWar.addInt(terrainJson.tilePalette.length);
        terrainJson.tilePalette.forEach((tile) => {
            outBufferToWar.addChars(tile);
        });

        /*
         * Cliffs
         */
        outBufferToWar.addInt(terrainJson.cliffTilePalette.length);
        terrainJson.cliffTilePalette.forEach((cliffTile) => {
            outBufferToWar.addChars(cliffTile);
        });

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
            groundHeight: splitLargeArrayIntoWidthArrays(terrainJson.groundHeight, terrainJson.map.width + 1),
            waterHeight: splitLargeArrayIntoWidthArrays(terrainJson.waterHeight, terrainJson.map.width + 1),
            boundaryFlag: splitLargeArrayIntoWidthArrays(terrainJson.boundaryFlag, terrainJson.map.width + 1),
            flags: splitLargeArrayIntoWidthArrays(terrainJson.flags, terrainJson.map.width + 1),
            groundTexture: splitLargeArrayIntoWidthArrays(terrainJson.groundTexture, terrainJson.map.width + 1),
            groundVariation: splitLargeArrayIntoWidthArrays(terrainJson.groundVariation, terrainJson.map.width + 1),
            cliffVariation: splitLargeArrayIntoWidthArrays(terrainJson.cliffVariation, terrainJson.map.width + 1),
            cliffTexture: splitLargeArrayIntoWidthArrays(terrainJson.cliffTexture, terrainJson.map.width + 1),
            layerHeight: splitLargeArrayIntoWidthArrays(terrainJson.layerHeight, terrainJson.map.width + 1)
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

        for(let i = 0; i < rows.groundHeight.length; i++) {
            for(let j = 0; j < rows.groundHeight[i].length; j++) {
                // these bit operations are based off documentation from https://github.com/stijnherfst/HiveWE/wiki/war3map.w3e-Terrain
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
                outBufferToWar.addByte(flags | groundTexture);
                outBufferToWar.addByte(groundVariation | cliffVariation);
                outBufferToWar.addByte(cliffTexture | layerHeight);
            }
        }

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<Terrain> {
        // create buffer
        const result: Terrain = {
            tileset: '',
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
        const outBufferToJSON = new W3Buffer(buffer);

        /**
         * Header
         */
        const w3eHeader = outBufferToJSON.readChars(4); // W3E!
        const version = outBufferToJSON.readInt(); // 0B 00 00 00
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
            const cliffPalette = outBufferToJSON.readChars(4);
            cliffPalettes.push(cliffPalette);
        }

        result.cliffTilePalette = cliffPalettes;

        /**
         * map dimensions
         */
        const width = outBufferToJSON.readInt() - 1;
        const height = outBufferToJSON.readInt() - 1;
        result.map = { width, height, offset: { x: 0, y: 0 } };

        const offsetX = outBufferToJSON.readFloat();
        const offsetY = outBufferToJSON.readFloat();
        result.map.offset = { x: offsetX, y: offsetY };

        /**
         * map tiles
         */
        const arr_groundHeight = [];
        const arr_waterHeight = [];
        const arr_boundaryFlag = [];
        const arr_flags = [];
        const arr_groundTexture = [];
        const arr_groundVariation = [];
        const arr_cliffVariation = [];
        const arr_cliffTexture = [];
        const arr_layerHeight = [];

        while(!outBufferToJSON.isExhausted()) {
            const groundHeight = outBufferToJSON.readShort();
            const waterHeightAndBoundary = outBufferToJSON.readShort();
            const flagsAndGroundTexture = outBufferToJSON.readByte();
            const groundAndCliffVariation = outBufferToJSON.readByte();
            const cliffTextureAndLayerHeight = outBufferToJSON.readByte();

            // parse out different bits (based on documentation from https://github.com/stijnherfst/HiveWE/wiki/war3map.w3e-Terrain)
            const waterHeight = waterHeightAndBoundary & 32767;
            const boundaryFlag = (waterHeightAndBoundary & 0x4000) === 0x4000;
            const flags = flagsAndGroundTexture & 240;
            const groundTexture = flagsAndGroundTexture & 15;
            const groundVariation = groundAndCliffVariation & 248;
            const cliffVariation = groundAndCliffVariation & 7;
            const cliffTexture = cliffTextureAndLayerHeight & 240;
            const layerHeight = cliffTextureAndLayerHeight & 15;

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

        function convertArrayOfArraysIntoFlatArray(arr) {
            return arr.reduce((a, b) => {
                return [...a, ...b]
            });
        }

        // The map was read in "backwards" because wc3 maps have origin (0,0)
        // at the bottom left instead of top left as we desire. Flip the rows
        // vertically to fix this.
        result.groundHeight = convertArrayOfArraysIntoFlatArray(splitLargeArrayIntoWidthArrays(arr_groundHeight, result.map.width + 1).reverse())
        result.waterHeight = convertArrayOfArraysIntoFlatArray(splitLargeArrayIntoWidthArrays(arr_waterHeight, result.map.width + 1).reverse())
        result.boundaryFlag = convertArrayOfArraysIntoFlatArray(splitLargeArrayIntoWidthArrays(arr_boundaryFlag, result.map.width + 1).reverse())
        result.flags = convertArrayOfArraysIntoFlatArray(splitLargeArrayIntoWidthArrays(arr_flags, result.map.width + 1).reverse())
        result.groundTexture = convertArrayOfArraysIntoFlatArray(splitLargeArrayIntoWidthArrays(arr_groundTexture, result.map.width + 1).reverse())
        result.groundVariation = convertArrayOfArraysIntoFlatArray(splitLargeArrayIntoWidthArrays(arr_groundVariation, result.map.width + 1).reverse())
        result.cliffVariation = convertArrayOfArraysIntoFlatArray(splitLargeArrayIntoWidthArrays(arr_cliffVariation, result.map.width + 1).reverse())
        result.cliffTexture = convertArrayOfArraysIntoFlatArray(splitLargeArrayIntoWidthArrays(arr_cliffTexture, result.map.width + 1).reverse())
        result.layerHeight = convertArrayOfArraysIntoFlatArray(splitLargeArrayIntoWidthArrays(arr_layerHeight, result.map.width + 1).reverse())

        return {
            errors: [],
            json: result
        };
    }
}
