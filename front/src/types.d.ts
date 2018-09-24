import {IAbstractUser} from '@lib/user';
import {IAbstractGame} from '@lib/game';

export interface User extends IAbstractUser {
  _id: string;
}

export interface Game extends IAbstractGame {
  _id: string;
}