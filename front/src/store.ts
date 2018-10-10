import Vue from 'vue';
import Vuex from 'vuex';
import {gaiaViewer} from '@gaia-project/viewer';
import { User } from '@/types';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    gaiaViewer
  },
  state: {
    user: null as User | null,
    sessionID: null as string | null,
    userLoaded: false as boolean,
    error: null as string | null,
    info: null as string | null,
    errorIssued: null as Date | null,
    infoIssued: null as Date | null,
    activeGames: [] as string[]
  },
  mutations: {
    updateUser: (state, data: {user: User, sessionID: string} | null ) => {
      if (data) {
        state.user = data.user;
        state.sessionID = data.sessionID;
      } else {
        state.user = null;
        state.sessionID = null;
        state.activeGames = [];
      }
      state.userLoaded = true;
    },
    /** Clear error if it has been here too long */
    autoClearError(state) {
      if (state.error && (Date.now() - state.errorIssued.getTime()) > 40 * 1000) {
        state.error = state.errorIssued = null;
      }
    },
    error: (state, error: string) => {
      state.error = error;
      state.errorIssued = new Date();

      setTimeout(() => store.commit('autoClearError'), 45 * 1000);
    },
    info: (state, info: string) => {
      state.info = info; state.infoIssued = new Date();
      state.error = state.errorIssued = null;
    },
    removeError: state => state.error = state.errorIssued = null,
    removeInfo: state => state.info = state.infoIssued = null,
    activeGames: (state, games: string[]) => state.activeGames = games,
    removeActiveGame: (state, gameId: string) => {
      if (state.activeGames.indexOf(gameId) === -1) {
        return;
      }
      state.activeGames = state.activeGames.filter(game => game !== gameId);
    },
    addActiveGame: (state, gameId: string) => {
      if (state.activeGames.indexOf(gameId) !== -1) {
        return;
      }
      state.activeGames = [...state.activeGames, gameId];
    }
  },
  actions: {
    logoClick() {}
  },
  getters: {
    admin: state => !!state.user && state.user.authority === 'admin',
    staleError: state => state.errorIssued && (Date.now() - state.errorIssued.getTime()) > 1000,
    staleInfo: state => state.infoIssued && (Date.now() - state.infoIssued.getTime()) > 1000,
  }
});

export default store;
