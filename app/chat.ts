import './config/db';
import env from './config/env';

import {Server} from 'ws';

const wss = new Server({port: env.chatPort});

wss.on("listening", () => console.log("Listening for chat messages on port", env.chatPort));
wss.on("error", err => console.error(err));

wss.on("connection", ws => {
  console.log("new websocket connected");

  ws.on("message", message => {
    console.log("message received", message);
  });
});
