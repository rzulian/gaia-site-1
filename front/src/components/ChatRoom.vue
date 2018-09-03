<template>
  <div>
    <beautiful-chat
      :title="room"
      :participants="participants"
      :onMessageWasSent="onMessageWasSent"
      :messageList="messageList"
      :newMessagesCount="newMessagesCount"
      :isOpen="isChatOpen"
      :close="closeChat"
      :open="openChat"
      :showEmoji="true"
      :showFile="false" />
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

  @Prop({default: () => []})
  participants: Array<{id: string, name: string, imageUrl: string}>;

  get user() {
    return this.$store.state.user;
  }

  newMessage (message) {
    if (message.length > 0) {
      this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1
      this.onMessageWasSent(message)
    }
  }
  
  onMessageWasSent (message) {
    this.messageList = [...this.messageList, message]
  }
  
  openChat () {
    this.isChatOpen = true
    this.newMessagesCount = 0
  }
  
  closeChat () {
    this.isChatOpen = false
  }

  /*** Private variables ***/
  private mutationSubscription: () => {} = null;
  private ws: WebSocket = null;
  private isChatOpen: boolean = false;
  private newMessagesCount = 0;
  private messageList = [];
}
</script>

<style lang="scss">
  .sc-chat-window, .sc-launcher {
    z-index: 3;
  }
</style>
