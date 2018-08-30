import './libs';
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './filters';
import VLoading from "./components/VLoading.vue";
import './registerServiceWorker';

// import VueNativeSock from 'vue-native-websocket';
// Vue.use(VueNativeSock, `ws://${window.location.host}:50802/chat`, {reconnection: true, store, format: 'json'});

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
// Global component
Vue.component("v-loading", VLoading);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
