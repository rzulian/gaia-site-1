<template>
  <div class="container account">
    <h1>Account</h1>
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Active games</h5>
        <v-loading :loading="loadingGames">
          <GameList v-if="activeGames.length > 0" :games="activeGames" :user="user._id" class="mb-2" />
          <p v-else>
            No active games. <router-link to="/new-game">Launch a new game</router-link>.
          </p> 
          <router-link :to="`/user/${encodeURIComponent(user.account.username)}`">See list of all your games</router-link>
        </v-loading>
      </div>
    </div>
    <div class="card mt-3">
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
            <label class="form-check-label form-text" for="signup-newsletter">Get newsletter, up to six emails per year.</label>
          </div>
          <div class="form-row align-items-center">
            <div class="col-auto">
              <div class="form-check">
                <input type="checkbox" name="game-notification" id="game-notification" class="form-check-input" v-model="gameNotification" @change="updateAccountDebounce">
                <label class="form-check-label form-text" for="game-notification">Receive an email when it's your turn after a delay of </label>
              </div>
            </div>
            <div class="col-auto">
              <select class="form-control form-control-sm" v-model="gameNotificationDelay" @change="gameNotification = true; updateAccountDebounce();">
                <option :value="10*60">10 minutes</option>
                <option :value="30*60">30 minutes</option>
                <option :value="2*3600">2 hours</option>
                <option :value="6*3600">6 hours</option>
                <option :value="12*3600">12 hours</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="card mt-3">
      <div class="card-body">
        <h5 class="card-title">Game Settings</h5>
        <form>
          <div class="form-check">
            <input type="checkbox" name="noFactionFill" id="noFactionFill" class="form-check-input" v-model="noFactionFill" @change="updateAccountDebounce">
            <label class="form-check-label form-text" for="noFactionFill">Planets keep their original color when being occupied</label>
          </div>
          <div class="form-check">
            <input type="checkbox" name="soundNotification" id="soundNotification" class="form-check-input" v-model="soundNotification" @change="updateAccountDebounce">
            <label class="form-check-label form-text" for="soundNotification">Play a sound when it's your turn in one of your games</label>
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
import get from 'lodash.get';
import $ from 'jquery';
import GameList from '../components/GameList.vue';

@Component<Account>({
  created() {
    $.get(`/api/user/${this.user._id}/games/active?count=5`).then(list => this.activeGames = list, handleError).always(() => this.loadingGames = false);
  },
  components: {
    GameList
  }
})
export default class Account extends Vue {
  activeGames: any[] = [];
  email: string = '';
  newsletter: boolean = false;
  loadingGames = true;
  noFactionFill :boolean = false;
  soundNotification: boolean = false;
  gameNotification: boolean = false;
  gameNotificationDelay: number = 30*60;

  constructor() {
    super();

    this.email = this.user.account.email;
    this.noFactionFill = !!get(this, 'user.settings.game.noFactionFill');
    this.soundNotification = !!get(this, 'user.settings.game.soundNotification');
    this.newsletter = !!get(this, 'user.settings.mailing.newsletter');
    this.gameNotification = !!get(this, 'user.settings.mailing.game.activated');
    this.gameNotificationDelay = get(this, 'user.settings.mailing.game.delay', 30*60);
    this.updateAccount.bind(this);
  }

  get user(): IUser {
    return this.$store.state.user;
  }

  updateAccount() {
    $.post('/api/account', {
      settings: {
        mailing: {
          newsletter: this.newsletter,
          game: {
            activated: this.gameNotification,
            delay: this.gameNotificationDelay
          }
        },
        game: {
          noFactionFill: this.noFactionFill,
          soundNotification: this.soundNotification
        }
      }
    }).then(
      data => this.$store.commit('updateUser', data),
      err => handleError(err)
    );
  }

  updateAccountDebounce = debounce(this.updateAccount, 800, {leading: true});
}
</script>
