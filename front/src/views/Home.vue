<template>
  <div class="home text-center container">
    <div class="card">
      <div class="card-body">
        <h2>An online implementation of the Gaia Project board game</h2>
        <p>Currently invite-only. Official website <a href="https://www.zmangames.com/en/products/gaia-project/" target="_blank">here</a> (<a href="https://boardgamegeek.com/boardgame/220308/gaia-project" target="_blank">BGG</a><!--, <a href="https://images-cdn.zmangames.com/us-east-1/filer_public/ce/89/ce890bfd-227e-4249-a52a-976bc5f20d19/en_gaia_rulebook_lo.pdf" target="_blank">rules</a>-->)</p>
      </div>
    </div>  
    <br/>
    <div class="row">
      <v-loading class="col-md-6" :loading="loadingGames">
        <h4>Active games</h4>
        <ul v-if="games.length > 0" class="list-group text-left">
          <router-link :to="`/game/${game._id}`" v-for="game in games" :key="game._id" class="list-group-item list-group-item-action active-game">
            <img v-for="player in game.data.players" :key="player.faction" :src="`/images/factions/icons/${player.faction}.svg`" :title="player.faction" class="avatar mr-1"/>
            <img v-for="i in [0,1,2,3].slice(game.data.players.length)" :key="i" class="invisible avatar mr-1" src="/images/factions/icons/ambas.svg"/>
            
            <span>
              {{game._id}} - R{{game.data.round}}
            </span>
          </router-link>
        </ul>
        <p v-else>All games are finished!</p>
      </v-loading>
      <v-loading class="col-md-6 mt-3 mt-md-0" :loading="loadingOpenGames">
        <h4>Open games</h4>
        <ul v-if="openGames.length > 0" class="list-group">
          <router-link :to="`/game/${game._id}`" v-for="game in openGames" :key="game._id" class="list-group-item list-group-item-action">{{game._id}} - {{game.options.nbPlayers}}p <span class="small"> ({{timePerGame(game)}})</span></router-link>
        </ul>
        <p v-else>No open game. Why not create a new one?</p>
      </v-loading>
    </div>
    <br/>
    <router-link class="btn btn-lg btn-secondary" to="/new-game">New Game</router-link>
  </div>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError } from '@/utils';
import { Game } from '@/types';

@Component<Home>({
  created() {
    this.loadGames();
    this.subscription = this.$store.subscribeAction(({type}) => {
      if (type !== 'logoClick' || this.loadingGames || this.loadingOpenGames) {
        return;
      }

      this.loadGames();
    });
  },
  destroyed() {
    this.subscription();
  }
})
export default class Home extends Vue {
  games = [];
  openGames = [];
  loadingGames = true;
  loadingOpenGames = true;
  subscription: any = null;

  timePerGame(game: Game) {
    switch (game.options.timePerGame) {
      case 24*3600: return "1 day";
      default: return (game.options.timePerGame / (24*3600)) + " days";
    }
  }

  loadGames() {
    this.loadingGames = this.loadingOpenGames = true;

    $.get('/api/game/active?count=5').then(games => this.games = games, handleError).always(() => this.loadingGames = false);
    $.get('/api/game/open?count=5').then(games => this.openGames = games, handleError).always(() => this.loadingOpenGames = false);
  }
}
</script>


<style lang="scss">
  .list-group-item.active-game {
    padding: 0.5em;

    img.avatar {
      height: 2em;
      width: 2em;
      border-radius: 50%;
      vertical-align: middle;
    }
  }
</style>
