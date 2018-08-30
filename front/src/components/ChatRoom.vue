<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';

@Component<ChatRoom>({
  created() {
    this.ws = new WebSocket(`ws://${window.location.host}:50802/chat`);
    
    this.ws.onclose = () => {
      console.log("websocket closed");
    }

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({room: this.room}));
    }

    this.mutationSubscription = (this.$store as any).subscribe(({type, payload}) => {
      if (type === 'updateUser') {
        // Todo: udpate user in the room
      }
    });
  },
  destroyed() {
    delete this.ws.onclose;
    delete this.ws.onopen;
    this.ws.close();
    // Unsubscribe
    this.mutationSubscription();
  }
})
export default class ChatRoom extends Vue {
  @Prop()
  room: string;

  mutationSubscription: () => {} = null;

  get user() {
    return this.$store.state.user;
  }

  ws: WebSocket = null;
}
</script>