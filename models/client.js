'use strict';

let clientModel = class Client {
	constructor(name, id, secret, userId) {
		this.name = name;
		this.id = id;
		this.secret = secret;
		this.userId = userId;
	}

	toString() {
  	return '(' + this.name + ', ' + this.id + ', ' + this.secret + ', ' + this.userId + ')';
  }

}

module.exports = clientModel;