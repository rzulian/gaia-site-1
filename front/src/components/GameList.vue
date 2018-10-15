<template>
  <ul class="list-group text-left game-list">
    <router-link :to="`/game/${game._id}`" v-for="game in games" :key="game._id" :class="['list-group-item', 'list-group-item-action', {'active-game': !game.open || !game.active, 'current-turn': game.currentPlayer && game.currentPlayer === user}]">
      
      <span class="mr-auto game-name">
        <span :class="['fa', 'mr-1', game.options.spaceShips ? 'fa-rocket': 'fa-globe']"></span>{{game._id}}&nbsp;<span v-if="game.active && !game.open" class="small">(R{{game.data.round}})</span>
          <span v-if="game.active && game.open" class="small">({{timePerGame(game)}})</span>
      </span>

      <div class="row no-gutters factions" v-if="!game.open || !game.active">
        <div v-for="(player,i) in game.data.players" :key="i" :style="`background-image: url('/images/factions/icons/${player.faction || 'random'}.svg')`" :title="player.faction || 'unknown'" class="avatar mr-1">
          <span :class="['vp', {'current': user && game.players[i] === user}]">{{player.data.victoryPoints}}</span>
        </div>
      </div>
      <span v-else>
        {{game.players.length}} / {{game.data.players.length}}
      </span>
    </router-link>
  </ul>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator';
import { IGame } from '@lib/game';

@Component
export default class GameList extends Vue {
  @Prop()
  games: IGame[];

  @Prop({default: null})
  user: string;

  timePerGame(game: IGame) {
    switch (game.options.timePerGame) {
      case 24*3600: return "1 day";
      default: return (game.options.timePerGame / (24*3600)) + " days";
    }
  }
};

</script>

<style lang="scss">

// @import "../stylesheets/main.scss";

.list-group.game-list {
  .list-group-item {
    display: flex;

    &.current-turn {
      background: lightgreen;

      &:hover, &:focus {
        background: darken($color: lightgreen, $amount: 5%);
      }

      &:active {
        background: darken($color: lightgreen, $amount: 10%);
      }
    }

    &.active-game {
      padding: 0.5em;

      .game-name {
        align-self: center;
        margin-left: 0.25em;
      }

      .factions {
        // On mobile, if multiple lines, I want items to be aligned to the right
        justify-content: flex-end;
      }

      .avatar {
        height: 2em;
        width: 2em;
        display: inline-block;
        position: relative;
        border-radius: 50%;
        vertical-align: middle;
        background-size: cover;

        .vp {
          position: absolute;
          right: -5px;
          bottom: -5px;
          font-size: 0.7em;
          border-radius: 5px;
          color: white;
          background-color: #838383;
          width: 20px;
          text-align: center;

          &.current {
            background-color: #6673bc;
          }
        }
      }
    }
  }
}
 
</style>
