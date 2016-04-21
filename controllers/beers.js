'use strict';

let koaRouter = require('koa-router'),		
	mongo = require('../lib/genericCoMonkApi.js'),
	beerModel = require('../lib/models.js').Beer,
	auth = require('../auth.js');

let beersRouter = koaRouter();


beersRouter.get('/api/beers', auth.isAuthenticated, function* () {

	try {		
		this.body = yield mongo.getAllByFilter('beers', { userId: this.req.user._id });
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

beersRouter.get('/api/beers/:id', auth.isAuthenticated, function* (next) {

	try {		
		this.body = yield mongo.getAllByFilter('beers', { userId: this.req.user._id, _id: this.params.id });
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}
	
});

beersRouter.put('/api/beers/:id', auth.isAuthenticated, function* (next) {

	console.log('params', this.params.id, this.req.user._id);

	try {
		if (this.request.body.quantity) {
					
			yield mongo.updateByFilter('beers', { _id: this.params.id, userId: this.req.user._id }, { quantity: this.request.body.quantity } );
			
			let beer = yield mongo.getOne('beers', { _id: this.params.id, userId: this.req.user._id });

			this.body = beer;
			this.type = 'json';
			this.status = 200;	
		}
		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

beersRouter.del('/api/beers/:id', auth.isAuthenticated, function* (next) {

	try {		
		yield mongo.removeOne('beers', { _id: this.params.id, userId: this.req.user._id });
		this.body = { message: 'Beer removed from the locker!' };
		this.type = 'json';
		this.status = 200;		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});


beersRouter.post('/api/beers', auth.isAuthenticated, function* (next) {	
	
	let body = this.request.body;
	
	let beerModelParams = Object.keys(body).map( (k) => body[k] );	

	let beer = new beerModel(...beerModelParams);
	
	if (!beer.name) {
	    this.throw('name required', 400);
	}

	if (!beer.type) {
	    this.throw('type required', 400);
	}

	if (!beer.quantity) {
	    this.throw('quantity required', 400);
	}

	beer.userId = this.req.user._id;

	try {
		yield mongo.insert('beers', beer);
		this.body = { message: 'Beer added to the locker!', data: beer };
		this.type = 'json';
		this.status = 201;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});


module.exports = beersRouter;
