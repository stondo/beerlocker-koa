// 'use strict';

// let passport = require('koa-passport'),    
//     co = require('co'),
//     db = require('./lib/mongodb.js'),
//     bcrypt = require('co-bcrypt');





// passport.serializeUser(function(user, done) {
//   done(null, user._id)
// });

// passport.deserializeUser(function(id, done) {
//   done(null, id)
// });



// passport.use(new ClientPasswordStrategy(
//   function(clientId, clientSecret, done) {
//     Clients.findOne({ clientId: clientId }, function (err, client) {
//       if (err) { return done(err); }
//       if (!client) { return done(null, false); }
//       if (client.clientSecret != clientSecret) { return done(null, false); }
//       return done(null, client);
//     });
//   }
// ));




