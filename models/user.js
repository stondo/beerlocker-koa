'use strict';

let bcrypt = require('co-bcrypt');


let userModel = class User {
	constructor(username, password, role) {
		this.username = username;
		this.password = password;
		this.role = role;
	}

	* hashPassword() {			
		let salt = yield bcrypt.genSalt(10);
		return this.password = yield bcrypt.hash(this.password, salt);	
	}

	toString() {
  	return '(' + this.username + ', ' + this.password + ', ' + this.role + ')';
  }

}


module.exports = userModel;