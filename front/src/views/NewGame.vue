<template>
  <div class="container">
    <form @submit.prevent="createGame">
      <div class="row">
        <div class="form-group col-md-6">
          <label for="gameId">Game Id</label>
          <input class="form-control" id="gameId" type="text" maxlength="25" name="gameId" v-model.trim="gameId" placeholder="Game ID" aria-label="Game ID" required> 
          <small class="form-text text-muted">Use only alphanumeric characters and hyphens.</small>
        </div>

        <div class="form-group col-md-6">
          <label for="seed">Seed</label>
          <input class="form-control" id="seed" type="text" maxlength="25" name="gameId" v-model.trim="seed" placeholder="Optional-random-seed" aria-label="Random seed"> 
          <small class="form-text text-muted">Use only alphanumeric characters and hyphens.</small>
        </div>
      </div>

      <div class="row">
        <div class="form-group col-md-4">
          <label for="players">Number of players</label>
          <select v-model="players" id="players" class="form-control">
            <option :value="2">2 players</option>
            <option :value="3">3 players</option>
            <option :value="4">4 players</option>
          </select>
        </div>

        <div class="form-group col-md-4">
          <label for="timePerGame">Time per player per game</label>
          <select v-model="timePerGame" id="timePerGame" class="form-control">
            <option :value="24*3600">1 day</option>
            <option :value="3*24*3600">3 days</option>
            <option :value="5*24*3600">5 days</option>
            <option :value="15*24*3600">15 days</option>
          </select>
        </div>

        <div class="form-group col-md-4">
          <label for="timePerMove">Additional time per move</label>
          <select v-model="timePerMove" id="timePerMove" class="form-control">
            <option :value="5*60">5 minutes</option>
            <option :value="15*60">15 minutes</option>
            <option :value="3600">1 hour</option>
            <option :value="2*3600">2 hours</option>
            <option :value="6*3600">6 hours</option>
          </select>
        </div>
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
        <input class="form-check-input" type="checkbox" id="balancedGeneration" v-model="balancedGeneration">
        <label class="form-check-label" for="balancedGeneration">
          Balance the map for fairness. Credits to <a href="http://gaia-project.hol.es" target="_blank">bope</a>.
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="advancedRules" v-model="advancedRules">
        <label class="form-check-label" for="advancedRules">
          Last player rotates sectors before faction selection
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="unlisted" v-model="unlisted">
        <label class="form-check-label" for="unlisted">
          Unlisted. Check if you don't want strangers joining your game.
        </label>
      </div>
      
      <button class="btn btn-secondary mt-2" type="submit" :disabled="submitting">New game</button>
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
  seed = undefined;
  players = 2;
  join = true;
  randomOrder = true;
  unlisted = false;
  advancedRules = false;
  balancedGeneration = false;
  timePerMove = 2*3600;
  timePerGame = 5 * 24 * 3600;
  submitting = false;

  createGame() {
    this.submitting = true;
    const {join, gameId, players, randomOrder, unlisted, timePerMove, timePerGame, advancedRules, balancedGeneration, seed} = this;
    $.post('/api/game/new-game', {join, gameId, players, randomOrder, unlisted, timePerMove, timePerGame, advancedRules, balancedGeneration, seed}).then(
      () => this.$router.push('/game/' + this.gameId),
      err => handleError(err)
    ).then(() => this.submitting = false);
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
