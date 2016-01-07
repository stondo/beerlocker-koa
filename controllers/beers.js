'use strict';

let koaRouter = require('koa-router'),	
	db = require('../lib/mongodb.js'),
	service = require('../lib/genericCoMonkApi.js'),
	auth = require('../auth.js');

let beersRouter = koaRouter();


/*beersRouter.get('/api/beers', auth.isAuthenticated, function* (next) {

	try {
		this.body = yield db.beers.find({});
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});*/

beersRouter.get('/api/beers', auth.isAuthenticated, function* (next) {

	try {
		this.body = yield service.getAll('beers');
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

beersRouter.get('/api/beers/:id', auth.isAuthenticated, function* (next) {

	try {
		this.body = yield db.beers.findById(this.params.id);
		this.type = 'json';
		this.status = 200;
	} catch(ex) {
		console.log('Error: ', ex);
	}
	
});

beersRouter.put('/api/beers/:id', auth.isAuthenticated, function* (next) {

	try {
		if (this.request.body.qty) {
			yield db.beers.updateById(this.params.id, { $set: { qty: this.request.body.qty } });
			this.type = 'json';
			this.status = 200;	
		}
		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});

beersRouter.del('/api/beers/:id', auth.isAuthenticated, function* (next) {

	try {		
		yield db.beers.remove({ _id: this.params.id });
		this.type = 'json';
		this.status = 204;		
	} catch(ex) {
		console.log('Error: ', ex);
	}

});


beersRouter.post('/api/beers', auth.isAuthenticated, function* (next) {	
	
	let beer = this.request.body;
	console.log(beer);
	//this.body = beer;

	if (!beer.name) {
	    throw('name required', 400);
	}

	if (!beer.type) {
	    throw('type required', 400);
	}

	try {
		yield db.beers.insert(beer);
		this.status = 201;
	} catch(ex) {
		console.log('Error: ', ex);
	}

});


module.exports = beersRouter;
