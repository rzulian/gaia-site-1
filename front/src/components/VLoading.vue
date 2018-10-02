<template>
  <div>
    <p class="text-center" v-if="loading"> Loading{{dots}}</p>
    <slot v-else />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';

@Component({
  created() {
    this.interval = setInterval(() => this.count += 1, 200);
  },
  destroyed() {
    clearInterval(this.inverval);
  }
})
export default class VLoading extends Vue {
  interval = 0;
  count = 0;

  @Prop()
  loading: boolean;

  get dots() {
    const count = this.count % 3;

    if (count === 0) {
      return '.';
    } else if (count === 1) {
      return '..';
    } else {
      return '...';
    }
  }
}
</script>