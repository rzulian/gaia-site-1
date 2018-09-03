<template>
  <v-loading :loading="!game">
    <div v-if="game && open" class="container text-center">
      <h1>Game {{game._id}}</h1>
      <p>{{game.options.nbPlayers}} players game</p>
      <p>Waiting on {{(game.options.nbPlayers - game.players.length) | pluralize('player')}}</p>
      <v-loading :loading="!players" class="mb-2">
        <div v-if="players">
          <p>
            Creator: {{players.find(pl => pl.id === game.creator).name}}
          </p>
          <p v-if="game.players.length > 0">
            Players: <br/>
            <span v-for="player in game.players" :key="player">- {{players.find(pl => pl.id === player).name}} <br/></span>
          </p>
        </div>
      </v-loading>
      <button class="btn btn-secondary" v-if="user && game.players.includes(user._id)" disabled>You already joined</button>
      <button class="btn btn-secondary" v-else @click="join">Join!</button>
    </div>
    <div v-else-if="game">
      <GameViewer :api="api" :gameId="gameId" :auth="user ? user._id : null" ref="viewer" />
    </div>
    <ChatRoom v-if="game && (!open || players)" :room="gameId" :participants="chatParticipants" :me="user ? user._id : null" />
  </v-loading>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';
import { IGame } from '@lib/game';
import { IUser } from '@lib/user';
import api from '@/helpers/api';
import ChatRoom from '../components/ChatRoom.vue';
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

    this.actionSubscription = (this.$store as any).subscribeAction(({type, payload}) => {
      if (type !== 'gaiaViewer/playerClick') {
        return;
      }

      this.$router.push({path: '/user/' + encodeURIComponent(payload.name)});
    });
    this.mutationSubscription = (this.$store as any).subscribe(({type, payload}) => {
      if (type === 'updateUser') {
        setTimeout(() => this.$refs.viewer.updateFavicon());
        return;
      }
    });
  },
  // Restore regular favicon when leaving game
  beforeRouteLeave(to, from, next) {
    $("#favicon-gp").attr("href", "/favicon.png");
    next();
  },
  computed: {
    open() {
      return this.game.options.nbPlayers !== this.game.players.length;
    },
    chatParticipants() {
      if (this.open) {
        return this.players.map(pl => ({id: pl.id, name: pl.name, imageUrl: '/images/factions/icons/random.svg'}));
      }
      return this.$store.state.gaiaViewer.data.players.map(pl => ({
        id: pl.auth,
        name: pl.name,
        imageUrl: `/images/factions/icons/${pl.faction ? pl.faction + '.svg' : 'random.svg'}`
      }));
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
    if (this.mutationSubscription) {
      this.mutationSubscription();
    }
  }
})
export default class Game extends Vue {
  game: IGame = null;
  api = api;
  players: Array<{id: string, name: string}> = null;
  private actionSubscription: () => {} = null;
  private mutationSubscription: () => {} = null;
  
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