import * as $ from 'jquery';
import { GameApi } from '@gaia-project/viewer';
import Engine from '@gaia-project/engine';

const api: GameApi = {
  async loadGame(gameId: string) {
    const data = await $.get(`${window.location.origin}/api/game/${gameId}/data`) as any;
    return Engine.fromData(data);
  },
  checkStatus(gameId: string) {
    return $.get(`${window.location.origin}/api/game/${gameId}/status`) as any;
  },
  async addMove(gameId: string, move: string) {
    const data = await $.post(`${window.location.origin}/api/game/${gameId}/move`,  {move}) as any;

    return Engine.fromData(data);
  },
  async replay(moves: string[]) {
    return new Engine(moves);
  }
};

export default api;
