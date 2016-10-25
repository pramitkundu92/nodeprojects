var exports = module.exports = {};
var mongojs = require('mongojs');
var Promise = require('bluebird');
var fs = require('fs');

var db;

exports.initDB = function(dbName, collections){
	db = mongojs(dbName, collections);
};

exports.updateInDB = function(collectionName, query, object){
	return new Promise(function(resolve,reject){
		db[collectionName].update(query, object, function(err,data){
			if(!err)
				resolve(data);
			else
				reject(err);
		});
	});
};

exports.insertInDB = function(collectionName, data){
	return new Promise(function(resolve,reject){
		db[collectionName].insert(data, function(err, data){
			if(!err)
				resolve(data);
			else	
				reject(err);
		});
	});
};

exports.findInDB = function(collectionName, query){
	return new Promise(function(resolve,reject){
		db[collectionName].find(query, function(err, data){
			if(!err)
				resolve(data);
			else	
				reject(err);
		});
	});
};

exports.deleteFromDB = function(collectionName, query){
	return new Promise(function(resolve,reject){
		db[collectionName].remove(query, function(err, data){
			if(!err)
				resolve(data);
			else	
				reject(err);
		});
	});
};

exports.findInDBUnique = function(collectionName, query){
	return new Promise(function(resolve,reject){
        console.log(query);
		db[collectionName].findOne(query, function(err, data){
			if(!err)
				resolve(data);
			else	
				reject(err);
		});
	});
};

exports.openFile = function(filename, mode){ //function enclosing the call back based function call and returning a promise
	return new Promise(function(resolve,reject){
		fs.open(filename, mode, function(err,fd){
			if(err)
				reject(err);
			else
				resolve(fd);
		});
	});	
};

exports.getFileStats = function(filename){
	return new Promise(function(resolve,reject){
		fs.stat(filename,function(err,stats){
			if(err)
				reject(err);
			else
				resolve(stats);
		});
	});	
};

exports.readFile = function(fileDescriptor, buff){
	return new Promise(function(resolve,reject){
		fs.read(fileDescriptor, buff, 0, buff.length, 0, function(err,bytes){
			if(err)
				reject(err);
			else
				resolve(buff);
		});
	});	
};

exports.writeFile = function(filename, content){
	return new Promise(function(resolve,reject){
		fs.writeFile(filename,content, function(err){
			if(err)
				reject(err);
			else
				resolve();
		});
	});	
};