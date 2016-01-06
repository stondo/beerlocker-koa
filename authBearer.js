// 'use strict';

// let passport = require('koa-passport'),    
//     db = require('./lib/mongodb.js'),
//     co = require('co');
    


// function *getToken(accessToken) {
//   var token = yield db.tokens.findOne({ value: accessToken });
//   return token;
// };

// function *getClient(username) {
//   console.log(username);
//   var client = yield db.clients.findOne({ id: username });
//   return client
// };


// passport.serializeUser(function(user, done) {
//   done(null, user._id)
// });

// passport.deserializeUser(function(id, done) {
//   done(null, id)
// });


// let BearerStrategy = require('passport-http-bearer').Strategy
// passport.use('bearer', new BearerStrategy(function(accessToken, done) {

//   co(function *() {
//     try {
//       let token = yield getToken(accessToken);
//       let user = yield getClient(token.userId);
//       return user;      
//     } catch (ex) {
//       console.log('error: ', ex);
//       return null;
//     }
//   }).then(function(user) {
//     done(null, user);
//   });
  
// }));


// exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });