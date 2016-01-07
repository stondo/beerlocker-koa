'use strict';

let tokenModel = class Token {
	constructor(value, clientId, userId) {
		this.value = value;
		this.clientId = clientId;  		
		this.userId = userId;
	}

	toString() {
  	return '(' + this.value + ', ' + this.clientId + ', ' + this.userId + ')';
  }

}

module.exports = tokenModel;