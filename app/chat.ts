import './config/db';
import env from './config/env';
import delay from "delay";
import * as _ from "lodash";

import {Server} from 'ws';
import { Chat } from './models';
import { ObjectID } from '../node_modules/@types/bson';

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
    const roomMessages = await Chat.find({room: data.room}).lean(true).sort("-id").limit(100);

    ws.send(JSON.stringify(roomMessages));
  });

  ws.on("close", () => {
    console.log("websocket closed");
  });
});

let lastChecked = Date.now();

/**
 * Check periodically for new messages in db and send them to clients
 */
async function run() {
  while (1) {
    // Find new messages
    const messages = await Chat.find({_id: {$gte: ObjectID.createFromTime(lastChecked / 1000)}}).lean();
    const messagesPerRooms = _.groupBy(messages, msg => msg.room.toString());

    for (const ws of wss.clients) {
      if ((ws as any).room in messagesPerRooms) {
        ws.send(JSON.stringify(messagesPerRooms[(ws as any).room]));
      }
    }

    lastChecked = Date.now();

    await delay(50);
  }
}

run();
