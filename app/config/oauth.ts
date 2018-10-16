import * as oauth2orize from 'oauth2orize';
import { OAuthClient, OAuthCode, OAuthToken } from '../models';
import { OAuthClientDocument } from '../models/oauth-client';

// Create OAuth 2.0 server
const server = oauth2orize.createServer();

export default server;

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated. To complete the transaction, the
// user must authenticate and approve the authorization request. Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session. Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => done(null, client._id));

server.deserializeClient((id, done) => {
  OAuthClient.findById(id, (error, client) => {
    if (error) { return done(error); }
    return done(null, client);
  });
});

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources. It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes. The callback takes the `client` requesting
// authorization, the `redirectUri` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.code((client, redirectUrl, user, ares, done) => {
  const code = new OAuthCode({
    client: client._id,
    user: user._id,
    redirectUrl
  });
  code.save((error) => {
    if (error) { return done(error); }
    return done(null, code._id);
  });
}));

// Grant implicit authorization. The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a token, which is bound to these
// values.

server.grant(oauth2orize.grant.token((client, user, ares, done) => {
  const token = new OAuthToken({
    client: client._id,
    user: user._id
  });
  token.save((error) => {
    if (error) { return done(error); }
    return done(null, token._id);
  });
}));


// Exchange authorization codes for access tokens. The callback accepts the
// `client`, which is exchanging `code` and any `redirectUri` from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange(oauth2orize.exchange.code((client: OAuthClientDocument, codeS, redirectURI, done) => {
  OAuthCode.findById(codeS, (err, code) => {
    if (err) { return done(err); }
    if (!client._id.equals(code.client)) { return done(null, false); }
    if (redirectURI !== code.redirectUrl) { return done(null, false); }

    const token = new OAuthToken({
      client: client._id,
      user: code.user
    });
    token.save(err2 => {
      if (err2) { return done(err2); }
      return done(null, token._id);
    });
  });
}));
