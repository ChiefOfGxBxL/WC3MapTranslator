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

export class CamerasTranslator {

    private _outBufferToWar: HexBuffer;
    private _outBufferToJSON: W3Buffer;

    constructor() { }

    public jsonToWar(cameras) {
        this._outBufferToWar = new HexBuffer();

        /*
         * Header
         */
        this._outBufferToWar.addInt(0); // file version
        this._outBufferToWar.addInt(cameras.length); // number of cameras

        /*
         * Body
         */
        cameras.forEach((camera) => {
            this._outBufferToWar.addFloat(camera.target.x);
            this._outBufferToWar.addFloat(camera.target.y);
            this._outBufferToWar.addFloat(camera.offsetZ);
            this._outBufferToWar.addFloat(camera.rotation || 0); // optional
            this._outBufferToWar.addFloat(camera.aoa);
            this._outBufferToWar.addFloat(camera.distance);
            this._outBufferToWar.addFloat(camera.roll || 0);
            this._outBufferToWar.addFloat(camera.fov); // in degrees
            this._outBufferToWar.addFloat(camera.farClipping);
            this._outBufferToWar.addFloat(100); // (?) unknown - usually set to 100

            // Camera name - must be null-terminated
            this._outBufferToWar.addString(camera.name);
            this._outBufferToWar.addNullTerminator();
        });

        return {
            errors: [],
            buffer: this._outBufferToWar.getBuffer()
        };
    }

    public warToJson(buffer) {
        const result = [];
        this._outBufferToJSON = new W3Buffer(buffer);

        const fileVersion = this._outBufferToJSON.readInt(), // File version
            numCameras = this._outBufferToJSON.readInt(); // # of cameras

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

            camera.target.x = this._outBufferToJSON.readFloat();
            camera.target.y = this._outBufferToJSON.readFloat();
            camera.offsetZ = this._outBufferToJSON.readFloat();
            camera.rotation = this._outBufferToJSON.readFloat(); // in degrees
            camera.aoa = this._outBufferToJSON.readFloat(); // angle of attack, in degrees
            camera.distance = this._outBufferToJSON.readFloat();
            camera.roll = this._outBufferToJSON.readFloat();
            camera.fov = this._outBufferToJSON.readFloat(); // field of view, in degrees
            camera.farClipping = this._outBufferToJSON.readFloat();
            this._outBufferToJSON.readFloat(); // consume this unknown float field
            camera.name = this._outBufferToJSON.readString();

            result.push(camera);
        }

        return {
            errors: [],
            json: result
        };
    }
}
