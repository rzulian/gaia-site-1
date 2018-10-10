<template>
  <v-loading div class="container account" :loading="!user">
    <h1>{{user ? user.account.username : ""}}</h1>
    <div class="row">
      <v-loading class="col-md-6" :loading="loadingGames">
        <h4>Active games</h4>
        <GameList v-if="activeGames.length > 0" :games="activeGames" />
        <p v-else>No ongoing games</p>
      </v-loading>
      <v-loading class="col-md-6 mt-3 mt-md-0" :loading="loadingGames">
        <h4>Finished games <span class="small">({{totalFinished}})</span></h4>
        <div v-if="closedGames.length > 0">
          <GameList  :games="closedGames" class="mb-2" />
          <b-pagination size="md" align="right" :total-rows="totalFinished" v-model="currentPageFinished" :per-page="10" />
        </div>
        <p v-else>No finished game.</p>
      </v-loading>
    </div>
  </v-loading>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IUser } from '@lib/user';
import { handleError } from '@/utils';
import $ from "jquery";
import GameList from '../components/GameList.vue';

@Component<Account>({
  async created() {
    try {
      const name = this.$route.params.userName;

      this.user = await $.get(`/api/user/infoByName/${encodeURIComponent(name)}`);

      [this.activeGames, this.closedGames] = await Promise.all([
        $.get(`/api/user/${this.user._id}/games/active?count=10`), 
        $.get(`/api/user/${this.user._id}/games/closed?count=10&skip=${(this.currentPageFinished-1)*10}`)
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
      const closedGames = await $.get(`/api/user/${this.user._id}/games/closed?count=10&skip=${(this.currentPageFinished-1)*10}`);

      if (newVal === this.currentPageFinished) {
        this.closedGames = closedGames;
      }
    }
  }
})
export default class Account extends Vue {
  user: IUser = null;
  activeGames: any[] = [];
  closedGames: any[] = [];
  currentPageFinished = 1;
  
  get totalFinished() {
    return this.user ? this.user.meta.games.finished : 0;
  }
  
  loadingGames = true;
}
</script>
