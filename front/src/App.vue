<template>
  <div id="app">
    <Navbar/>
    <Alert/>
    <main class="container-fluid">
      <router-view/>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Navbar from '@/components/Navbar.vue';
import Alert from '@/components/Alert.vue';

@Component({
  components: {
    Navbar,
    Alert
  },
})
export default class App extends Vue {

}
</script>

<style lang="scss">
@import "stylesheets/main.scss";

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

</style>
