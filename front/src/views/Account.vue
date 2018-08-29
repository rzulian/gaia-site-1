<template>
  <div class="container account">
    <h1>Account</h1>
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Active games</h5>
        <div v-loading="loadingGames">
          <p v-if="activeGames.length > 0">
            <ul class="list-group">
              <router-link :to="`/game/${game._id}`" v-for="game in activeGames" :key="game._id" class="list-group-item list-group-item-action">{{game._id}} - R{{game.data.round}}
               <span v-if="user._id === game.currentPlayer" class="list-group-item-action" style="background: lightgreen; color:black"> Your turn! </span>
              </router-link>
            </ul>
          </p>
          <p v-else>
            No active games. <router-link to="/new-game">Launch a new game</router-link>.
          </p> 
          <router-link :to="`/user/${encodeURIComponent(user.account.username)}`">See list of all your games</router-link>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Settings</h5>
        <p v-if="user.account.username">Username: <strong>{{user.account.username}}</strong></p>
        <form>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" class="form-control" id="email" name="email" placeholder="Email address" v-model="email" disabled required>
            <small v-if="user.security.confirmed">Your account is confirmed</small>
            <small v-else>Your email is not confirmed.</small>
          </div>
          <div class="form-check">
            <input type="checkbox" name="newsletter" id="signup-newsletter" class="form-check-input" v-model="newsletter" @change="updateAccountDebounce">
            <label class="form-check-label form-text" for="signup-newsletter">Receive news by email, at most one email every two months</label>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IUser } from '@lib/user';
import { handleError } from '@/utils';
import debounce from 'lodash.debounce';
import $ from 'jquery';

@Component<Account>({
  created() {
    $.get(`/api/user/${this.user._id}/games/active?count=5`).then(list => this.activeGames = list, handleError).always(() => this.loadingGames = false);
  }
})
export default class Account extends Vue {
  activeGames: any[] = [];
  email: string = '';
  newsletter: boolean = false;
  loadingGames = true;

  constructor() {
    super();

    this.email = this.user.account.email;
    this.newsletter = !!this.user.account.newsletter;
    this.updateAccount.bind(this);
  }

  get user(): IUser {
    return this.$store.state.user;
  }

  updateAccount() {
    console.log(this, this.newsletter);
    $.post('/api/account', {
      account: {
        newsletter: this.newsletter
      }
    }).then(
      ({user}) => this.$store.commit('updateUser', user),
      err => handleError(err)
    );
  }

  updateAccountDebounce = debounce(this.updateAccount, 800, {leading: true});
}
</script>
