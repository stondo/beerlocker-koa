'use strict';

let koaRouter = require('koa-router'),	
	auth = require('../auth.js'),
	users = require('../lib/mongodb.js').users,
	bcrypt = require('co-bcrypt');

let usersRouter = koaRouter();

// usersRouter.get('/', function* (next) {
// 	this.body = '<h3><You are not allowed to access this API. Please login./h3>';		
// });

usersRouter.get('/api/users', auth.isAuthenticated, function* (next) {

	try {
		this.body = yield users.find({});
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

usersRouter.get('/api/users/:id', auth.isAuthenticated, function* (next) {

	try {
		this.body = yield users.findById(this.params.id);
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}
	
});

// Test to see if multiple parametrs GET request works
// usersRouter.get('/api/users/:username/:role', auth.isAuthenticated, function* (next) {

// 	try {
// 		this.body = yield users.find(this.params.username, this.params.role);
// 		this.type = 'json';
// 		this.status = 200;
// 	} catch(ex) {
// 		console.log('Error: ', ex);
// 	}
	
// });


 usersRouter.post('/api/users', auth.isAuthenticated, function* (next) {	
// usersRouter.post('/api/users', function* (next) {	

	console.log('dentro creazione user');
	let user = this.request.body;
	console.log(user);

	if (!user.username) {
	    throw('username required', 400);
	}

	if (!user.password) {
	    throw('password required', 400);
	}

	let salt = yield bcrypt.genSalt(10);
	let hash = yield bcrypt.hash(user.password, salt);
	user.password = hash;
	
	try {		
		console.log('hashed password: ', user);
		yield users.insert(user);
		this.status = 201;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

usersRouter.put('/api/users/:id', auth.isAuthenticated, function* (next) {

	try {
		if (this.request.body.qty) {
			yield users.updateById(this.params.id, { $set: { qty: this.request.body.qty } });
			this.type = 'json';
			this.status = 200;	
		}
		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

usersRouter.del('/api/users/:id', auth.isAuthenticated, function* (next) {

	try {		
		yield users.remove({ _id: this.params.id });
		this.type = 'json';
		this.status = 204;		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});


module.exports = usersRouter;
