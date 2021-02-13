import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';

interface Terrain {
    tileset: string;
    customtileset: boolean;
    tilepalette: string[];
    clifftilepalette: string[];
    map: Map;
    tiles: any;
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

export abstract class TerrainTranslator {

    public static jsonToWar(terrainJson: Terrain) {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addString('W3E!'); // file id
        outBufferToWar.addInt(11); // file version
        outBufferToWar.addChar(terrainJson.tileset); // base tileset
        outBufferToWar.addInt(+terrainJson.customtileset); // 1 = using custom tileset, 0 = not

        /*
         * Tiles
         */
        outBufferToWar.addInt(terrainJson.tilepalette.length);
        terrainJson.tilepalette.forEach((tile) => {
            outBufferToWar.addString(tile);
        });

        /*
         * Cliffs
         */
        outBufferToWar.addInt(terrainJson.clifftilepalette.length);
        terrainJson.clifftilepalette.forEach((clifftile) => {
            outBufferToWar.addString(clifftile);
        });

        /*
         * Map size data
         */
        outBufferToWar.addInt(terrainJson.map.width + 1);
        outBufferToWar.addInt(terrainJson.map.height + 1);

        // map offset
        outBufferToWar.addFloat(terrainJson.map.offset.x);
        outBufferToWar.addFloat(terrainJson.map.offset.y);

        /*
         * Tile points
         */
        for (let i = terrainJson.tiles.length - 1; i >= 0; i--) {
            // write each for of tiles
            // tslint:disable-next-line: prefer-for-of
            for (let width = 0; width < terrainJson.tiles[i].length; width++) {
                const currTile = terrainJson.tiles[i][width];

                const boundaryFlag = currTile.boundaryFlag ? 0x4000 : 0;

                // these bit operations are based off documentation from https://github.com/stijnherfst/HiveWE/wiki/war3map.w3e-Terrain
                outBufferToWar.addShort(currTile.groundHeight); // height
                outBufferToWar.addShort(currTile.waterHeight | boundaryFlag); // water
                outBufferToWar.addByte(currTile.flags | currTile.groundTexture);
                outBufferToWar.addByte(currTile.groundVariation | currTile.cliffVariation);
                outBufferToWar.addByte(currTile.cliffTexture | currTile.layerHeight);
            }
        }

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer) {
        // create buffer
        const result: Terrain = {
            tileset: '',
            customtileset: false,
            tilepalette: [],
            clifftilepalette: [],
            map: {
                width: 1,
                height: 1,
                offset: {
                    x: 0,
                    y: 0
                }
            },
            tiles: {}
        };
        const outBufferToJSON = new W3Buffer(buffer);

        /**
         * Header
         */
        const w3eHeader = outBufferToJSON.readChars(4); // W3E!
        const version = outBufferToJSON.readInt(); // 0B 00 00 00
        const tileset = outBufferToJSON.readChars(1); // tileset
        const customtileset = (outBufferToJSON.readInt() === 1);

        result.tileset = tileset;
        result.customtileset = customtileset;

        /**
         * Tiles
         */
        const numTilePalettes = outBufferToJSON.readInt();
        const tilePalettes = [];
        for (let i = 0; i < numTilePalettes; i++) {
            tilePalettes.push(outBufferToJSON.readChars(4));
        }

        result.tilepalette = tilePalettes;

        /**
         * Cliffs
         */
        const numCliffTilePalettes = outBufferToJSON.readInt();
        const cliffPalettes = [];
        for (let i = 0; i < numCliffTilePalettes; i++) {
            const cliffPalette = outBufferToJSON.readChars(4);
            cliffPalettes.push(cliffPalette);
        }

        result.clifftilepalette = cliffPalettes;

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
        result.tiles = [];
        for (let h = 0; h < height + 1; h++) {
            const currRow = [];

            for (let w = 0; w < width + 1; w++) {
                // get the bytes from the buffer
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

                // add tile
                currRow.push({
                    groundHeight,
                    waterHeight,
                    boundaryFlag,
                    flags,
                    groundTexture,
                    groundVariation,
                    cliffVariation,
                    cliffTexture,
                    layerHeight
                });
            }
            result.tiles.unshift(currRow);
        }

        // tiles
        // [0, 0, 0, 0, 0, 0, 0]

        return {
            errors: [],
            json: result
        };
    }
}
