import Router from 'express-promise-router';
import { loggedIn } from './utils';
import oauthServer from '../config/oauth';
import { OAuthClient } from '../models';
import server from '../config/oauth';

const router = Router();

export default router;

router.get('/authorize', loggedIn,
  oauthServer.authorize((clientID, redirectURI, done) => {
    // OAuthClient.findById(clientID, (err, client) => {
    //   if (err) { return done(err); }
    //   if (!client) { return done(null, false); }
    //   if (client.red != redirectURI) { return done(null, false); }
    //   return done(null, client, client.redirectURI);
    // });
    return done(null);
  }), oauthServer.decision());
