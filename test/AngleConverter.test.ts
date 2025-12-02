import assert from 'node:assert';
import { suite, test } from 'node:test';
import { deg2Rad, rad2Deg } from '../src/AngleConverter';

suite('AngleConverter', () => {

    test('should convert degrees to radians', () => {
        const angleInDegrees = 90;
        const convertedToRadians = deg2Rad(angleInDegrees);
        assert.equal(convertedToRadians, Math.PI / 2);
    });

    test('should convert radians to degrees', () => {
        const angleInRadians = Math.PI;
        const convertedToDegrees = rad2Deg(angleInRadians);
        assert.equal(convertedToDegrees, 180);
    });

});
