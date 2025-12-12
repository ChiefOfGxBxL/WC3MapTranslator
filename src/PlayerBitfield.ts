export type PlayerArray = Player[];

export enum Player {
  Red = 'red',
  Blue = 'blue',
  Teal = 'teal',
  Purple = 'purple',
  Yellow = 'yellow',
  Orange = 'orange',
  Green = 'green',
  Pink = 'pink',
  Gray = 'gray',
  LightBlue = 'lightblue',
  DarkGreen = 'darkgreen',
  Brown = 'brown',
  Maroon = 'maroon',
  Navy = 'navy',
  Turquoise = 'turquoise',
  Violet = 'violet',
  Wheat = 'wheat',
  Peach = 'peach',
  Mint = 'mint',
  Lavender = 'lavender',
  Coal = 'coal',
  Snow = 'snow',
  Emerald = 'emerald',
  Peanut = 'peanut'

  // TODO: neutral hostile, passive, victim, 4th one
}

const AllPlayerValues = Object.values(Player);

export function fromPlayerBitfield (num: number): PlayerArray {
  const players: PlayerArray = [];

  if (num === 0) return players;

  // Bit "x" means set for player "x"
  for (const [idx, playerValue] of AllPlayerValues.entries()) {
    if (num & (0b1 << idx)) players.push(playerValue as Player);
  }

  return players;
}

export function toPlayerBitfield (playerArray: PlayerArray): number {
  let num = 0;

  for (const [idx, playerValue] of AllPlayerValues.entries()) {
    if (playerArray.includes(playerValue as Player)) num |= (0b1 << idx);
  }

  return num;
}
