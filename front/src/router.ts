import $ from 'jquery';
import Vue from 'vue';
import Router, { Route, Location } from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import NotFoundComponent from './views/NotFound.vue';
import Signup from './views/Signup.vue';
import Login from './views/Login.vue';
import Account from './views/Account.vue';
import Admin from './views/Admin.vue';
import NewGame from './views/NewGame.vue';
import Games from './views/Games.vue';
import Game from './views/Game.vue';
import ResetPassword from './views/ResetPassword.vue';
import ForgottenPassword from './views/ForgottenPassword.vue';
import PrivacyPolicy from './views/PrivacyPolicy.vue';
import User from './views/User.vue';
import store from './store';
import { handleError, handleInfo } from '@/utils';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/about',
      component: About
    },
    {
      path: '/privacy-policy',
      component: PrivacyPolicy
    },
    {
      path: '/signup',
      component: Signup,
      meta: {loggedOut: true},
    },
    {
      path: '/login',
      component: Login,
      meta: {loggedOut: true},
    },
    {
      path: '/account',
      component: Account,
      meta: {loggedIn: true}
    },
    {
      path: '/admin',
      component: Admin,
      meta: {admin: true},
    },
    {
      path: '/new-game',
      component: NewGame,
      meta: {loggedIn: true}
    },
    {
      path: '/games',
      component: Games
    },
    {
      path: '/confirm',
      beforeEnter(to, from, next) {
        $.post('/api/account/confirm', {key: to.query.key, email: to.query.user}).then(
          (data) => {
            store.commit('updateUser', data);
            handleInfo('Your account has been confirmed');
            next('/account');
          },
          err => {
            handleError(err);
            next('/');
          }
        );
      }
    },
    {
      path: '/next-game',
      beforeEnter(to, from, next) {
        if (store.state.activeGames.length > 0) {
          const activeGames = store.state.activeGames;
          const currentIdx = activeGames.indexOf(from.params.gameId);
          const gameId = activeGames[(currentIdx + 1) % activeGames.length];

          next('/game/' + gameId);
        } else {
          next('/account');
        }
      },
      meta: {loggedIn: true}
    },
    {
      path: '/reset',
      component: ResetPassword,
      meta: {loggedOut: true}
    },
    {
      path: '/forgotten-password',
      component: ForgottenPassword,
      meta: {loggedOut: true}
    },
    {
      path: '/game/:gameId',
      component: Game
    },
    {
      path: '/user/:userName',
      component: User
    },
    {
      path: '*',
      component: NotFoundComponent,
    },
  ],
});

export default router;

let routing = false;

router.beforeEach(async (to, from, next) => {
  if (!store.state.userLoaded) {
    routing = true;
    await $.get('/api/account').then(
      (data) => store.commit('updateUser', data),
      err => handleError(err)
    );
    routing = false;
  }

  if (store.getters.staleError) {
    store.commit('removeError');
  }
  if (store.getters.staleInfo) {
    store.commit('removeInfo');
  }

  guard(to, next);
});

function guard(to: Route, next: (location?: string | Location) => void): void {
  if (to.meta.loggedOut && store.state.user) {
    next(to.query.redirect || '/account');
  } else if (to.meta.loggedIn && !store.state.user) {
    next({path: '/login', query: {redirect: to.fullPath}});
  } else if (to.meta.admin && !store.getters.admin) {
    next('/');
  } else {
    next();
  }
}

store.subscribe((mutation, state) => {
  if (routing) {
    return;
  }
  /* Check if the user is still allowed to be on current page */
  if (mutation.type === 'updateUser') {
    guard(router.currentRoute, location => location ? router.push(location) : null);
  }
});
