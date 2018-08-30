import Vue from 'vue';
import Vuex from 'vuex';
import { IAbstractUser } from '../../lib/user';
import {gaiaViewer} from '@gaia-project/viewer';
import $ from 'jquery';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    gaiaViewer
  },
  state: {
    user: null as IAbstractUser | null,
    sessionID: null as string | null,
    userLoaded: false as boolean,
    error: null as string | null,
    info: null as string | null,
    errorIssued: null as Date | null,
    infoIssued: null as Date | null
  },
  mutations: {
    updateUser: (state, data: {user: IAbstractUser, sessionID: string} | null ) => {
      if (data) {
        state.user = data.user;
        state.sessionID = data.sessionID;
      } else {
        state.user = null;
        state.sessionID = null;
      }
      state.userLoaded = true;
    },
    error: (state, error: string) => { state.error = error; state.errorIssued = new Date(); },
    info: (state, info: string) => {
      state.info = info; state.infoIssued = new Date();
      state.error = state.errorIssued = null;
    },
    removeError: state => state.error = state.errorIssued = null,
    removeInfo: state => state.info = state.infoIssued = null
  },
  actions: {

  },
  getters: {
    admin: state => !!state.user && state.user.authority === 'admin',
    staleError: state => state.errorIssued && (Date.now() - state.errorIssued.getTime()) > 1000,
    staleInfo: state => state.infoIssued && (Date.now() - state.infoIssued.getTime()) > 1000,
  }
});
