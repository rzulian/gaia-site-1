import Vue from 'vue';

Vue.directive('loading', {
  bind(el: HTMLElement, binding: any, vnode: any) {
    console.log(this, arguments);
    vnode.data.html = el.innerHTML;
    vnode.data.loading = binding.value;

    if (binding.value) {
      el.innerHTML = `<i class='fa fa-spin fa-spinner'></i>`;
    } else {
      el.innerHTML = vnode.data.html;
    }
  },

  update(el: HTMLElement, binding: any, vnode: any, oldVnode: any) {
    console.log(el.innerHTML);
    console.log("update", this, arguments);

    if (binding.value) {
      el.innerHTML = `<i class='fa fa-spin fa-spinner'></i>`;
    } else {
      el.innerHTML = oldVnode.data.html;
    }

    vnode.data.html = oldVnode.data.html;
    vnode.data.loading = binding.value;
  },
});
