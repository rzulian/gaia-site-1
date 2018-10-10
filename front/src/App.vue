<template>
  <div id="app">
    <Navbar/>
    <Alert/>
    <main class="container-fluid">
      <router-view/>
    </main>
    <div style="flex-grow: 1" />
    <Footer />
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
