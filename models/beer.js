'use strict';

let beerModel = class Beer {
	constructor(name, type, quantity, userId) {
		this.name = name;
		this.type = type;
		this.quantity = quantity;
		this.userId = userId;
	}

	toString() {
		return '(' + this.value + ', ' + this.type + ', ' + this.quantity + ', ' + this.userId + ')';
	}
}


module.exports = beerModel;