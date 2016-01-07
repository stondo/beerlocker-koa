'use strict';

let koaRouter = require('koa-router'),
    auth = require('../auth.js');


// Auth Routes
let au = new koaRouter();

au.get('/api/oauth2/authorize', auth.isAuthenticated, auth.authorization);

au.post('/api/oauth2/authorize', auth.isAuthenticated, auth.decision);

//au.post('/api/oauth2/token', auth.isAuthenticated, auth.token);
au.post('/api/oauth2/token', auth.isClientBasicAuthenticated, auth.token);


module.exports = au;