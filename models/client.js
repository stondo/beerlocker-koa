'use strict';

let bcrypt = require('co-bcrypt');

let clientModel = class Client {
	constructor(name, id, secret, userId) {
		this.name = name;
		this.id = id;
		this.secret = secret;
		this.userId = userId;
	}

	* hashSecret() {				
		let salt = yield bcrypt.genSalt(10);
		return this.secret = yield bcrypt.hash(this.secret, salt);	
	}

	toString() {
  		return '(' + this.name + ', ' + this.id + ', ' + this.secret + ', ' + this.userId + ')';
  	}

}

module.exports = clientModel;