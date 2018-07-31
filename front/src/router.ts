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
import ResetPassword from './views/ResetPassword.vue';
import ForgottenPassword from './views/ForgottenPassword.vue';
import store from './store';
import { handleError, handleInfo } from '@/utils';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/about',
      component: About,
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
      path: '/confirm',
      beforeEnter(to, from, next) {
        $.post('/api/account/confirm', {key: to.query.key, email: to.query.user}).then(
          ({user}) => {
            store.commit('updateUser', user);
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
      path: '/reset',
      component: ResetPassword,
      meta: {loggedOut: true}
    },
    {
      path: '/forgotten-password',
      component: ForgottenPassword
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
      ({user}) => store.commit('updateUser', user),
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
  if (mutation.type === 'updateUser') {
    guard(router.currentRoute, location => location ? router.push(location) : null);
  }
});
