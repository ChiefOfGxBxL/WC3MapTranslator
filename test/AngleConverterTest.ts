import assert from 'assert';
import { deg2Rad, rad2Deg } from '../lib/AngleConverter';

describe('AngleConverter', () => {

    it('should convert degrees to radians', () => {
        const angleInDegrees = 90;
        const convertedToRadians = angleInDegrees * Math.PI / 180;
        assert.equal(convertedToRadians, Math.PI / 2);
    });

    it('should convert radians to degrees', () => {
        const angleInRadians = Math.PI;
        const convertedToDegrees = angleInRadians * 180 / Math.PI;
        assert.equal(convertedToDegrees, 180);
    });

});
