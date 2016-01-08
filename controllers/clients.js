'use strict';

let koaRouter = require('koa-router'),	
	mongo = require('../lib/genericCoMonkApi.js'),
	ClientModel = require('../lib/models.js').Client,
	auth = require('../auth.js');

let clientsRouter = koaRouter();


/*clientsRouter.get('/api/clients', auth.isAuthenticated, function* (next) {

	try {
		this.body = yield clients.find({});
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});*/

clientsRouter.get('/api/clients', auth.isAuthenticated, function* (next) {

	try {		
		this.body = yield mongo.getOne('clients', { userId: this.req.user._id });
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}
	
});

/*clientsRouter.put('/api/clients/:id', auth.isAuthenticated, koaBody, function* (next) {

	try {
		if (this.request.body.qty) {
			yield clients.updateById(this.params.id, { $set: { qty: this.request.body.qty } });
			this.type = 'json';
			this.status = 200;	
		}
		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});*/

/*clientsRouter.del('/api/clients/:id', auth.isAuthenticated, koaBody, function* (next) {

	try {		
		yield clients.remove({ _id: this.params.id });
		this.type = 'json';
		this.status = 204;		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});*/


clientsRouter.post('/api/clients', auth.isAuthenticated, function* (next) {	

	//console.log('req user id', this.req.user._id);
	let body = this.request.body;
	body.userId = this.req.user._id;

	let clientModelParams = Object.keys(body).map((k) => body[k]);

	let client = new ClientModel(...clientModelParams);

	if (!client.id) {
		this.throw('id required', 400);
	}

	if (!client.name) {
		this.throw('name required', 400);
	}

	if (!client.secret) {
		this.throw('secret required', 400);
	}

	if (!client.userId) {
		this.throw('id userId', 400);
	}	
	
	client.hashSecret();

	
	try {
		yield mongo.insert('clients', client);
		this.status = 201;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});


module.exports = clientsRouter;
