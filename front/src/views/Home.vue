<template>
  <div class="home text-center container">
    <div class="card">
      <div class="card-body">
        <h2>An online implementation of the Gaia Project board game</h2>
        <p>Official website <a href="https://www.zmangames.com/en/products/gaia-project/" target="_blank">here</a> (<a href="https://boardgamegeek.com/boardgame/220308/gaia-project" target="_blank">BGG</a><!--, <a href="https://images-cdn.zmangames.com/us-east-1/filer_public/ce/89/ce890bfd-227e-4249-a52a-976bc5f20d19/en_gaia_rulebook_lo.pdf" target="_blank">rules</a>-->)</p>
      </div>
    </div>  
    <br/>
    <div v-loading="loadingGames">
      <h4>Active games</h4>
      <ul v-if="games.length > 0" class="list-group col-md-6 offset-md-3">
        <router-link :to="`/game/${game._id}`" v-for="game in games" :key="game._id" class="list-group-item">{{game._id}}</router-link>
      </ul>
    </div>
    <br/>
    <router-link class="btn btn-lg btn-secondary" to="/new-game">New Game</router-link>
  </div>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError } from '@/utils';

@Component<Home>({
  created() {
    $.get('/api/game/active').then(games => this.games = games, handleError).always(() => this.loadingGames = false);
  }
})
export default class Home extends Vue {
  games = [];
  loadingGames = true;
}
</script>


<style lang="scss" scoped>
  .card {
    //background-color: gainsboro
  }
</style>
