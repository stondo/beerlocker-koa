'use strict';

let koaRouter = require('koa-router'),	
	auth = require('../auth.js'),
	mongo = require('../lib/genericCoMonkApi.js'),
	UserModel = require('../lib/models.js').User,
	utils = require('../utils.js');
	

let usersRouter = koaRouter();


usersRouter.get('/api/users', auth.isAuthenticated, function* (next) {

	try {
		this.body = yield mongo.getAll('users');
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

usersRouter.get('/api/users/:id', auth.isAuthenticated, function* (next) {
	
	try {
		this.body = yield mongo.getById('users', this.params.id);
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}
	
});

 usersRouter.post('/api/users', auth.isAuthenticated, function* (next) {	

	let body = this.request.body;

	let userModelParams = Object.keys(body).map((k) => body[k]);
	
	let user = new UserModel(...userModelParams);

	if (!user.username) {
	    this.throw('username required', 400);
	}

	if (!user.password) {
	    this.throw('password required', 400);
	}

	yield user.hashPassword();
	
	try {		
		yield mongo.insert('users', user);
		this.status = 201;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

usersRouter.put('/api/users/:id', auth.isAuthenticated, function* (next) {
    
    let updateExpr = this.request.body;

    if ('password' in updateExpr) {
		updateExpr.password = yield utils.hashPassword(updateExpr.password);
	}
	
	try {
		yield mongo.update('users', this.params.id, updateExpr);
		this.type = 'json';
		this.status = 200;			
		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

usersRouter.del('/api/users/:id', auth.isAuthenticated, function* (next) {

	try {		
		yield mongo.removeOne('users', { _id: this.params.id });
		this.type = 'json';
		this.status = 204;		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});


module.exports = usersRouter;
