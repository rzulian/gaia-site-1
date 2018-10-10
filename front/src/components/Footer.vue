<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-auto">
          <a href="https://forum.gaiaform.io" target="_blank" class="text-muted">Forums</a>
        </div>
        <div class="col-auto">
          <a href="mailto:contact@gaiaform.io" class="text-muted">Contact</a>
        </div>
        <div class="col-auto">
          <a href="https://github.com/donkeytech" target="_blank" class="text-muted">Source</a>
        </div>
        <div class="col-auto">
          <router-link to="/privacy-policy" class="text-muted">Privacy policy</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { User } from '@/types';

@Component
export default class Footer extends Vue {
  get user(): User {
    return this.$store.state.user;
  }
}
</script>

<style lang="scss">
html {
  min-height: 100%;
  height: 100%;
}
body {
  min-height: 100%;
  height: 100%;
}
.footer {
  margin-top: 30px;
  width: 100%;
  min-height: 60px; /* Set the fixed height of the footer here */
  line-height: 60px; /* Vertically center the text there */
  background-color: #f5f5f5;
}

</style>
