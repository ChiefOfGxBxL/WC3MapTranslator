import assert from 'node:assert';
import { suite, test } from 'node:test';
import { fromPlayerBitfield, toPlayerBitfield, PlayerArray, Player } from '../src/PlayerBitfield';

suite('PlayerBitfield', () => {
    test('should convert to bitfield', () => {
        const tests: { playerArray: PlayerArray; availablePlayers?: number[]; expectedOutput: number }[] = [
            {
                playerArray: [],
                expectedOutput: 0
            },
            {
                playerArray: [Player.Red, Player.Teal],
                expectedOutput: 5
            },
            {
                playerArray: [Player.Red, Player.Blue, Player.Teal],
                expectedOutput: 7
            },
            {
                playerArray: [
                    Player.Red, Player.Blue, Player.Yellow,
                    Player.Orange, Player.Green, Player.Pink,
                    Player.Gray, Player.LightBlue, Player.DarkGreen,
                    Player.Brown, Player.Maroon, Player.Navy,
                    Player.Turquoise, Player.Violet, Player.Wheat,
                    Player.Peach, Player.Mint, Player.Lavender,
                    Player.Coal, Player.Snow, Player.Emerald,
                    Player.Peanut
                ],
                availablePlayers: [0, 1, 2, 3], // only Red, Blue, Teal, and Purple exist in the map
                expectedOutput: 3
            }
        ];

        for (const { playerArray, availablePlayers, expectedOutput } of tests) {
            assert.equal(JSON.stringify(toPlayerBitfield(playerArray, availablePlayers)), JSON.stringify(expectedOutput));
        }
    });

    test('should convert from bitfield', () => {
        const tests: { num: number; availablePlayerNums?: number[]; expectedOutput: PlayerArray }[] = [
            {
                num: 0,
                expectedOutput: []
            },
            {
                num: 5,
                expectedOutput: [Player.Red, Player.Teal]
            },
            {
                num: 7,
                expectedOutput: [Player.Red, Player.Blue, Player.Teal]
            },
            {
                num: 16777203,
                availablePlayerNums: [0, 1, 2, 3],
                expectedOutput: [Player.Red, Player.Blue]
            }
        ];

        for (const { num, availablePlayerNums, expectedOutput } of tests) {
            assert.equal(JSON.stringify(fromPlayerBitfield(num, availablePlayerNums)), JSON.stringify(expectedOutput));
        }
    });
});
