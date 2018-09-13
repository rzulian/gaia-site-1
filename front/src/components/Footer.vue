<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-auto d-none d-md-flex">
          <span class="text-muted">We do not own the digital rights to Gaia Project</span>
        </div>
        <div class="col-auto">
          <router-link to="/privacy-policy" class="text-muted">Privacy policy</router-link>
        </div>
        <div class="col-auto" v-if="user">
          <a href="mailto:contact@gaiaform.io" class="text-muted">Contact</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IAbstractUser } from '@lib/user';

@Component
export default class Footer extends Vue {
  get user(): IAbstractUser | null {
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
