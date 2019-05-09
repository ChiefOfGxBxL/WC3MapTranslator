let HexBuffer = require('../HexBuffer'),
    W3Buffer = require('../W3Buffer');

const TerrainTranslator = {
    jsonToWar: function(terrainJson) {
        let outBuffer = new HexBuffer();
        let currBuffer = '';

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

        // Unsupported
        // map.offset is not implemented yet.. so we hardcode
        //outBuffer.addByte(0x00);outBuffer.addByte(0x00);outBuffer.addByte(0x80);outBuffer.addByte(0xc5);
        //outBuffer.addByte(0x00);outBuffer.addByte(0x00);outBuffer.addByte(0x80);outBuffer.addByte(0xc5);
        outBuffer.addFloat(terrainJson.map.offset.x);
        outBuffer.addFloat(terrainJson.map.offset.y);


        /*
         * Tile points
         */
        for(let i = terrainJson.tiles.length - 1; i >= 0; i--) {
            // write each for of tiles
            let testVar = 0;
            terrainJson.tiles[i].forEach(function(tile) {
                /*outBuffer.addByte(tile[0]);            // height
                outBuffer.addShort(tile[1]);            // water
                //outBuffer.addByte(tile[2]+''+tile[3]);  // flags/tile
                //outBuffer.addByte(0x60);
                outBuffer.addShort(tile[2]);  // flags/tile
                /*if (i === 0) {
                    console.log('writing');
                    console.log('0x' + tile[3].toString(16));
                }*/
                /*outBuffer.addByte(tile[3]);  // flags/tile
                outBuffer.addByte(tile[4]);             // texture details
                outBuffer.addByte(tile[5]+''+tile[6]);  // cliff tile/layer*/

                for (let t = 0; t < 7; t++) {
                    if (i <= 0 /*|| (i === 1 && testVar === 0)*/) { // why does this break when adding in next row?
                        outBuffer.addByte(tile[t]);

                        /*console.log('added ' + tile[t]);
                        console.log('0x' + tile[t].toString(16));*/
                    }
                }
                testVar++;
            });
        }

        return {
            errors: [],
            buffer: currBuffer
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
            cliffPalettes.push(cliffPalette);
        }

        result.numCliffTilePalettes = numCliffTilePalettes; // TODO: remove
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
               let tile = [];

               let tileHeight = b.readByte();
               let tileWater = b.readByte();
               let tileFlags = b.readByte();
               let tileTile = b.readByte();
               let tileTexture = b.readByte();
               let tileCliffTile = b.readByte();
               let tileCliffLayer = b.readByte();

                // parse a tile
                tile.push(tileHeight); // height
                tile.push(tileWater); // water
                tile.push(tileFlags); // flags
                tile.push(tileTile); // tile
                tile.push(tileTexture); // texture details
                tile.push(tileCliffTile); // cliff tile
                tile.push(tileCliffLayer); // cliff layer

                // add tile
                currRow.push(tile);
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
