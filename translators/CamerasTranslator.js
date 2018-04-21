var BufferedHexFileWriter = require('../lib/BufferedHexFileWriter'),
    outBuffer,
    Path = require('path');

const CamerasTranslator = function(cameras) {
    outBuffer = new BufferedHexFileWriter();

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
        outBuffer.addFloat(camera.roll);
        outBuffer.addFloat(camera.fov); // in degrees
        outBuffer.addFloat(camera.farClipping);
        outBuffer.addFloat(100); // (?) unknown - usually set to 100

        // Camera name - must be null-terminated
        outBuffer.addString(camera.name);
        outBuffer.addNullTerminator();
    });

    return {
        write: function(outputPath) {
            const path = outputPath ? Path.join(outputPath, 'war3map.w3c') : 'war3map.w3c';
            outBuffer.writeFile(path);
        }
    };
};

module.exports = CamerasTranslator;
