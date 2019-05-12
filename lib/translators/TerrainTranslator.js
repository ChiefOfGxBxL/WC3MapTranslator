let HexBuffer = require('../HexBuffer'),
    W3Buffer = require('../W3Buffer');

const TerrainTranslator = {
    jsonToWar: function(terrainJson) {
        let outBuffer = new HexBuffer();

        /*
         * Header
         */
        outBuffer.addString('W3E!'); // file id
        outBuffer.addInt(11); // file version
        outBuffer.addChar(terrainJson.tileset); // base tileset
        outBuffer.addInt(+terrainJson.customtileset); // 1 = using custom tileset, 0 = not


        /*
         * Tiles
         */
        outBuffer.addInt(terrainJson.tilepalette.length);
        terrainJson.tilepalette.forEach(function(tile) {
            outBuffer.addString(tile);
        });


        /*
         * Cliffs
         */
        outBuffer.addInt(terrainJson.clifftilepalette.length);
        terrainJson.clifftilepalette.forEach(function(clifftile) {
            outBuffer.addString(clifftile);
        });


        /*
         * Map size data
         */
        outBuffer.addInt(terrainJson.map.width + 1);
        outBuffer.addInt(terrainJson.map.height + 1);

        // map offset
        outBuffer.addFloat(terrainJson.map.offset.x);
        outBuffer.addFloat(terrainJson.map.offset.y);


        /*
         * Tile points
         */
        for(let i = 0; i < terrainJson.tiles.length; i++) {
            // write each for of tiles
            for (let w = 0; w < terrainJson.tiles[i].length; w++) {
                let currTile = terrainJson.tiles[i][w];

                let boundaryFlag = currTile.boundaryFlag ? 0x4000 : 0;

                outBuffer.addShort(currTile.groundHeight); // height
                outBuffer.addShort(currTile.waterHeight | boundaryFlag); // water
                outBuffer.addByte(currTile.flags | currTile.groundTexture);
                outBuffer.addByte(currTile.groundVariation | currTile.cliffVariation);
                outBuffer.addByte(currTile.cliffTexture | currTile.layerHeight);
            }
        }

        return {
            errors: [],
            buffer: outBuffer.getBuffer()
        };
    },
    warToJson: function(buffer) {
        // create buffer
        let result = {};
        let b = new W3Buffer(buffer);

        /**
         * Header
         */
        let w3eHeader = b.readChars(4); // W3E!
        let version = b.readInt(); // 0B 00 00 00
        let tileset = b.readChars(1); // tileset
        let customtileset = (b.readInt() === 1);

        result.tileset = tileset;
        result.customtileset = customtileset;

        /**
         * Tiles
         */
        let numTilePalettes = b.readInt();
        let tilePalettes = [];
        for (let i = 0; i < numTilePalettes; i++) {
            tilePalettes.push(b.readChars(4));
        }

        result.tilepalette = tilePalettes;

        /**
         * Cliffs
         */
        let numCliffTilePalettes = b.readInt();
        let cliffPalettes = [];
        for (let i = 0; i < numCliffTilePalettes; i++) {
            let cliffPalette = b.readChars(4);
            cliffPalettes.push(cliffPalette);
        }

        result.clifftilepalette = cliffPalettes;

        /**
         * map dimensions
         */
        let width = b.readInt() - 1;
        let height = b.readInt() - 1;
        result.map = { width: width, height: height };

        let offsetX = b.readFloat();
        let offsetY = b.readFloat();
        result.map.offset = { x: offsetX, y: offsetY };

         /*
         * map tiles
         */
        result.tiles = [];
        for (let h = 0; h < height + 1; h++) {
            let currRow = [];

            for (let w = 0; w < width + 1; w++) {
               // get the bytes from the buffer
               let groundHeight = b.readShort();
               let waterHeightAndBoundary = b.readShort();
               let flagsAndGroundTexture = b.readByte();
               let groundAndCliffVariation = b.readByte();
               let cliffTextureAndLayerHeight = b.readByte();

               // parse out different bits
               let waterHeight = waterHeightAndBoundary & 32767;
               let boundaryFlag = (waterHeightAndBoundary & 0x4000) === 0x4000;
               let flags = flagsAndGroundTexture & 240;
               let groundTexture = flagsAndGroundTexture & 15;
               let groundVariation = groundAndCliffVariation & 248;
               let cliffVariation = groundAndCliffVariation & 7;
               let cliffTexture = cliffTextureAndLayerHeight & 240;
               let layerHeight = cliffTextureAndLayerHeight & 15;

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
                    layerHeight: layerHeight,

                    origCrap: {
                        groundHeight: groundHeight,
                        waterHeightAndBoundary: waterHeightAndBoundary,
                        flagsAndGroundTexture: flagsAndGroundTexture,
                        groundAndCliffVariation: groundAndCliffVariation,
                        cliffTextureAndLayerHeight: cliffTextureAndLayerHeight,
                    }
                });
            }
            result.tiles.push(currRow);
        }

        // tiles
        //[0, 0, 0, 0, 0, 0, 0]

        return {
            errors: [],
            json: result
        };
    }
};

module.exports = TerrainTranslator;
