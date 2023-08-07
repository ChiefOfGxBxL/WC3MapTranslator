import assert from 'assert';
import { deg2Rad, rad2Deg } from '../src/AngleConverter';

describe('AngleConverter', () => {

    it('should convert degrees to radians', () => {
        const angleInDegrees = 90;
        const convertedToRadians = deg2Rad(angleInDegrees);
        assert.equal(convertedToRadians, Math.PI / 2);
    });

    it('should convert radians to degrees', () => {
        const angleInRadians = Math.PI;
        const convertedToDegrees = rad2Deg(angleInRadians);
        assert.equal(convertedToDegrees, 180);
    });

});
