<template>
  <div id="app">
    <Navbar/>
    <Alert/>
    <main class="container-fluid">
      <router-view/>
    </main>
    <div style="flex-grow: 1" />
    <Footer />
    <audio preload="none" id="sound-notification">
      <source src="/audio/notification.mp3" type="audio/mpeg">
      <source src="/audio/notification.ogg" type="audio/ogg">
    </audio>
    <b-modal v-if="$store.state.updateAvailable" v-model="modalShow" size="md" @ok="refresh" title="Update available" ok-title="Refresh">
      An update to the application is available. Refresh to get the changes.
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Navbar from '@/components/Navbar.vue';
import Alert from '@/components/Alert.vue';
import Footer from '@/components/Footer.vue';

@Component({
  components: {
    Navbar,
    Alert,
    Footer
  },
})
export default class App extends Vue {
  modalShow = true;

  refresh() {
    // Force reload is NECESSARY
    location.reload(true);
  }
}
</script>

<style lang="scss">
@import "stylesheets/main.scss";

#app {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

</style>
