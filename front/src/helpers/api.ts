import * as $ from 'jquery';
import { GameApi } from '@gaia-project/viewer';
import Engine from '@gaia-project/engine';
import store from '../store';

const currentUserId = () => {
  return store.state.user ? store.state.user._id : null;
};

const api: GameApi = {
  async loadGame(gameId: string) {
    const data = await $.get(`${window.location.origin}/api/game/${gameId}/data`) as any;
    const engine = Engine.fromData(data);

    const isActive = engine.players.length > 0 && engine.playerToMove !== undefined && engine.player(engine.playerToMove).auth === currentUserId();
    store.commit(isActive ? "addActiveGame" : "removeActiveGame", gameId);

    return engine;
  },
  checkStatus(gameId: string) {
    return $.get(`${window.location.origin}/api/game/${gameId}/status`) as any;
  },
  async addMove(gameId: string, move: string) {
    const data = await $.post(`${window.location.origin}/api/game/${gameId}/move`,  {move}) as any;
    const engine = Engine.fromData(data);

    const isActive = engine.players.length > 0 && engine.playerToMove !== undefined && engine.player(engine.playerToMove).auth === currentUserId();
    store.commit(isActive ? "addActiveGame" : "removeActiveGame", gameId);

    return engine;
  },
  async replay(moves: string[]) {
    return new Engine(moves);
  }
};

export default api;
