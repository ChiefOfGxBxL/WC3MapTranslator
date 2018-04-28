let HexBuffer = require('../lib/HexBuffer'),
    outBuffer;

const DoodadsTranslator = function(doodadsJson) {
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
};

module.exports = DoodadsTranslator;
