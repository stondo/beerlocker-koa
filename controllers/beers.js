'use strict';

let koaRouter = require('koa-router'),		
	mongo = require('../lib/genericCoMonkApi.js'),
	beerModel = require('../lib/models.js').Beer,
	auth = require('../auth.js');

let beersRouter = koaRouter();


function *checkAccessDenied(next) {	
	if (this.query.error === 'access_denied') {
		this.throw(this.query.error, 400);
	}
	else {
		console.log('next', next);
		yield next;
	}
}

beersRouter.get('/api/beers', checkAccessDenied, auth.isAuthenticated, function* () {

	try {
		this.body = yield mongo.getAll('beers');
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

beersRouter.get('/api/beers/:id', auth.isAuthenticated, function* (next) {

	try {
		this.body = yield mongo.getById('beers', this.params.id);
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}
	
});

beersRouter.put('/api/beers/:id', auth.isAuthenticated, function* (next) {

	try {
		if (this.request.body.qty) {
			yield mongo.update('beers', this.params.id, { qty: this.request.body.qty } );
			this.type = 'json';
			this.status = 200;	
		}
		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

beersRouter.del('/api/beers/:id', auth.isAuthenticated, function* (next) {

	try {		
		yield mongo.removeOne('beers', { _id: this.params.id } );
		this.type = 'json';
		this.status = 204;		
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

	try {
		yield mongo.insert('beers', beer);
		this.status = 201;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});


module.exports = beersRouter;
