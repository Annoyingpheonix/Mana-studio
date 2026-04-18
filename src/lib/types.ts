export type CommanderDamage = {
  sourcePlayerId: string;
  sourcePlayerName: string;
  damage: number;
};

export type Player = {
  id: string;
  name:string;
  life: number;
  commanderDamage: CommanderDamage[];
  poisonCounters: number;
};

export type GameEvent = {
  id: string;
  timestamp: string;
  description: string;
};

export type GameState = {
  players: Player[];
  history: GameEvent[];
};

export type DiceType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export type DiceRoll = {
  type: DiceType;
  value: number;
};
