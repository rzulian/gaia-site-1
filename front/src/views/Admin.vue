<template>
  <div class="admin container">
    <h1>Page admin</h1>
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
</template>

<script lang="ts">
import $ from 'jquery';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';

@Component
export default class Admin extends Vue {
  serverInfo: { disk: {availabe: number, total: number}, nbUsers: number } | null = null;
  
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
}
</script>
