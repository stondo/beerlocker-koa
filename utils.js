'use strict';

let bcrypt = require('co-bcrypt');

exports.uid = function (len) {
  let buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (let i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.hashPassword = function * hashPassword(password) {			
		let salt = yield bcrypt.genSalt(10);
		return yield bcrypt.hash(password, salt);	
	}