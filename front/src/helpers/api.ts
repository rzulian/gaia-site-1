import * as $ from 'jquery';
import { GameApi } from '@gaia-project/viewer';
import Engine, { EngineOptions } from '@gaia-project/engine';
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
  async replay(moves: string[], options: EngineOptions) {
    return new Engine(moves, Object.assign({}, options, {noFedCheck: true}));
  },
  async saveNotes(gameId: string, notes: string) {
    await $.post(`${window.location.origin}/api/game/${gameId}/notes`, {notes});
  },
  async getNotes(gameId: string) {
    try {
      return await $.get(`${window.location.origin}/api/game/${gameId}/notes`);
    } catch (err) {
      // It's silly but if the notes are empty then you get an err with status 200, might as well
      // just ignore the error
      return '';
    }
  }
};

export default api;
