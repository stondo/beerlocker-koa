'use strict';

let koa = require('koa'),
	koaRouter = require('koa-router');

let app = koa(),
	port = process.env.PORT || 3000;

let 
	beersRoutes = require('./controllers/beers.js'),
	mainRoutes = require('./controllers/main.js'),
	authRoutes = require('./controllers/oauth2.js'),
	clientsRoutes = require('./controllers/clients.js'),
	usersRoutes = require('./controllers/users.js');
	

/*console.log(pub);*/
// trust proxy
//app.proxy = true;

// append view renderer
let views = require('koa-views')
//console.log('dirname: ', __dirname + '/views');
app.use(views(__dirname + '/views', {
  map: { html: 'handlebars' },
  cache: false
}));

// let homeRouter = new koaRouter();

// /*homeRouter.get('/', function* (next) {
// 	this.body = yield this.render('dialog');	
// });*/

// homeRouter.get('/', function* (next) {
// 	this.body = yield this.render('dialog', {
// 		transactionID: this.req.oauth2.transactionID, user: this.req.user, client: this.req.oauth2.client
// 	});	
// });


// body parser
let bodyParser = require('koa-bodyparser');
app.use(bodyParser());

// Sessions
let session = require('koa-session')
app.keys = ['s3cr3tk3y'];
app.use(session(app));

let passport = require('koa-passport');
app.use(passport.initialize());
app.use(passport.session());

app
	.use(mainRoutes.routes())
	.use(mainRoutes.allowedMethods())
	.use(authRoutes.routes())
	.use(authRoutes.allowedMethods())
	.use(beersRoutes.routes())	
	.use(beersRoutes.allowedMethods())
	.use(clientsRoutes.routes())	
	.use(clientsRoutes.allowedMethods())
	.use(usersRoutes.routes())
	.use(usersRoutes.allowedMethods());	


app.listen(port);
console.log("Koa server running and listening on port:", port);


