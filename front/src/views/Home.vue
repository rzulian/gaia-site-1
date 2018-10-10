<template>
  <div class="home text-center container">
    <div class="starter-template">
      <h1>An online implementation of the Gaia Project board game</h1>
      <p class="lead">Currently invite-only. Official website <a href="https://www.zmangames.com/en/products/gaia-project/" target="_blank">here</a> (<a href="https://boardgamegeek.com/boardgame/220308/gaia-project" target="_blank">BGG</a><!--, <a href="https://images-cdn.zmangames.com/us-east-1/filer_public/ce/89/ce890bfd-227e-4249-a52a-976bc5f20d19/en_gaia_rulebook_lo.pdf" target="_blank">rules</a>-->)</p>
    </div>  
    <br/>
    <div class="row mb-2">
      <v-loading class="col-md-6" :loading="loadingGames">
        <h4>Active games</h4>
        <GameList :games="games" v-if="games.length > 0" />
        <p v-else>All games are finished!</p>
      </v-loading>
      <v-loading class="col-md-6 mt-3 mt-md-0" :loading="loadingOpenGames">
        <h4>Open games</h4>
        <GameList :games="openGames" v-if="openGames.length > 0" />
        <p v-else>No open game. Why not create a new one?</p>
      </v-loading>
    </div>
    <div class="text-center"><router-link to="/games">See all the games</router-link></div>
    <br/>
    <router-link class="btn btn-lg btn-secondary" to="/new-game">New Game</router-link>
  </div>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError } from '@/utils';
import { Game } from '@/types';
import GameList from '../components/GameList.vue';

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
  },
  components: {
    GameList
  }
})
export default class Home extends Vue {
  games = [];
  openGames = [];
  loadingGames = true;
  loadingOpenGames = true;
  subscription: any = null;

  loadGames() {
    this.loadingGames = this.loadingOpenGames = true;

    $.get('/api/game/active?count=5').then(games => this.games = games, handleError).always(() => this.loadingGames = false);
    $.get('/api/game/open?count=5').then(games => this.openGames = games, handleError).always(() => this.loadingOpenGames = false);
  }
}
</script>


<style lang="scss">
  .starter-template {
    padding: 30px 15px;
    text-align: center;
  }

  .lead {
    font-size: 1.25rem;
    font-weight: 300;
  }
</style>
