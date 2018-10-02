<template>
  <div class="admin container">
    <h1>Admin page</h1>
    <div class="row container">
      <div class="col-md-6">
        <div class="card mt-3">
          <div class="card-body">
            <h5 class="card-title">Server info</h5>
            <v-loading :loading="!serverInfo">
              <div v-if="serverInfo">
                Available space: {{ serverInfo.disk.available | filesize }} / {{ serverInfo.disk.total | filesize }} <br/>
                Users: {{serverInfo.nbUsers}}
              </div>
            </v-loading>
          </div>
        </div>
        <div class="card mt-3">
          <div class="card-body">
            <h5 class="card-title">Game management</h5>
            <label for="gameId">Delete game</label>
            <form @submit.prevent="deleteGame(gameId)">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Game ID" id="gameId" v-model="gameId" required>
                <div class="input-group-append">
                  <button class="btn btn-primary" type="submit" >Delete</button>
                </div>
              </div>
            </form>
            <label for="gameIdR" class="mt-3">Replay game</label>
            <form @submit.prevent="replayGame(gameIdR)">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Game ID" id="gameIdR" v-model="gameIdR" required>
                <div class="input-group-append">
                  <button class="btn btn-primary" type="submit" >Replay</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card mt-3">
          <div class="card-body">
            <h5 class="card-title">User management</h5>
            
            <label for="invitedEmail">Invite new user</label>
            <form @submit.prevent="invite(invitedEmail)">
              <div class="input-group">
                <input type="email" class="form-control" placeholder="Email" id="invitedEmail" v-model="invitedEmail" required>
                <div class="input-group-append">
                  <button class="btn btn-primary" type="submit" >Invite</button>
                </div>
              </div>
            </form>
            <label for="email-confirm" class="mt-3">Resend confirmation email</label>
            <form @submit.prevent="resend(emailConfirm)">
              <div class="input-group">
                <input type="email" class="form-control" placeholder="Email" id="email-confirm" v-model="emailConfirm" required>
                <div class="input-group-append">
                  <button class="btn btn-primary" type="submit" >Resend</button>
                </div>
              </div>
            </form>
            <label for="username" class="mt-3">Log in as another user</label>
            <form @submit.prevent="login(username)">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Username" id="username" v-model="username" required>
                <div class="input-group-append">
                  <button class="btn btn-primary" type="submit" >Log in as</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';

@Component
export default class Admin extends Vue {
  serverInfo: { disk: {availabe: number, total: number}, nbUsers: number } | null = null;
  emailConfirm = "";
  username = "";
  invitedEmail = "";
  gameId = "";
  gameIdR = "";
  
  constructor() {
    super();

    this.loadServerInfo();
  }

  loadServerInfo() {
    $.get('/api/admin/serverinfo').then(
      info => this.serverInfo = info,
      err => handleError(err)
    )
  }

  resend(email: string) {
    $.post('/api/admin/resend-confirmation', {email}).then(
      info => handleInfo("Email sent!"),
      handleError
    )
  }

  invite(email: string) {
    $.post('/api/admin/invite', {email}).then(
      info => handleInfo("Invite sent!"),
      handleError
    )
  }

  deleteGame(gameId: string) {
    $.ajax(`/api/game/${gameId}`, {method: "delete"}).then(
      info => handleInfo("Game deleted!"),
      handleError
    )
  }

  replayGame(gameId: string) {
    $.post(`/api/game/${gameId}/replay`, {}).then(
      info => handleInfo("Game replayed."),
      handleError
    )
  }

  login(username: string) {
    $.post('/api/admin/login-as', {username}).then(
      data => this.$store.commit("updateUser", data),
      handleError
    )
  }
}
</script>
