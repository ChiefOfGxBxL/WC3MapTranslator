let HexBuffer = require('../HexBuffer'),
    W3Buffer = require('../W3Buffer'),
    outBuffer;

const TerrainTranslator = {
    jsonToWar: function(terrainJson) {
        outBuffer = new HexBuffer();

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
        outBuffer.addInt(terrainJson.map.width);
        outBuffer.addInt(terrainJson.map.height);

        // Unsupported
        // map.offset is not implemented yet.. so we hardcode
        outBuffer.addByte(0x00);outBuffer.addByte(0x00);outBuffer.addByte(0x80);outBuffer.addByte(0xc5);
        outBuffer.addByte(0x00);outBuffer.addByte(0x00);outBuffer.addByte(0x80);outBuffer.addByte(0xc5);
        //outBuffer.addFloat(terrainJson.map.offset.x);
        //outBuffer.addFloat(terrainJson.map.offset.y);


        /*
         * Tile points
         */
        for(let i = terrainJson.tiles.length - 1; i >= 0; i--) {
            // write each for of tiles
            terrainJson.tiles[i].forEach(function(tile) {
                outBuffer.addShort(tile[0]);            // height
                outBuffer.addShort(tile[1]);            // water
                outBuffer.addByte(tile[2]+''+tile[3]);  // flags/tile
                outBuffer.addByte(tile[4]);             // texture details
                outBuffer.addByte(tile[5]+''+tile[6]);  // cliff tile/layer
            });
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

        result.numTilePalettes = numTilePalettes; // TODO: remove
        result.tilepalette = tilePalettes;

        /**
         * Cliffs
         */
        let numCliffTilePalettes = b.readInt();
        let cliffPalettes = [];
        for (let i = 0; i < numCliffTilePalettes; i++) {
            let cliffPalette = b.readChars(4);
            console.log(cliffPalette);
            cliffPalettes.push(cliffPalette);
        }

        result.numCliffTilePalettes = numCliffTilePalettes; // TODO: remove
        result.clifftilepalette = cliffPalettes;

         /*
         * TODO
         */
        let width = 0;
        let height = 0;
        result.map = { width: width, height: height };

        result.clifftilepalette = [''];
        result.tiles = [[]];

        // tiles
        //[0, 0, 0, 0, 0, 0, 0]

        return {
            errors: [],
            json: result
        };
    }
};

module.exports = TerrainTranslator;
