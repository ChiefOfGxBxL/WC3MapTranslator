import { HexBuffer } from '../HexBuffer';
import { W3Buffer } from '../W3Buffer';
import { WarResult, JsonResult, angle, ITranslator } from '../CommonInterfaces';

interface Camera {
    target: CameraTarget;
    offsetZ: number;
    rotation?: angle;
    aoa: angle; // angle of attack
    distance: number;
    roll?: number;
    fov: angle; // field of view
    farClipping: number;
    nearClipping?: number;
    name: string;
    localPitch?: number;
    localYaw?: number;
    localRoll?: number;
}

interface CameraTarget {
    x: number;
    y: number;
}

export abstract class CamerasTranslator extends ITranslator {
    public static jsonToWar(cameras: Camera[]): WarResult {
        const outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        outBufferToWar.addInt(0); // file version

        /*
         * Body
         */
        outBufferToWar.addInt(cameras.length);
        for (const camera of cameras) {
            outBufferToWar.addFloat(camera.target.x);
            outBufferToWar.addFloat(camera.target.y);
            outBufferToWar.addFloat(camera.offsetZ);
            outBufferToWar.addFloat(camera.rotation || 0);
            outBufferToWar.addFloat(camera.aoa);
            outBufferToWar.addFloat(camera.distance);
            outBufferToWar.addFloat(camera.roll || 0);
            outBufferToWar.addFloat(camera.fov);
            outBufferToWar.addFloat(camera.farClipping);
            outBufferToWar.addFloat(camera.nearClipping || 100);
            outBufferToWar.addFloat(camera.localPitch || 0);
            outBufferToWar.addFloat(camera.localYaw || 0);
            outBufferToWar.addFloat(camera.localRoll || 0);
            outBufferToWar.addString(camera.name);
        }

        return {
            errors: [],
            buffer: outBufferToWar.getBuffer()
        };
    }

    public static warToJson(buffer: Buffer): JsonResult<Camera[]> {
        const result = [];
        const outBufferToJSON = new W3Buffer(buffer);

        outBufferToJSON.readInt(); // File version

        const numCameras = outBufferToJSON.readInt();
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
                nearClipping: 0,
                name: '',
                localPitch: 0,
                localYaw: 0,
                localRoll: 0
            };

            camera.target.x = outBufferToJSON.readFloat();
            camera.target.y = outBufferToJSON.readFloat();
            camera.offsetZ = outBufferToJSON.readFloat();
            camera.rotation = outBufferToJSON.readFloat();
            camera.aoa = outBufferToJSON.readFloat(); // angle of attack
            camera.distance = outBufferToJSON.readFloat();
            camera.roll = outBufferToJSON.readFloat();
            camera.fov = outBufferToJSON.readFloat(); // field of view
            camera.farClipping = outBufferToJSON.readFloat();
            camera.nearClipping = outBufferToJSON.readFloat();
            camera.localPitch = outBufferToJSON.readFloat();
            camera.localYaw = outBufferToJSON.readFloat();
            camera.localRoll = outBufferToJSON.readFloat();
            camera.name = outBufferToJSON.readString();

            result.push(camera);
        }

        return {
            errors: [],
            json: result
        };
    }
}
