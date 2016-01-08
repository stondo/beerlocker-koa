'use strict';

let passport = require('koa-passport'),    
    co = require('co'),
    mongo = require('./lib/genericCoMonkApi.js'),    

    /*db = require('./lib/mongodb.js'),  */

    models = require('./lib/models.js'),
    bcrypt = require('co-bcrypt'),
    oauth2orize = require('koa-oauth2orize'),
    login = require("koa-ensure-login"),
    utils = require('./utils.js'),
    compose = require('koa-compose');


/*// User
function *getUserByUsername(username) {
  let user = yield db.users.findOne({ username: username });
  return user;
};

function *getUser(userId) {
  let user = yield db.users.findById(userId);
  return user;
};


// Client
function *getClient(id) {
  let client = yield db.clients.findById(id);
  return client;
};

function *getClientById(id) {
  let client = yield db.clients.findOne({ id: id });
  return client;
};

function *getClientByClientName(username) {
  console.log(username);
  let client = yield db.clients.findOne({ id: username });
  return client
};


// Code
function *getCode(code) {  
  let res = yield db.codes.findOne({ value: code});  
  return res;
};

function *insertCode(code) {
  return yield db.codes.insert(code);  
};

function *removeCode(code) {
  return yield db.codes.remove({ value: code });  
};


// Token
function *getToken(accessToken) {
  let token = yield db.tokens.findOne({ value: accessToken });
  return token;
};

function *insertToken(token) {
  return yield db.tokens.insert(token);  
};*/



passport.serializeUser((user, done) => {
  done(null, user._id)
});

passport.deserializeUser((id, done) => {
  done(null, id)
});


/*let LocalStrategy = require('passport-local').Strategy
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
passport.use('basic', new BasicStrategy( (username, password, done) => {
  console.log('passo da basic');
  co(function *() {
    try {
      /*let user = yield getUserByUsername(username);*/
      let user = yield mongo.getOne('users', { username : username });
      if (yield bcrypt.compare(password, user.password)) {
        return user;
      } else {
          return null;    
        }
    } catch (ex) {
      console.log('error: ', ex);
      return null;
    }
  }).then((user) => {
    console.log('user found basic: ', user);
    done(null, user);
  });
  
}));

// Client basic
let ClientBasicStrategy = require('passport-http').BasicStrategy;
//console.log('BASIC STRATEGY: ', ClientBasicStrategy);
passport.use('client-basic', new ClientBasicStrategy( (username, password, done) => {
  console.log('passo da client basic');
  co(function *() {
    try {
      /*let client = yield getClientByClientName(username);*/
      console.log(username);
      let client = yield mongo.getOne('clients', { id : username });
      console.log('client: ', client);
      if (yield bcrypt.compare(password, client.secret)) {
        console.log('if');
        return client;
      } else {
        console.log('else');
          return null;    
        }
    } catch (ex) {
      console.log('error: ', ex);
      return null;
    }
  }).then((client) => {
    console.log('client found client-basic: ', client);
    done(null, client);
  });
  
}));

//require('./authBearer.js');
let BearerStrategy = require('passport-http-bearer').Strategy;
//console.log('BEARER STRATEGY: ', BearerStrategy);
passport.use('bearer', new BearerStrategy( (accessToken, done) => {
  console.log('passo da bearer');
  co(function *() {
    try {
      /*let token = yield getToken(accessToken);*/
      let token = yield mongo.getOne('tokens', { value: accessToken });
      console.log('token found: ', token, token.userId);
      //let user = yield getUser(token.userId);

      /*let client = yield getClient(token.clientId);*/
      let client = yield mongo.getOne('clients', { _id: token.clientId} );
      console.log('client found: ', client);

      return client;      

    } catch (ex) {
      console.log('error: ', ex);
      return null;
    }
  }).then((client) => {
    console.log('client found bearer: ', client);
    done(null, client);
  });
  
}));


// Create OAuth 2.0 server
let oAuth2Srv = oauth2orize.createServer();

// Register serialialization function
oAuth2Srv.serializeClient((client, done) => {
  //done(null, client._id);
  console.log('SERIALIZING CLIENT', client);
  // done(null, client._id);
  done(null, client.id);
});

// Register deserialization function
oAuth2Srv.deserializeClient((id, done) => {
  console.log('DESERIALIZING CLIENT', id);
  co(function *() {
    try {      
      //let client = yield getClientById(id);
      let client = yield mongo.getOne('clients', { id: id });
      return client;      
    } catch (ex) {
      console.log('error: ', ex);
      //return null;
      return done(ex);
    }
  }).then((client) => {
    console.log('client found: ', client);
    return done(null, client);
  }); 

});

// Register authorization code grant type
oAuth2Srv.grant(oauth2orize.grant.code( (client, redirectUri, user, ares, done) => {
  console.log('grant code');
  console.log('client: ', client);
  console.log('redirectUri: ', redirectUri);
  console.log('user: ', user);
  console.log('ares: ', ares);

  // Create a new authorization code
  let code = new models.Code(
    utils.uid(16),
    client._id,
    redirectUri,
    user._id
  );
 
  // Save the auth code and check for errors
  co(function *() {
    try {
      /*yield insertCode(code);*/
      yield mongo.insert('codes', code);
    } catch (ex) {
      console.log('error: ', ex);
      return done(ex);
      //return null;
    }
  }).then(() => {
    console.log('code inserted succesfully.: ', code.value);
    done(null, code.value);
  });
  
}));


// Exchange authorization codes for access tokens
oAuth2Srv.exchange(oauth2orize.exchange.code( (client, code, redirectUri, done) => {
  console.log('exchange code');
  console.log('client: ', client);
  console.log('code: ', code);
  console.log('redirecturi: ', redirectUri);

  co(function *() {
    try {
        //let authCode = yield getCode(code);
        let authCode = yield mongo.getOne('codes', { value : code });
        console.log('authCode: ', authCode);

        if (authCode === undefined) { console.log('undefined'); return false; }
        if (client._id.toString() !== authCode.clientId.toString()) { console.log('clientId toString'); return false; }
        if (redirectUri !== authCode.redirectUri) { console.log('redirectUri'); return false; }

        return authCode;

    } catch (ex) {
          console.log('error: ', ex);
        return null;
      } 
  }).then( (authCode) => {
    console.log('code found: ', authCode);

    if (authCode) {   

      co(function *() {
        try {
            /*yield removeCode(authCode.value);*/
            yield mongo.removeOne('codes', { value: authCode.value});

            // Create a new access token
            let token = new models.Token(
              utils.uid(256),
              authCode.clientId,
              authCode.userId
            );
              
            /*yield insertToken(token);*/
            yield mongo.insert('tokens', token);
            return token;

        } catch(ex) {
          console.log('error: ', ex);
        }
      }).then( (token) => {
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

oAuth2Srv.grant(oauth2orize.grant.token( (client, user, ares, done) => {

   console.log('exchange token');
   console.log('client: ', client);
   console.log('user: ', user);
   console.log('ares: ', ares);

   co(function *() {
      try {
        // Create a new access token
        let token = new models.Token(
          utils.uid(256),
          client.clientId,
          user._id
        );
     
        /*yield insertToken(token);*/
        yield mongo.insert('tokens', token);
        return token;

      } catch(ex) {
          console.log('error: ', ex);
      }
    }).then( (token) => {
        console.log('token inserted: ', token);
        done(null, token);
      });     

}));



// Exchange user id and password for access tokens.  The callback accepts the
// `client`, which is exchanging the user"s name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

oAuth2Srv.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
    console.log('exchange password');
    console.log('client: ', client);
    console.log('username: ', username);
    console.log('password: ', password);
    console.log('scope: ', scope);


    co(function *() {
      try {
          /*let localClient = yield getClientById(client.id);*/
          let localClient = yield mongo.getOne('clients', { id: client.id });

          if (localClient === null) { done(null, false); }
          if(localClient.clientSecret !== client.clientSecret) {
              done(null, false);
          }

          return localClient;

      } catch (ex) {
            console.log('error: ', ex);
          return null;
        } 
    }).then( (localClient) => {
        console.log('localClient found: ', localClient);

        if (localClient) {   

          co(function *() {
            try {
                /*let user = yield getUserByUsername(username);*/
                let user = yield mongo.getOne({username: username});
                if(user === null) {
                    done(null, false);
                }
                if(password !== user.password) {
                    done(null, false);
                }
                // Everything validated, return the token
                // Create a new access token
                  let token = new models.Token(
                    utils.uid(256),
                    localClient.clientId,
                    localClient.userId
                  );
                 
                  /*yield insertToken(token);*/
                  yield mongo.insert('tokens', token);
                  return token;

            } catch(ex) {
              console.log('error: ', ex);
            }
          }).then((token) => {
              console.log('returned token: ', token);
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

oAuth2Srv.exchange(oauth2orize.exchange.clientCredentials( (client, scope, done) => {
    console.log('CLIENT CREDENTIALS', client, scope);

    //Validate the client
    co (function *() {
      try {
        /*let localClient = yield getClient(client.clientId);*/
        let localClient = yield mongo.getById('clients', client.clientId);

        if(localClient === null) {
          done(null, false);
        }
        if (yield bcrypt.compare(localClient.clientSecret, client.clientSecret)) {
          done(null, false);
        }
        // Everything validated, return the token
        // Create a new access token
        //Pass in a null for user id since there is no user with this grant types
        let token = new models.Token(
          utils.uid(256),
          localClient.clientId,
          null
        );
             
        /*yield insertToken(token);*/
        yield mongo.insert('tokens', token);

        return token;
      } catch (ex) {
        console.log('error client credentials: ', ex);
      }

    }).then( () => {
        console.log('returned token: ', token);
        done(null, token);
      }); 

}));


// Exports
exports.authorization = compose([
  login.ensureLoggedIn(),
  oAuth2Srv.authorization( (clientId, redirectUri, done) => {

    console.log('dentro authorization: ', clientId, redirectUri);
    
    co(function *() {
        try {
          /*let client = yield getClientById(clientId);*/
          let client = yield mongo.getOne('clients', { id: clientId });

          return client;      

        } catch (ex) {
          console.log('error: ', ex);
          //return null;
          return done(ex);
        }
    }).then((client) => {
        console.log('client found: ', client, redirectUri);        
        done(null, client, redirectUri);      
       });
  }),
  function *() {
    console.log('transanciton id: ', this.oauth2.transactionID);
    console.log('req user: ', this.req.user);
    console.log('oauth2 client', this.oauth2.client);
    
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
  //passport.authenticate(["basic", "oauth2-client-password"], { session: false }),
  oAuth2Srv.token()
]);

exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session : false });
exports.isClientBasicAuthenticated = passport.authenticate('client-basic', { session : false });
/*exports.isClientPasswordAuthenticated = passport.authenticate('oauth2-client-password', { session : false });*/
//exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });