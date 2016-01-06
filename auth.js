'use strict';

let passport = require('koa-passport'),    
    co = require('co'),
    db = require('./lib/mongodb.js'),
    bcrypt = require('co-bcrypt'),
    oauth2orize = require('koa-oauth2orize'),
    login = require("koa-ensure-login"),
    utils = require('./lib/utils.js'),
    compose = require('koa-compose');
    


// User
function *getUserByUsername(username) {
  var user = yield db.users.findOne({ username: username });
  return user;
};

function *getUserById(userId) {
  var user = yield db.users.findById(userId);
  return user;
};


// Client
function *getClient(id) {
  var client = yield db.clients.findById(id);
  return client;
};

function *getClientById(id) {
  var client = yield db.clients.findOne({ id: id });
  return client;
};

function *getClientByClientName(username) {
  console.log(username);
  var client = yield db.clients.findOne({ id: username });
  return client
};


// Code
function *getCode(code) {
  var client = yield db.codes.findOne({ value: code});
  return client;
};

function *insertCode(code) {
  return yield db.codes.insert(code);  
};

function *removeCode(code) {
  return yield db.codes.remove({ value: code });  
};


// Token
function *getToken(accessToken) {
  var token = yield db.tokens.findOne({ value: accessToken });
  return token;
};

function *insertToken(token) {
  return yield db.tokens.insert(token);  
};



passport.serializeUser(function(user, done) {
  done(null, user._id)
});

passport.deserializeUser(function(id, done) {
  done(null, id)
});


/*var LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {

  co(function *() {
    try {
      let user = yield getUser(username);
      if (yield bcrypt.compare(password, user.password)) {
		    return user;
	    } else {
		      return null;  	
	      }
    } catch (ex) {
      console.log('errore: ', ex);
      return null;
    }
  }).then(function(user) {
    console.log('trovato: ', user);
    done(null, user);
  });
  
}));*/

let BasicStrategy = require('passport-http').BasicStrategy;
passport.use('basic', new BasicStrategy(function(username, password, done) {
  console.log('passo basic');
  co(function *() {
    try {
      let user = yield getUserByUsername(username);
      if (yield bcrypt.compare(password, user.password)) {
        return user;
      } else {
          return null;    
        }
    } catch (ex) {
      console.log('error: ', ex);
      return null;
    }
  }).then(function(user) {
    console.log('trovato: ', user);
    done(null, user);
  });
  
}));

// Client basic
let ClientBasicStrategy = require('passport-http').BasicStrategy;
passport.use('client-basic', new ClientBasicStrategy(function(username, password, done) {

  co(function *() {
    try {
      let client = yield getClientByClientName(username);
      console.log('client: ', client);
      if (yield bcrypt.compare(password, client.secret)) {
        return client;
      } else {
          return null;    
        }
    } catch (ex) {
      console.log('error: ', ex);
      return null;
    }
  }).then(function(client) {
    done(null, client);
  });
  
}));

//require('./authBearer.js');
let BearerStrategy = require('passport-http-bearer').Strategy;
passport.use('bearer', new BearerStrategy(function(accessToken, done) {
  console.log('passo di qui');
  co(function *() {
    try {
      let token = yield getToken(accessToken);
      console.log('token found: ', token);
      let user = yield getUserById(token.userId);
      console.log('user found: ', user);
      return user;      
    } catch (ex) {
      console.log('error: ', ex);
      return null;
    }
  }).then(function(user) {
    done(null, user);
  });
  
}));

// Client-password
let ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
passport.use('client-password', new ClientPasswordStrategy(function(clientId, clientSecret, done) {

  co(function *() {
    try {
      let client = yield getClientById(clientId);
      console.log('client found client-password: ', client);
      if (yield bcrypt.compare(password, client.secret)) {
        return client;
      } else {
          done(null, false);
        }
    } catch (ex) {
      console.log('error: ', ex);
      done(null, ex);
    }
  }).then(function(client) {
    done(null, client);
  });
  
}));



// Create OAuth 2.0 server
let oAuth2Srv = oauth2orize.createServer();

// Register serialialization function
oAuth2Srv.serializeClient(function(client, done) {
  //done(null, client._id);
  console.log('SERIALIZING CLIENT', client);
  // done(null, client._id);
  done(null, client.id);
});

// Register deserialization function
oAuth2Srv.deserializeClient(function(id, done) {
  console.log('DESERIALIZING CLIENT', id);
  co(function *() {
    try {
      // let client = yield getClient(id);
      let client = yield getClientById(id);
      return client;      
    } catch (ex) {
      console.log('error: ', ex);
      //return null;
      return done(ex);
    }
  }).then(function(client) {
    console.log('client found: ', client);
    return done(null, client);
  }); 

});

// Register authorization code grant type
oAuth2Srv.grant(oauth2orize.grant.code(function(client, redirectUri, user, ares, done) {
  console.log('grant code');
  console.log('client: ', client);
  console.log('redirectUri: ', redirectUri);
  console.log('user: ', user);
  console.log('ares: ', ares);
  // Create a new authorization code
  // let code = new Code({
  //   value: utils.uid(16),
  //   clientId: client._id,
  //   redirectUri: redirectUri,
  //   userId: user._id
  // });
  let code = {
    value: utils.uid(16),
    clientId: client._id,
    redirectUri: redirectUri,
    userId: user._id
  };

  // Save the auth code and check for errors
  co(function *() {
    try {
      yield insertCode(code);
    } catch (ex) {
      console.log('error: ', ex);
      return done(ex);
      //return null;
    }
  }).then(function() {
    console.log('code inserted succesfully.: ', code.value);
    done(null, code.value);
  });
  
}));

// // Exchange authorization codes for access tokens.  The callback accepts the
// // `client`, which is exchanging `code` and any `redirectURI` from the
// // authorization request for verification.  If these values are validated, the
// // application issues an access token on behalf of the user who authorized the
// // code.

// oAuth2Srv.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
//   db.authorizationCodes.find(code, function(err, authCode) {
//     if (err) { return done(err); }
//     if (client.id !== authCode.clientID) { return done(null, false); }
//     if (redirectURI !== authCode.redirectURI) { return done(null, false); }
    
//     var token = utils.uid(256);
//     db.accessTokens.save(token, authCode.userID, authCode.clientID, function(err) {
//       if (err) { return done(err); }
//       done(null, token);
//     });
//   });
// }));

// Exchange authorization codes for access tokens
oAuth2Srv.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, done) {
  console.log('exchange code');
  console.log('client: ', client);
  console.log('code: ', code);
  console.log('redirecturi: ', redirectUri);

  co(function *() {
    try {
        let authCode = yield getCode(code);
        if (authCode === undefined) { return false; }
        if (client._id.toString() !== authCode.clientId) { return false; }
        if (redirectUri !== authCode.redirectUri) { return false; }
        return authCode;
    } catch (ex) {
          console.log('error: ', ex);
        return null;
      } 
  }).then(function (authCode) {
    console.log('code found: ', authCode);

    if (authCode) {   

      co(function *() {
        try {
            yield removeCode(authCode);
          // Create a new access token
              // let token = new Token({
              //   value: utils.uid(256),
              //   clientId: authCode.clientId,
              //   userId: authCode.userId
              // });
              let token = {
                value: utils.uid(256),
                clientId: authCode.clientId,
                userId: authCode.userId
              };
              yield insertToken(token);
              return token;
        } catch(ex) {
          console.log('error: ', ex);
        }
      }).then(function(token) {
        done(null, token);
      });     

    }
    else {
      console.log('either authCode NOT found, or client id mismatch, or redirect UTL mismatch.');
      done(null, false);
    }
  });

}));


// Grant implicit authorization.  The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a token, which is bound to these
// values.

oAuth2Srv.grant(oauth2orize.grant.token(function(client, user, ares, done) {
    // let token = utils.uid(256);

    // db.accessTokens.save(token, user.id, client.clientId, function(err) {
    //     if (err) { return done(err); }
    //     done(null, token);
    // });

   console.log('exchange token');
   console.log('client: ', client);
   console.log('user: ', user);
   console.log('ares: ', ares);

   co(function *() {
      try {
        // Create a new access token
        // let token = new Token({
        //   value: utils.uid(256),
        //   clientId: client.clientId,
        //   userId: user._id
        // });
        let token = {
          value: utils.uid(256),
          clientId: client.clientId,
          userId: user._id
        };

        yield insertToken(token);
        return token;
      } catch(ex) {
        console.log('error: ', ex);
      }
    }).then(function(token) {
      console.log('token inserted: ', token);
      done(null, token);
    });     

}));



// Exchange user id and password for access tokens.  The callback accepts the
// `client`, which is exchanging the user"s name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

oAuth2Srv.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    console.log('exchange password');
    console.log('client: ', client);
    console.log('username: ', username);
    console.log('password: ', password);
    console.log('scope: ', scope);

    // //Validate the client
    // db.clients.findByClientId(client.clientId, function(err, localClient) {
    //     if (err) { return done(err); }
    //     if(localClient === null) {
    //         return done(null, false);
    //     }
    //     if(localClient.clientSecret !== client.clientSecret) {
    //         return done(null, false);
    //     }
    //     //Validate the user
    //     db.users.findByUsername(username, function(err, user) {
    //         if (err) { return done(err); }
    //         if(user === null) {
    //             return done(null, false);
    //         }
    //         if(password !== user.password) {
    //             return done(null, false);
    //         }
    //         //Everything validated, return the token
    //         var token = utils.uid(256);
    //         db.accessTokens.save(token, user.id, client.clientId, function(err) {
    //             if (err) { return done(err); }
    //             done(null, token);
    //         });
    //     });
    // });

    co(function *() {
    try {
        let localClient = yield getClientById(client.id);
        if (localClient === null) { done(null, false); }
        if(localClient.clientSecret !== client.clientSecret) {
            done(null, false);
        }
        return localClient;
    } catch (ex) {
          console.log('error: ', ex);
        return null;
      } 
  }).then(function (localClient) {
    console.log('localClient found: ', localClient);

    if (localClient) {   

      co(function *() {
        try {
            let user = yield getUserByUsername(username);
            if(user === null) {
                done(null, false);
            }
            if(password !== user.password) {
                done(null, false);
            }
            // Everything validated, return the token
            // Create a new access token
              // let token = new Token({
              //   value: utils.uid(256),
              //   clientId: authCode.clientId,
              //   userId: authCode.userId
              // });
              let token = {
                value: utils.uid(256),
                clientId: authCode.clientId,
                userId: authCode.userId
              };
              yield insertToken(token);
              return token;
        } catch(ex) {
          console.log('error: ', ex);
        }
      }).then(function(token) {
        console.log('token found: ', token);
        done(null, token);
      });     

    }
    else {
      console.log('either user NOT found, or client id mismatch, or redirect UTL mismatch.');
      done(null, false);
    }
  });

}));

// Exchange the client id and password/secret for an access token.  The callback accepts the
// `client`, which is exchanging the client"s id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.

oAuth2Srv.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {
    console.log('CLIENT CREDENTIALS');
    //Validate the client
    // db.clients.findByClientId(client.clientId, function(err, localClient) {
    //     if (err) { return done(err); }
    //     if(localClient === null) {
    //         return done(null, false);
    //     }
    //     if(localClient.clientSecret !== client.clientSecret) {
    //         return done(null, false);
    //     }
    //     var token = utils.uid(256);
    //     //Pass in a null for user id since there is no user with this grant type
    //     db.accessTokens.save(token, null, client.clientId, function(err) {
    //         if (err) { return done(err); }
    //         done(null, token);
    //     });
    // });
}));


// Exports
exports.authorization = compose([
  login.ensureLoggedIn(),
  oAuth2Srv.authorization(function(clientId, redirectUri, done) {

      console.log('dentro authorization: ', clientId, redirectUri);
    
    co(function *() {
        try {
          let client = yield getClientById(clientId);
          return client;      
        } catch (ex) {
          console.log('error: ', ex);
          //return null;
          return done(ex);
        }
    }).then(function(client) {
        console.log('client found: ', client, redirectUri);
        // console.log('this req OAuth2: ', this.oauth2);
        // console.log('this req user: ', this.user);
        done(null, client, redirectUri);      
       });
  }),
  function*() {
    console.log('transanciton id: ', this.oauth2.transactionID);
    console.log('req user: ', this.req.user);
    console.log('oauth2 client', this.oauth2.client);

    //this.body = 'cazzo, ci vede o no?';
    yield this.render("dialog", { transactionID: this.oauth2.transactionID, user: this.req.user, client: this.oauth2.client });
  }
]);

// user decision endpoint
//
// `decision` middleware processes a user"s decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

exports.decision = compose([
  login.ensureLoggedIn(),
  oAuth2Srv.decision()
]);


// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = compose([
  oAuth2Srv.errorHandler(),
  passport.authenticate(["basic", "oauth2-client-password"], { session: false }),
  oAuth2Srv.token()
]);

exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session : false });
exports.isClientBasicAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isClientPasswordAuthenticated = passport.authenticate('client-password', { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });