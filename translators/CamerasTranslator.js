let HexBuffer = require('../lib/HexBuffer'),
    outBuffer;

const CamerasTranslator = function(cameras) {
    outBuffer = new HexBuffer();

    /*
     * Header
     */
    outBuffer.addInt(0); // file version
    outBuffer.addInt(cameras.length); // number of cameras

    /*
     * Body
     */
    cameras.forEach(function(camera) {
        outBuffer.addFloat(camera.target.x);
        outBuffer.addFloat(camera.target.y);
        outBuffer.addFloat(camera.offsetZ);
        outBuffer.addFloat(camera.rotation || 0); // optional
        outBuffer.addFloat(camera.aoa);
        outBuffer.addFloat(camera.distance);
        outBuffer.addFloat(camera.roll || 0);
        outBuffer.addFloat(camera.fov); // in degrees
        outBuffer.addFloat(camera.farClipping);
        outBuffer.addFloat(100); // (?) unknown - usually set to 100

        // Camera name - must be null-terminated
        outBuffer.addString(camera.name);
        outBuffer.addNullTerminator();
    });

    return {
        errors: [],
        buffer: outBuffer.getBuffer()
    };
};

module.exports = CamerasTranslator;
