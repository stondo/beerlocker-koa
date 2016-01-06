'use strict';

let views = require('koa-render');

// setup view mapping
// to the handlebars template engine
module.exports.render = views('./views', {
  map: { html: 'handlebars' },
  cache: false
});

