<template>
  <div v-loading="!game">
    <div v-if="game && game.options.nbPlayers !== game.players.length" class="container text-center">
      <h1>Game {{game._id}}</h1>
      <p>{{game.options.nbPlayers}} players game</p>
      <p>Waiting on {{(game.options.nbPlayers - game.players.length) | pluralize('player')}}</p>
      <button class="btn btn-secondary" v-if="user && game.players.includes(user._id)" disabled>You already joined</button>
      <button class="btn btn-secondary" v-else @click="join">Join!</button>
    </div>
    <div v-else-if="game">
      <GameViewer />
    </div>
  </div>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';
import { IGame } from '@lib/game';
import { IUser } from '@lib/user';
import {Game as GameViewer} from '@gaia-project/viewer';

@Component<Game>({
  created() {
    $.get(`/api/game/${this.gameId}`).then(game => this.game = game, handleError);
  },
  components: {
    GameViewer
  }
})
export default class Game extends Vue {
  game: IGame = null;
  
  constructor() {
    super();
  }

  get user(): IUser {
    return this.$store.state.user;
  }

  get gameId(): string {
    return this.$route.params.gameId;
  }

  join() {
    if (!this.user) {
      this.$router.push({path: '/login', query: {redirect: this.$route.fullPath}});
      return;
    }

    $.post(`/api/game/${this.gameId}/join`).then(game => this.game = game, handleError);
  }
}

</script>