<template>
  <v-loading div class="container">
    <h1>Games</h1>
    <div class="row">
      <v-loading class="col-md-6" :loading="loadingGames">
        <h4>Active games <span class="small">({{stats.active}})</span></h4>
        <div v-if="activeGames.length > 0">
          <GameList  :games="activeGames" class="mb-2" />
          <b-pagination size="md" align="right" :total-rows="stats.active" v-model="currentPageActive" :per-page="10" />
        </div>
        <p v-else>No ongoing games</p>
      </v-loading>
      <v-loading class="col-md-6 mt-3 mt-md-0" :loading="loadingGames">
        <h4>Finished games <span class="small">({{stats.finished}})</span></h4>
        <div v-if="closedGames.length > 0">
          <GameList  :games="closedGames" class="mb-2" />
          <b-pagination size="md" align="right" :total-rows="stats.finished" v-model="currentPageFinished" :per-page="10" />
        </div>
        <p v-else>No finished game.</p>
      </v-loading>
    </div>
  </v-loading>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError } from '@/utils';
import $ from "jquery";
import GameList from '../components/GameList.vue';
import { IGame } from '@lib/game';

@Component<Games>({
  async created() {
    try {
      const name = this.$route.params.userName;

      this.stats = await $.get(`/api/game/stats`);

      [this.activeGames, this.closedGames] = await Promise.all([
        $.get(`/api/game/active?count=10&skip=${(this.currentPageActive-1)*10}`), 
        $.get(`/api/game/closed?count=10&skip=${(this.currentPageFinished-1)*10}`)
      ]);
      this.loadingGames = false;
    } catch (err) {
      handleError(err);
    }
  },
  components: {
    GameList
  },
  watch: {
    async currentPageFinished(newVal) {
      const closedGames = await $.get(`/api/game/closed?count=10&skip=${(this.currentPageFinished-1)*10}`);

      if (newVal === this.currentPageFinished) {
        this.closedGames = closedGames;
      }
    },

    async currentPageActive(newVal) {
      const activeGames = await $.get(`/api/game/active?count=10&skip=${(this.currentPageActive-1)*10}`);

      if (newVal === this.currentPageActive) {
        this.activeGames = activeGames;
      }
    }
  }
})
export default class Games extends Vue {
  activeGames: IGame[] = [];
  closedGames: IGame[] = [];
  stats = {active: 0, open: 0, total: 0, finished: 0};
  currentPageFinished = 1;
  currentPageActive = 1;
  
  loadingGames = true;
}
</script>
