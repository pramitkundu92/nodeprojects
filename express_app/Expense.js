//db module for creating schema and model
var mongoose = require('mongoose');
var Promise = require('bluebird');
var Schema = mongoose.Schema;

/*connecting db with mongoose*/
mongoose.connect('mongodb://127.0.0.1:27017/expenses');

var expenseSchema = new Schema({
	expense_desc: String,
	amount: Number,
	expense_date: Date
});
expenseSchema.pre('save',function(next){
	this.expense_date = new Date();
	next();
});

expenseSchema.statics.findWithQuery = Promise.method(function(query){
	return this.find(query, function(err,data){
		if(!err)
			return Promise.resolve(data);
		else
			return Promise.reject(err);
	})
	.and([{
		amount: {$ne: null}
	},{
		expense_desc: {$ne: null}
	}]); 		
});

expenseSchema.statics.updateRecord = Promise.method(function(query,update){
	return this.update(query,update,function(err){
		if(!err)
			return Promise.resolve('updated');
		else
			return Promise.reject(err);
	});
});

expenseSchema.statics.deleteRecord = Promise.method(function(id){
    var query = {_id: id};
	return this.remove(query,function(err){
		if(!err)
			return Promise.resolve('deleted');
		else
			return Promise.reject(err);
	});
});

var Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;