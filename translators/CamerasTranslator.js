let HexBuffer = require('../lib/HexBuffer'),
    W3Buffer = require('../lib/W3Buffer'),
    outBuffer;

const CamerasTranslator = {
    jsonToWar: function(cameras) {
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
    },
    warToJson: function(buffer) {
        var result = [],
            b = new W3Buffer(buffer);

        var fileVersion = b.readInt(); // File version
        var numCameras = b.readInt(); // # of cameras

        for(var i = 0; i < numCameras; i++) {
            let camera = { target: {} };

            camera.target.x = b.readFloat();
            camera.target.y = b.readFloat();
            camera.offsetZ = b.readFloat();
            camera.rotation = b.readFloat(); // in degrees
            camera.aoa = b.readFloat(); // angle of attack, in degrees
            camera.distance = b.readFloat();
            camera.roll = b.readFloat();
            camera.fov = b.readFloat(); // field of view, in degrees
            camera.farClipping = b.readFloat();
            b.readFloat(); // consume this unknown float field
            camera.name = b.readString();

            result.push(camera);
        }

        return {
            errors: [],
            json: result
        };
    }
};

module.exports = CamerasTranslator;
