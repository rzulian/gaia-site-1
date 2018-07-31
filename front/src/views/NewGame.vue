<template>
  <div class="container">
    <form @submit.prevent="createGame">
      <div class="form-group">
        <label for="gameId">Game Id</label>
        <input class="form-control" id="gameId" type="text" maxlength="20" name="gameId" v-model.trim="gameId" placeholder="Game ID" aria-label="Game ID" required> 
        <small class="form-text text-muted">Use only alphanumeric characters and hyphens.</small>
      </div>

      <div class="form-group">
        <label for="players">Number of players</label>
        <select v-model="players" id="players" class="form-control">
          <option :value="2">2 players</option>
          <option :value="3">3 players</option>
          <option :value="4">4 players</option>
        </select>
      </div>

      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="join" v-model="join">
        <label class="form-check-label" for="join">
          Automatically join this game
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="random-player-order" v-model="randomOrder">
        <label class="form-check-label" for="random-player-order">
          Randomize player order
        </label>
      </div>
      
      <button class="btn btn-secondary pull-right" type="submit">New game</button>
    </form>
  </div>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';

@Component
export default class NewGame extends Vue {
  gameId = "";
  players = 2;
  join = true;
  randomOrder = true;

  createGame() {
    $.post('/api/game/new-game', {gameId: this.gameId, players: this.players, join: this.join, randomOrder: this.randomOrder}).then(
      () => this.$router.push('/game/' + this.gameId),
      err => handleError(err)
    )
  }
}

</script>


<style lang="scss" scoped>
  
</style>
