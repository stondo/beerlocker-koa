'use strict';

let db = require('./mongodb.js');

module.exports.getById = function *(model, id) {
	return yield db[model].findById(id);
}

module.exports.getOneByField = function *(model, fieldName, fieldValue) {
	return yield db[model].findOne({ fieldName : fieldValue });
}

module.exports.getAll = function *(model) {
	return yield db[model].find({});
}

module.exports.getAllByField = function *(model, fieldName, fieldValue) {
	return yield db[model].find({ fieldName : fieldValue });
}

module.exports.updateField = function *(model, id, updateObject) {
	return yield db[model].updateById(id, { $set: updateObject });
}

module.exports.create = function *(model, newObject) {
	return yield db[model].updateById(id, newObject);
}

module.exports.removeOne = function *(model, id, primaryKeyField) {
	let pkField ? primaryKeyField === null : '_id';
	return yield db[model].remove( { pkField :  id } );
}

module.exports.removeAll = function *(model) {
	return yield db[model].remove({});
}