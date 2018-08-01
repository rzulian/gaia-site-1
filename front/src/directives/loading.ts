import Vue from 'vue';

// https://stackoverflow.com/questions/51619985/implementing-a-v-loading-directive-where-content-is-replaced-while-data-is-load

Vue.directive('loading', {
  bind(el: HTMLElement, binding: any, vnode: any) {
    if (binding.value) {
      el.innerHTML = `<div class="text-center"><i class='fa fa-spin fa-spinner'></i> Loading...</div>`;
    }
    vnode.data.loading = binding.value;
  },

  update(el: HTMLElement, binding: any, vnode: any, oldVnode: any) {
    if (binding.value) {
      el.innerHTML = `<div class="text-center"><i class='fa fa-spin fa-spinner'></i> Loading...</div>`;
    } else if (oldVnode.data.loading) {
      vnode.key += "1";
      vnode.context.$forceUpdate();
    }

    vnode.data.loading = binding.value;
  },
});
