import Engine from "@gaia-project/engine";

export interface IAbstractGame<T= string> {
  /** Ids of the players in the website */
  players: T[];
  creator: T;
  currentPlayer: T;
  /** Game data */
  data: Engine;

  options: {
    randomPlayerOrder: boolean;
    nbPlayers: number;
    unlisted: boolean;
  };

  active: boolean;

  updatedAt: Date;
  createdAt: Date;
}

export interface IGame extends IAbstractGame {
  _id: string;
}