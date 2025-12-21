/**
 * @type angle - An angle is measured in degrees, 0 <= angle < 360
 */
export type angle = number;

export abstract class ITranslator {
    abstract jsonToWar(...args: any[]): WarResult;
    abstract warToJson(...args: any[]): JsonResult;
    // abstract jsonToWar (type: string, data: any): WarResult;
    // abstract warToJson (type: string, buffer: Buffer, bufferSkin?: Buffer): JsonResult;
}

export interface WarResult {
    buffer: Buffer;
    bufferSkin?: Buffer;
}

export interface JsonResult<T = object> {
    json: T;
}

export class VersionError extends Error {
    constructor(public expectedVersion: number, public foundVersion: number) {
        super('WC3MapTranslator cannot currently parse this version of a war3map file');
    }
}

export function expectVersion(expected: number, actual: number) {
    if (actual !== expected) throw new VersionError(expected, actual);
}
