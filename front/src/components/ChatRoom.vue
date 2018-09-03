<template>
  <div>
    <beautiful-chat
      :title="room"
      :participants="participants"
      :onMessageWasSent="sendMessage"
      :messageList="messageList"
      :newMessagesCount="newMessagesCount"
      :isOpen="isChatOpen"
      :close="closeChat"
      :open="openChat"
      :colors="colors"
      :showEmoji="true"
      :showFile="false" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { handleError, handleInfo } from '@/utils';
import $ from 'jquery';
import { setTimeout } from 'timers';

@Component<ChatRoom>({
  created() {
    this.connect();

    this.mutationSubscription = (this.$store as any).subscribe(({type, payload}) => {
      if (type === 'updateUser') {
        // Todo: udpate user in the room
      }
    });
  },
  data() {
    return {
      colors: {
        header: {
          bg: '#4e8cff',
          text: '#ffffff'
        },
        launcher: {
          bg: '#4e8cff'
        },
        messageList: {
          bg: '#ffffff'
        },
        sentMessage: {
          bg: '#4e8cff',
          text: '#ffffff'
        },
        receivedMessage: {
          bg: '#eaeaea',
          text: '#222222'
        },
        userInput: {
          bg: '#f4f7f9',
          text: '#565867'
        }
      }
    }
  },
  destroyed() {
    this.isDestroyed = true;
    this.clearWs(this.ws);
    // Unsubscribe
    this.mutationSubscription();
  }
})
export default class ChatRoom extends Vue {
  @Prop()
  room: string;

  @Prop()
  me: string;

  @Prop({default: () => []})
  participants: Array<{id: string, name: string, imageUrl: string}>;

  get user() {
    return this.$store.state.user;
  }

  replaceMessages (messages: Message[]) {
    this.messageList = messages.map(msg => this.transformedMessage(msg));
    this.newMessagesCount = 0;
  }

  newMessages (messages: Message[]) {
    // Only NEW messages
    messages = messages.filter(msg => !this.messageList.some(otherMsg => otherMsg._id === msg._id));
    messages = messages.map(msg => this.transformedMessage(msg));

    this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + messages.length;

    // Limit the number of messages shown
    this.messageList = [...this.messageList, ...messages].slice(0, 200);
  }

  transformedMessage(message: Message) : Message {
    if (message.type === 'system') {
      const date = new Date(parseInt(message._id.substring(0, 8), 16) * 1000);
      const cv = number => ('0' + (number+1)).substr(-2);
      message.data.meta = `${date.getFullYear()}-${cv(date.getMonth()+1)}-${cv(date.getDate())} ${cv(date.getHours())}:${cv(date.getMinutes())}`;
    }

    if (message.author === this.me) {
      message.author = 'me';
    }
    
    return message;
  }

  sendMessage(msg: Message) {
    $.post(`/api/game/${this.room}/chat`, msg).then(
      () => {}, // Mark message as delivered? by adding meta: 'Delivered'
      err => handleError(err)
    )
  }

  connect() {
    if (this.isDestroyed) {
      return;
    }

    const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws';
    console.log("connecting to websocket", `${protocol}://${window.location.host}/chat`);
    this.ws = new WebSocket(`${protocol}://${window.location.host}/chat`);
    
    this.ws.onclose = this.ws.onerror = () => {
      console.log("websocket closed");
      this.clearWs(this.ws);

      // Automatically reconnect
      setTimeout(() => this.connect(), 2000);
    }

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({room: this.room}));
    }

    this.ws.onmessage = evt => {
      const obj = JSON.parse(evt.data);

      if (obj.command === 'messageList') {
        this.replaceMessages(obj.messages);
      } else if (obj.command === 'newMessages') {
        this.newMessages(obj.messages);
      }
    }
  }

  clearWs(ws: WebSocket) {
    ws.onclose = ws.onerror = ws.onmessage = ws.onopen = undefined;
    ws.close();
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
  private messageList: Message[] = [];
  private isDestroyed = false;
}

interface Message {
  _id: string,
  type: "emoji" | "system" | "text",
  author: string,
  meta?: string,
  text: string,
  data?: {
    meta: string,
    text: string
  }
}
</script>

<style lang="scss">
  .sc-chat-window, .sc-launcher {
    z-index: 3;
  }

  .sc-message-list {
    padding: 20px 0 !important;
  }

  .sc-message {
    a.chatLink {
      color: inherit !important;
    }
  }
</style>
