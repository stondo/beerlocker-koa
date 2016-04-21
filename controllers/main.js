'use strict';

let passport = require('koa-passport'),
	koaRouter = require('koa-router'),	
	auth = require('../auth.js');

let mainRouter = koaRouter();

mainRouter.get('/', function* () { //auth.isAuthenticated,

	this.body = { message: 'You are running dangerously low on beer!' };
	this.type = 'json';

});


module.exports = mainRouter;