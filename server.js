'use strict';

let koa = require('koa');	

let app = koa(),
	port = process.env.PORT || 3000;

// Routers
let 
	beersRoutes = require('./controllers/beers.js'),
	mainRoutes = require('./controllers/main.js'),
	authRoutes = require('./controllers/oauth2.js'),
	clientsRoutes = require('./controllers/clients.js'),
	usersRoutes = require('./controllers/users.js');
	
// trust proxy
app.proxy = true;

// append view renderer
let views = require('koa-views');
app.use(views(__dirname + '/views', {
  map: { html: 'handlebars' },
  cache: false
}));

// body parser
let bodyParser = require('koa-bodyparser');
app.use(bodyParser());

// Sessions
let session = require('koa-session');
app.keys = ['s3cr3tk3y'];
app.use(session(app));

// Passport
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


