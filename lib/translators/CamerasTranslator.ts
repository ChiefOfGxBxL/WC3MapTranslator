import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';

interface Camera {
    target: CameraTarget;
    offsetZ: number;
    rotation: number; // in degrees
    aoa: number; // angle of attack, in degrees
    distance: number;
    roll: number;
    fov: number; // field of view, in degrees
    farClipping: number;
    name: string;
}

interface CameraTarget {
    x: number;
    y: number;
}

export abstract class CamerasTranslator {

    public static jsonToWar(cameras: Camera[]) {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addInt(0); // file version
        outBufferToWar.addInt(cameras.length); // number of cameras

        /*
         * Body
         */
        cameras.forEach((camera) => {
            outBufferToWar.addFloat(camera.target.x);
            outBufferToWar.addFloat(camera.target.y);
            outBufferToWar.addFloat(camera.offsetZ);
            outBufferToWar.addFloat(camera.rotation || 0); // optional
            outBufferToWar.addFloat(camera.aoa);
            outBufferToWar.addFloat(camera.distance);
            outBufferToWar.addFloat(camera.roll || 0);
            outBufferToWar.addFloat(camera.fov); // in degrees
            outBufferToWar.addFloat(camera.farClipping);
            outBufferToWar.addFloat(100); // (?) unknown - usually set to 100

            // Camera name - must be null-terminated
            outBufferToWar.addString(camera.name);
            outBufferToWar.addNullTerminator();
        });

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer) {
        const result = [];
        const outBufferToJSON = new W3Buffer(buffer);

        const fileVersion = outBufferToJSON.readInt(), // File version
            numCameras = outBufferToJSON.readInt(); // # of cameras

        for (let i = 0; i < numCameras; i++) {
            const camera: Camera = {
                target: {
                    x: 0,
                    y: 0
                },
                offsetZ: 0,
                rotation: 0,
                aoa: 0,
                distance: 0,
                roll: 0,
                fov: 0,
                farClipping: 0,
                name: ''
            };

            camera.target.x = outBufferToJSON.readFloat();
            camera.target.y = outBufferToJSON.readFloat();
            camera.offsetZ = outBufferToJSON.readFloat();
            camera.rotation = outBufferToJSON.readFloat(); // in degrees
            camera.aoa = outBufferToJSON.readFloat(); // angle of attack, in degrees
            camera.distance = outBufferToJSON.readFloat();
            camera.roll = outBufferToJSON.readFloat();
            camera.fov = outBufferToJSON.readFloat(); // field of view, in degrees
            camera.farClipping = outBufferToJSON.readFloat();
            outBufferToJSON.readFloat(); // consume this unknown float field
            camera.name = outBufferToJSON.readString();

            result.push(camera);
        }

        return {
            errors: [],
            json: result
        };
    }
}
