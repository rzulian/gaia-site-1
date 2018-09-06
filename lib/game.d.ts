import Engine from "@gaia-project/engine";

export interface IAbstractGame<T= string> {
  /** Ids of the players in the website */
  players: T[];
  creator: T;
  currentPlayer: T;
  nextMoveDeadline: Date;
  /** Game data */
  data: Engine;

  options: {
    randomPlayerOrder: boolean;
    nbPlayers: number;
    unlisted: boolean;
    timePerMove: number;
    timePerGame: number;
  };

  remainingTime: number[];

  active: boolean;

  lastMove: Date;
  updatedAt: Date;
  createdAt: Date;
}

export interface IGame extends IAbstractGame {
  _id: string;
}