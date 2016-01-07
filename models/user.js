'use strict';

let userModel = class User {
	constructor(username, password, role) {
		this.username = username;
		this.password = password;  		
		this.role = role;
	}

	toString() {
  	return '(' + this.username + ', ' + this.password + ', ' + this.role + ')';
  }

}

module.exports = userModel;