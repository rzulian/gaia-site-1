import 'dotenv/config';
import * as cluster from "cluster";

import env from './app/config/env';

// In production, run a process for each CPU
if (cluster.isMaster && env.isProduction) {
  for (let i = 0; i < env.threads; i++) {
    cluster.fork();
  }
} else {
  // tslint:disable-next-line no-var-requires
  require('./app/app');
}

// Whichever the case, run only one chat service
if (cluster.isMaster) {
  // tslint:disable-next-line no-var-requires
  require('./app/chat');
}
