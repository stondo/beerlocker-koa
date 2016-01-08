'use strict';

let passport = require('koa-passport'),
	koaRouter = require('koa-router'),	
	auth = require('../auth.js');

let mainRouter = koaRouter();

mainRouter.get('/', auth.isAuthenticated, function* () {

	this.body = { message: 'You are running dangerously low on beer!' };
	this.type = 'json';

});

// mainRouter.get('/', function* (next) {
// 	//this.body = yield this.render('dialog');
// 	//this.body = 'You are not allowed to access this API. Please login.';
// 	this.body = 'This is the home page.';
// 	//this.type = 'text/plain; charset=utf-8';
// });

// mainRouter.get('/token/:accessToken', auth.isAuthenticated, function* (next) {

// 	console.log('accessToken: ', this.params.accessToken);
// 	//console.log('accessToken req: ', this.req.accessToken);

// 	try {		
// 		this.body = yield db.tokens.findOne({ value: this.params.accessToken });
// 		this.type = 'json';
// 		this.status = 200;
// 	} catch(ex) {
// 		console.log('Error: ', ex);
// 	}
// });

/*// POST /login
mainRouter.post('/login',
  passport.authenticate('basic', {
    session: false
  });
);*/

mainRouter.get('/logout', function*(next) {
  this.logout();
  this.redirect('/');
});


module.exports = mainRouter;