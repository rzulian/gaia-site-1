<template>
  <v-loading :loading="!game">
    <div v-if="game && open" class="col-md-6 offset-md-3">
      <h1 class="mb-3">Open game</h1>
      <p>Game <i>{{game._id}}</i>, created by <v-loading :loading="!players" class="d-inline">{{players.find(pl => pl.id === game.creator).name}}</v-loading></p>
      
      <span>{{timePerGame}} per player, with an additional {{timePerMove}} per move</span><br>

      
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="random-player-order" v-model="game.options.randomPlayerOrder" disabled>
        <label class="form-check-label" for="random-player-order">
          Randomize player order
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="advancedRules" v-model="game.options.advancedRules" disabled>
        <label class="form-check-label" for="advancedRules">
          Last player rotates sectors before faction selection
        </label>
      </div>
    
      <v-loading :loading="!players" class="my-3">
        <div v-if="players">
          <p v-if="game.players.length > 0">
            Players: <br/>
            <span v-for="player in game.players" :key="player">- {{players.find(pl => pl.id === player).name}} <br/></span>
          </p>
          <p>Waiting on {{(game.options.nbPlayers - game.players.length) | pluralize('player')}}</p>
        </div>
      </v-loading>
      <button class="btn btn-secondary" v-if="user && game.players.includes(user._id)" disabled>You already joined</button>
      <button class="btn btn-secondary" v-else @click="join">Join!</button>
    </div>
    <div v-else-if="game">
      <GameViewer :api="api" :gameId="gameId" :auth="user ? user._id : null" ref="viewer" :class="{'no-faction-fill': noFactionFill, 'hide-research-track-resources': false}" />
    </div>
    <ChatRoom v-if="game && (!open || players)" :room="gameId" :participants="chatParticipants" :me="user ? user._id : null" />
  </v-loading>
</template>

<script lang="ts">
import $ from 'jquery';
import get from 'lodash.get';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';
import { IGame } from '@lib/game';
import { IUser } from '@lib/user';
import api from '@/helpers/api';
import ChatRoom from '../components/ChatRoom.vue';
import {Game as GameViewer} from '@gaia-project/viewer';

@Component<Game>({
  created() {
    this.loadGame();

    this.actionSubscription = (this.$store as any).subscribeAction(({type, payload}) => {
      if (type !== 'gaiaViewer/playerClick') {
        return;
      }

      this.$router.push({path: '/user/' + encodeURIComponent(payload.name)});
    });
  },
  computed: {
    chatParticipants() {
      if (this.open) {
        return this.players.map(pl => ({id: pl.id, name: pl.name, imageUrl: '/images/factions/icons/random.svg'}));
      }
      return this.$store.state.gaiaViewer.data.players.map(pl => ({
        id: pl.auth,
        name: pl.name,
        imageUrl: `/images/factions/icons/${pl.faction ? pl.faction + '.svg' : 'random.svg'}`
      }));
    },
    timePerMove() {
      if (this.game.options.timePerMove < 3600) {
        return (this.game.options.timePerMove / 60) + " minutes";
      } else if (this.game.options.timePerMove > 3600) { 
        return (this.game.options.timePerMove / 3600) + " hours";
      }
      return "1 hour";
    },
    timePerGame() {
      if (this.game.options.timePerGame === 24*3600) {
        return "1 day";
      } else {
        return (this.game.options.timePerGame / (24*3600)) + " days";
      }
    }
  },
  watch: {
    gameId(newVal, oldVal) {
      this.game = null;
      this.loadGame();
    },
    activeGames(newVal) {
      // Reload game when all the players have joined and the player is active
      if (this.game && this.open && newVal.indexOf(this.gameId) !== -1) {
        this.loadGame();
      }
    }
  },
  components: {
    GameViewer,
    ChatRoom
  },
  destroyed() {
    if (this.actionSubscription) {
      this.actionSubscription();
    }
  }
})
export default class Game extends Vue {
  game: IGame = null;
  api = api;
  players: Array<{id: string, name: string}> = null;
  private actionSubscription: () => {} = null;

  loadGame() {
    $.get(`/api/game/${this.gameId}`).then(game => {
      this.game = game;

      if (this.open) {
        $.get(`/api/game/${this.gameId}/players`).then(players => {
          this.players = players;
        }, handleError);
      }
    }, handleError);
  }

  get activeGames() {
    return this.$store.state.activeGames;
  }

  get open() {
    // Set open to false when game is active -> auto refresh
    return this.game.options.nbPlayers !== this.game.players.length;
  }

  get noFactionFill() {
    return get(this.user, 'settings.game.noFactionFill');
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