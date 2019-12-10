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

export class TerrainTranslator {

    public _outBufferToWar: HexBuffer;
    public _outBufferToJSON: W3Buffer;

    constructor() { }

    public jsonToWar(terrainJson) {
        this._outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        this._outBufferToWar.addString('W3E!'); // file id
        this._outBufferToWar.addInt(11); // file version
        this._outBufferToWar.addChar(terrainJson.tileset); // base tileset
        this._outBufferToWar.addInt(+terrainJson.customtileset); // 1 = using custom tileset, 0 = not

        /*
         * Tiles
         */
        this._outBufferToWar.addInt(terrainJson.tilepalette.length);
        terrainJson.tilepalette.forEach(function (tile) {
            this._outBufferToWar.addString(tile);
        });

        /*
         * Cliffs
         */
        this._outBufferToWar.addInt(terrainJson.clifftilepalette.length);
        terrainJson.clifftilepalette.forEach(function (clifftile) {
            this._outBufferToWar.addString(clifftile);
        });

        /*
         * Map size data
         */
        this._outBufferToWar.addInt(terrainJson.map.width + 1);
        this._outBufferToWar.addInt(terrainJson.map.height + 1);

        // map offset
        this._outBufferToWar.addFloat(terrainJson.map.offset.x);
        this._outBufferToWar.addFloat(terrainJson.map.offset.y);

        /*
         * Tile points
         */
        for (let i = terrainJson.tiles.length - 1; i >= 0; i--) {
            // write each for of tiles
            for (let width = 0; width < terrainJson.tiles[i].length; width++) {
                const currTile = terrainJson.tiles[i][width];

                const boundaryFlag = currTile.boundaryFlag ? 0x4000 : 0;

                // these bit operations are based off documentation from https://github.com/stijnherfst/HiveWE/wiki/war3map.w3e-Terrain
                this._outBufferToWar.addShort(currTile.groundHeight); // height
                this._outBufferToWar.addShort(currTile.waterHeight | boundaryFlag); // water
                this._outBufferToWar.addByte(currTile.flags | currTile.groundTexture);
                this._outBufferToWar.addByte(currTile.groundVariation | currTile.cliffVariation);
                this._outBufferToWar.addByte(currTile.cliffTexture | currTile.layerHeight);
            }
        }

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }

    public warToJson(buffer) {
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
        this._outBufferToJSON = new W3Buffer(buffer);

        /**
         * Header
         */
        const w3eHeader = this._outBufferToJSON.readChars(4); // W3E!
        const version = this._outBufferToJSON.readInt(); // 0B 00 00 00
        const tileset = this._outBufferToJSON.readChars(1); // tileset
        const customtileset = (this._outBufferToJSON.readInt() === 1);

        result.tileset = tileset;
        result.customtileset = customtileset;

        /**
         * Tiles
         */
        const numTilePalettes = this._outBufferToJSON.readInt();
        const tilePalettes = [];
        for (let i = 0; i < numTilePalettes; i++) {
            tilePalettes.push(this._outBufferToJSON.readChars(4));
        }

        result.tilepalette = tilePalettes;

        /**
         * Cliffs
         */
        const numCliffTilePalettes = this._outBufferToJSON.readInt();
        const cliffPalettes = [];
        for (let i = 0; i < numCliffTilePalettes; i++) {
            const cliffPalette = this._outBufferToJSON.readChars(4);
            cliffPalettes.push(cliffPalette);
        }

        result.clifftilepalette = cliffPalettes;

        /**
         * map dimensions
         */
        const width = this._outBufferToJSON.readInt() - 1;
        const height = this._outBufferToJSON.readInt() - 1;
        result.map = { width: width, height: height, offset: { x: 0, y: 0 } };

        const offsetX = this._outBufferToJSON.readFloat();
        const offsetY = this._outBufferToJSON.readFloat();
        result.map.offset = { x: offsetX, y: offsetY };

        /**
         * map tiles
         */
        result.tiles = [];
        for (let h = 0; h < height + 1; h++) {
            const currRow = [];

            for (let w = 0; w < width + 1; w++) {
                // get the bytes from the buffer
                const groundHeight = this._outBufferToJSON.readShort();
                const waterHeightAndBoundary = this._outBufferToJSON.readShort();
                const flagsAndGroundTexture = this._outBufferToJSON.readByte();
                const groundAndCliffVariation = this._outBufferToJSON.readByte();
                const cliffTextureAndLayerHeight = this._outBufferToJSON.readByte();

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
                    groundHeight: groundHeight,
                    waterHeight: waterHeight,
                    boundaryFlag: boundaryFlag,
                    flags: flags,
                    groundTexture: groundTexture,
                    groundVariation: groundVariation,
                    cliffVariation: cliffVariation,
                    cliffTexture: cliffTexture,
                    layerHeight: layerHeight
                });
            }
            result.tiles.unshift(currRow);
        }

        // tiles
        //[0, 0, 0, 0, 0, 0, 0]

        return {
            errors: [],
            json: result
        };
    }
}
