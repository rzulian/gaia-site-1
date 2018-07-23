<template>
  <div class="admin container">
    <h1>Admin page</h1>
    <div class="row container">
      <div class="col-md-6">
        <div class="card mt-3">
          <div class="card-body">
            <h5 class="card-title">Server info</h5>
            <p v-if="serverInfo">
              Available space: {{ serverInfo.disk.available | filesize }} / {{ serverInfo.disk.total | filesize }} <br/>
              Users: {{serverInfo.nbUsers}}
            </p>
            <p v-else>
              <span class="fa fa-spinner fa-spin"></span> Loading...
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card mt-3">
          <div class="card-body">
            <h5 class="card-title">User management</h5>
            <label for="email-confirm">Resend confirmation email</label>
            <form @submit.prevent="resend(emailConfirm)">
              <div class="input-group">
                <input type="email" class="form-control" placeholder="Email" id="name" v-model="emailConfirm" required>
                <div class="input-group-append">
                  <button class="btn btn-primary" type="submit" >Resend</button>
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
}
</script>
