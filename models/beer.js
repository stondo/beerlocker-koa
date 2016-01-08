'use strict';

let beerModel = class Beer {
	constructor(name, type, qty) {
		this.name = name;
		this.type = type;  		
		this.qty = qty;
	}

	toString() {
  		return this._id === null ? '(' + this.value + ', ' + this.type + ', ' + this.qty + ')' : '(' + this.value + ', ' + this.type + ', ' + this.qty + ')';
  	}

}

module.exports = beerModel;