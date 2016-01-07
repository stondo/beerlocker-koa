'use strict';

let monk = require('monk'),
	wrap = require('co-monk'),
	db = monk('localhost/beerlocker');


module.exports.users = wrap(db.get('users'));
module.exports.beers = wrap(db.get('beers'));
module.exports.clients = wrap(db.get('clients'));
module.exports.codes = wrap(db.get('codes'));
module.exports.tokens = wrap(db.get('tokens'));

