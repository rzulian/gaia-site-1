<template>
  <div v-loading="!game">
    <div v-if="game && open" class="container text-center">
      <h1>Game {{game._id}}</h1>
      <p>{{game.options.nbPlayers}} players game</p>
      <p>Waiting on {{(game.options.nbPlayers - game.players.length) | pluralize('player')}}</p>
      <div v-loading="!players" class="mb-2">
        <div v-if="players">
          <p>
            Creator: {{players.find(pl => pl.id === game.creator).name}}
          </p>
          <p v-if="game.players.length > 0">
            Players: <br/>
            <span v-for="player in game.players">- {{players.find(pl => pl.id === player).name}} <br/></span>
          </p>
        </div>
      </div>
      <button class="btn btn-secondary" v-if="user && game.players.includes(user._id)" disabled>You already joined</button>
      <button class="btn btn-secondary" v-else @click="join">Join!</button>
    </div>
    <div v-else-if="game">
      <GameViewer :api="api" :gameId="gameId" :auth="user ? user._id : null" />
    </div>
  </div>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';
import { IGame } from '@lib/game';
import { IUser } from '@lib/user';
import api from '@/helpers/api';
import {Game as GameViewer} from '@gaia-project/viewer';

@Component<Game>({
  created() {
    $.get(`/api/game/${this.gameId}`).then(game => {
      this.game = game;

      if (this.open) {
        $.get(`/api/game/${this.gameId}/players`).then(players => {
          this.players = players;
        }, handleError);
      }
    }, handleError);
  },
  computed: {
    open() {
      return this.game.options.nbPlayers !== this.game.players.length;
    }
  },
  components: {
    GameViewer
  }
})
export default class Game extends Vue {
  game: IGame = null;
  api = api;
  players: Array<{id: string, name: string}> = null;
  
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