'use strict';

let db = require('./mongodb.js');

module.exports.getById = function *(collectionName, id) {
	return yield db[collectionName].findById(id);
}

module.exports.getOne = function *(collectionName, findExpr) {
	return yield db[collectionName].findOne(findExpr);
}

module.exports.getAll = function *(collectionName) {
	return yield db[collectionName].find({});
}

module.exports.getAllByFilter = function *(collectionName, findExpr) {
	return yield db[collectionName].find(findExpr);
}

module.exports.update = function *(collectionName, id, updateExpr) {
	return yield db[collectionName].updateById(id, { $set: updateExpr });
}

module.exports.updateByFilter = function *(collectionName, findExp, updateExpr) {
	return yield db[collectionName].update(findExp, { $set: updateExpr });
}

module.exports.insert = function *(collectionName, newObject) {
	return yield db[collectionName].insert(newObject);
}

module.exports.removeOne = function *(collectionName, removeExpr) {		
	return yield db[collectionName].remove(removeExpr);
}

module.exports.removeAll = function *(collectionName) {
	return yield db[collectionName].remove({});
}