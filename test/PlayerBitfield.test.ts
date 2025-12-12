import assert from 'node:assert';
import { suite, test } from 'node:test';
import { fromPlayerBitfield, toPlayerBitfield, PlayerArray, Player } from '../src/PlayerBitfield';

suite('PlayerBitfield', () => {
    test('should convert to bitfield', () => {
        const tests: { input: PlayerArray; expectedOutput: number }[] = [
            { input: [], expectedOutput: 0 },
            { input: [Player.Red, Player.Teal], expectedOutput: 5 },
            { input: [Player.Red, Player.Blue, Player.Teal], expectedOutput: 7 }
        ];

        for (const { input, expectedOutput } of tests) {
            assert.equal(JSON.stringify(toPlayerBitfield(input)), JSON.stringify(expectedOutput));
        }
    });

    test('should convert from bitfield', () => {
        const tests: { input: number; expectedOutput: PlayerArray }[] = [
            { input: 0, expectedOutput: [] },
            { input: 5, expectedOutput: [Player.Red, Player.Teal] },
            { input: 7, expectedOutput: [Player.Red, Player.Blue, Player.Teal] }
        ];

        for (const { input, expectedOutput } of tests) {
            assert.equal(JSON.stringify(fromPlayerBitfield(input)), JSON.stringify(expectedOutput));
        }
    });
});
