let HexBuffer = require('../HexBuffer'),
    W3Buffer = require('../W3Buffer'),
    outBuffer;

const DoodadsTranslator = {
    jsonToWar: function(doodadsJson) {
        outBuffer = new HexBuffer();

        /*
         * Header
         */
        outBuffer.addString('W3do'); // file id
        outBuffer.addInt(8); // file version
        outBuffer.addInt(11); // subversion 0x0B
        outBuffer.addInt(doodadsJson.length); // num of trees

        /*
         * Body
         */
        doodadsJson.forEach(function(tree) {
            outBuffer.addString(tree.type);
            outBuffer.addInt(tree.variation || 0); // optional - default value 0
            outBuffer.addFloat(tree.position[0]);
            outBuffer.addFloat(tree.position[1]);
            outBuffer.addFloat(tree.position[2]);
            outBuffer.addFloat(tree.angle || 0); // optional - default value 0

            // Scale
            if(!tree.scale) tree.scale = [1, 1, 1];
            outBuffer.addFloat(tree.scale[0] || 1);
            outBuffer.addFloat(tree.scale[1] || 1);
            outBuffer.addFloat(tree.scale[2] || 1);

            // Tree flags
            /* | Visible | Solid | Flag value |
               |   no    |  no   |     0      |
               |  yes    |  no   |     1      |
               |  yes    |  yes  |     2      | */
            let treeFlag = 2; // default: normal tree
            if(!tree.flags) tree.flags = { visible: true, solid: true }; // defaults if no flags are specified
            if(!tree.flags.visible && !tree.flags.solid) treeFlag = 0;
            else if(tree.flags.visible && !tree.flags.solid) treeFlag = 1;
            else if(tree.flags.visible && tree.flags.solid) treeFlag = 2;
            // Note: invisible and solid is not an option
            outBuffer.addByte(treeFlag);

            outBuffer.addByte(tree.life || 100);
            outBuffer.addInt(0); // NOT SUPPORTED: random item table pointer: fixed to 0
            outBuffer.addInt(0); // NOT SUPPORTED: number of items dropped for item table
            outBuffer.addInt(tree.id);
        });

        /*
         * Footer
         */
        outBuffer.addInt(0); // special doodad format number, fixed at 0x00
        outBuffer.addInt(0); // NOT SUPPORTED: number of special doodads

        return {
            errors: [],
            buffer: outBuffer.getBuffer()
        };
    },
    warToJson: function(buffer) {
        let result = [],
            b = new W3Buffer(buffer);

        let fileId = b.readChars(4), // W3do for doodad file
            fileVersion = b.readInt(), // File version = 8
            subVersion = b.readInt(), // 0B 00 00 00
            numDoodads = b.readInt(); // # of doodads

        for(let i = 0; i < numDoodads; i++) {
            let doodad = {};

            doodad.type = b.readChars(4);
            doodad.variation = b.readInt();
            doodad.position = [ b.readFloat(), b.readFloat(), b.readFloat() ]; // X Y Z coords
            doodad.angle = b.readFloat(); // angle in radians
            doodad.scale = [ b.readFloat(), b.readFloat(), b.readFloat() ]; // X Y Z scaling

            let flags = b.readByte();
            doodad.flags = {
                // 0= invisible and non-solid tree
                // 1= visible but non-solid tree
                // 2= normal tree (visible and solid)
                visible: flags === 1 || flags === 2,
                solid: flags === 2
            };

            doodad.life = b.readByte(); // as a %

            // UNSUPPORTED: random item set drops when doodad is destroyed/killed
            // This section just consumes the bytes from the file
            let randomItemSetPtr = b.readInt(), // points to an item set defined in the map (rather than custom one defined below)
                numberOfItemSets = b.readInt(); // this should be 0 if randomItemSetPtr is >= 0

            for(let j = 0; j < numberOfItemSets; j++) {
                // Read the item set
                let numberOfItems = b.readInt();
                for(let k = 0; k < numberOfItems; k++) {
                    b.readChars(4); // Item ID
                    b.readInt(); // % chance to drop
                }
            }

            doodad.id = b.readInt();

            result.push(doodad);
        }

        // UNSUPPORTED: Special doodads
        b.readInt(); // special doodad format version set to '0'
        let numSpecialDoodads = b.readInt();
        for(let i = 0; i < numSpecialDoodads; i++) {
            b.readChars(4); // doodad ID
            b.readInt();
            b.readInt();
            b.readInt();
        }

        return {
            errors: [],
            json: result
        };
    }
};

module.exports = DoodadsTranslator;
