'use strict';

let codeModel = class Code {
	constructor(value, clientId, redirectUri, userId) {
		this.value = value;
		this.clientId = clientId;
		this.redirectUri = redirectUri;
		this.userId = userId;
	}

	toString() {
  	return '(' + this.value + ', ' + this.clientId + ', ' + this.redirectUri + ', ' + this.userId + ')';
  }

}

module.exports = codeModel;