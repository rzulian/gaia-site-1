import * as $ from 'jquery';
import { GameApi } from '@gaia-project/viewer';

const api: GameApi = {
  loadGame(gameId: string) {
    return $.get(`${window.location.origin}/api/game/${gameId}/data`) as any;
  },
  checkStatus(gameId: string) {
    return $.get(`${window.location.origin}/api/game/${gameId}/status`) as any;
  },
  addMove(gameId: string, move: string) {
    return $.post(`${window.location.origin}/api/game/${gameId}/move`,  {move}) as any;
  },
  replay(moves: string[]) {
    // Todo: new Engine(moves)
    throw new Error("not implemented");
  }
};

export default api;
