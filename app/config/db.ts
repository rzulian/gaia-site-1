import locks from 'mongo-locks';
import * as mongoose from "mongoose";
import env from "./env";
import migrations from '../models/migrations';

(<any> mongoose).Promise = global.Promise; // native promises
mongoose.connect(env.dbUrl, <any> {dbName: 'gaia-project', useNewUrlParser: true});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

mongoose.connection.on("open", async () => {
  console.log("connected to database!");

  await migrations["0.1.0"].up();
});

locks.init(mongoose.connection);
