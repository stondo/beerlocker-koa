'use strict';

let koaRouter = require('koa-router'),	
	db = require('../lib/mongodb.js'),
	bcrypt = require('co-bcrypt'),
	auth = require('../auth.js');

let clientsRouter = koaRouter();


/*clientsRouter.get('/api/beers', auth.isAuthenticated, function* (next) {

	try {
		this.body = yield beers.find({});
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});*/

clientsRouter.get('/api/clients', auth.isAuthenticated, function* (next) {

	try {		
		this.body = yield db.clients.find({ userId: this.req.user._id });
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}
	
});

/*clientsRouter.put('/api/beers/:id', auth.isAuthenticated, koaBody, function* (next) {

	try {
		if (this.request.body.qty) {
			yield beers.updateById(this.params.id, { $set: { qty: this.request.body.qty } });
			this.type = 'json';
			this.status = 200;	
		}
		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});*/

/*clientsRouter.del('/api/beers/:id', auth.isAuthenticated, koaBody, function* (next) {

	try {		
		yield beers.remove({ _id: this.params.id });
		this.type = 'json';
		this.status = 204;		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});*/


clientsRouter.post('/api/clients', auth.isAuthenticated, function* (next) {	

	//console.log('req user id', this.req.user._id);
	let client = this.request.body;
	client.userId = this.req.user._id;

	console.log(client);

	if (!client.id) {
		throw('id required', 400);
	}

	if (!client.name) {
		throw('name required', 400);
	}

	if (!client.secret) {
		throw('secret required', 400);
	}

	if (!client.userId) {
		throw('id userId', 400);
	}	
	

	let salt = yield bcrypt.genSalt(10);
	let hash = yield bcrypt.hash(client.secret, salt);
	client.secret = hash;	
	
	try {
		yield clients.insert(client);
		this.status = 201;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});


module.exports = clientsRouter;
