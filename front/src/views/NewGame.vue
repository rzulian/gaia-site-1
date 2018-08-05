<template>
  <div class="container">
    <form @submit.prevent="createGame">
      <div class="form-group">
        <label for="gameId">Game Id</label>
        <input class="form-control" id="gameId" type="text" maxlength="25" name="gameId" v-model.trim="gameId" placeholder="Game ID" aria-label="Game ID" required> 
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
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="unlisted" v-model="unlisted">
        <label class="form-check-label" for="unlisted">
          Unlisted (won't show in Open games). Check if you don't want strangers joining your game.
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
  gameId = randomId();
  players = 2;
  join = true;
  randomOrder = true;
  unlisted = false;

  createGame() {
    $.post('/api/game/new-game', {gameId: this.gameId, players: this.players, join: this.join, randomOrder: this.randomOrder, unlisted: this.unlisted}).then(
      () => this.$router.push('/game/' + this.gameId),
      err => handleError(err)
    )
  }
}

const adjectives = ["blue", "sweet", "red", "yellow", "green", "brown", "princely", "wavely", "stunning", "inquiring", "menacing", "whirly", "curious", "wizardly", "gentle", "blunt",
  "rumbly", "watery", "fiery", "quick", "playful", "bionic", "costly", "cheap", "decisive", "bash", "bold", "timid", "large", "sturdy", "strong", "pink", "red", "gray", 
  "piling", "telling", "inspiring", "vengeful", "flashing", "swift", "polite", "dark", "bright", "modern"];

const nouns = ["jeans", "dreams", "ground", "picture", "front", "lie", "surface", "rule", "dance", "peace", "future", "wall", "farm", "operation", "pressure", "property", "morning", "amount" ,
  "piece", "beauty", "trade", "fear", "demand", "wonder", "list", "judge", "paint", "secretary", "heart", "union", "island", "drink", "story", "experiment", "stay", "paper", "space", 
  "desire", "sign", "visit", "supply", "officer", "doubt", "wish", "horse", "station", "food", "character"];

function randomId() {
  return adjectives[ Math.floor(Math.random() * adjectives.length) ] + "-" + nouns[ Math.floor(Math.random() * nouns.length) ] + "-" + Math.ceil(Math.random() * 9999);
}

</script>

<style lang="scss" scoped>
  
</style>
