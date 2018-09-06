import * as passport from 'passport';
import * as mongoose from 'mongoose';

/* Express stuff */
import * as express from 'express';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as ConnectMongo from 'connect-mongo';
import * as morgan from 'morgan';
import * as createError from 'http-errors';
import locks from "mongo-locks";

/* Configure passport */
import './config/passport';
import env from './config/env';
import './config/db';

const MongoStore = ConnectMongo(session);

/* Local stuff */
// const {middlewares} = require("./engine/middlewares/default");
import router from './routes';
import { AssertionError } from 'assert';

const app = express();

/* Configuration */

/* App stuff */
app.use(morgan('dev'));

app.set('view engine', 'ejs');

app.set("layout extractScripts", true);
app.set("layout extractMetas", true);
app.set('trust proxy', 'loopback');
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/* Required for passport */
app.use(session(
  <any> {
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {
      maxAge: new Date(Date.now() + 120 * 3600 * 1000), // 120 days expire
      httpOnly: false
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// for (const middleware of middlewares)   {
//   app.use(middleware);
// }

// app.use("/", express.static(__dirname + '/public')); /* NGINX should take care of that below */
app.use("/", router);
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  if (err instanceof createError.HttpError) {
    res.status(err.statusCode).json({message: err.message});
  } else if (err.name === "ValidationError") {
    const keys = Object.keys((<any> err).errors);
    res.status(422).json({message: (<any> err).errors[keys[0]].message});
  } else if (err instanceof AssertionError) {
    res.status(422).json({message: err.message});
  } else {
    res.status(500).json({message: "Internal error"});
  }
});

async function listen() {
  try {
    const promise = new Promise((resolve, reject) => {
      app.listen(env.port, 'localhost', () => resolve());
      app.once('error', err => reject(err));
    });

    await promise;

    console.log("app started on port", env.port);
  } catch (err) {
    console.error(err);
  }
}

listen();
