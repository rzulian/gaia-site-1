import './config/db';
import env from './config/env';
import delay from "delay";
import * as _ from "lodash";

import {Server} from 'ws';
import { ChatMessage } from './models';
import { ObjectID } from 'bson';

const wss = new Server({port: env.chatPort});

wss.on("listening", () => console.log("Listening for chat messages on port", env.chatPort));
wss.on("error", err => console.error(err));

wss.on("connection", ws => {
  console.log("new websocket connected");

  ws.on("message", async (message) => {
    const data = JSON.parse(message.toString());

    if (data.room) {
      (ws as any).room = data.room;
    }

    // Show only last 100 messages
    const roomMessages = await ChatMessage.find({room: data.room}).lean(true).sort("-id").limit(100);

    for (const msg of roomMessages) {
      delete msg.room;
    }

    ws.send(JSON.stringify({
      room: data.room,
      command: 'messageList',
      messages: roomMessages
    }));
  });

  ws.on("close", () => {
    console.log("websocket closed");
  });
});

let lastChecked: ObjectID = ObjectID.createFromTime(Math.floor(Date.now() / 1000));

/**
 * Check periodically for new messages in db and send them to clients
 */
async function run() {
  while (1) {
    // Find new messages
    const messages = await ChatMessage.find({_id: {$gt: lastChecked}}).lean();
    const messagesPerRooms = _.groupBy(messages, msg => msg.room.toString());

    for (const msg of messages) {
      delete msg.room;
    }

    for (const ws of wss.clients) {
      if ((ws as any).room in messagesPerRooms) {
        ws.send(JSON.stringify({
          room: (ws as any).room,
          messages: messagesPerRooms[(ws as any).room],
          command: 'newMessages'
        }));
      }
    }

    if (messages.length > 0) {
      lastChecked = messages[messages.length - 1]._id;
    }

    await delay(50);
  }
}

run();
