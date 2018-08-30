<template>
  <div>
    <p class="text-center" v-if="loading"><i class='fa fa-spin fa-spinner'></i> Loading...</p>
    <slot v-else />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';

@Component
export default class VLoading extends Vue {
  @Prop()
  loading: boolean = true;
}
</script>