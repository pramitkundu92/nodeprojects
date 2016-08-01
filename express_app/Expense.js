//db module for creating schema and model
var mongoose = require('mongoose');
var Promise = require('bluebird');
var Schema = mongoose.Schema;

/*connecting db with mongoose*/
mongoose.connect('mongodb://127.0.0.1:27017/expenses');
var seq_id = 3;

var expenseSchema = new Schema({
	expense_id: Number,
	expense_desc: String,
	amount: Number,
	expense_date: Date
});
expenseSchema.pre('save',function(next){
	this.expense_id = seq_id++;	
	this.expense_date = new Date();
	next();
});

expenseSchema.statics.findWithQuery = Promise.method(function(query){
	return this.find({}, function(err,data){
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

var Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;