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
        <h4>Finished games</h4>
        <GameList v-if="closedGames.length > 0" :games="closedGames"/>
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

      this.activeGames = await $.get(`/api/user/${this.user._id}/games/active`);
      this.closedGames = await $.get(`/api/user/${this.user._id}/games/closed`);
      this.loadingGames = false;
    } catch (err) {
      handleError(err);
    }
  },
  components: {
    GameList
  }
})
export default class Account extends Vue {
  user: IUser = null;
  activeGames: any[] = [];
  closedGames: any[] = [];
  
  loadingGames = true;
}
</script>
