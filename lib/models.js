'use strict';

let userModel = require('../models/user.js'),
	beerModel = require('../models/beer.js'),
	clientModel = require('../models/client.js'),
	codeModel = require('../models/code.js'),
	tokenModel = require('../models/token.js');


module.exports.User = userModel;
module.exports.Beer = beerModel;
module.exports.Client = clientModel;
module.exports.Code = codeModel;
module.exports.Token = tokenModel;
