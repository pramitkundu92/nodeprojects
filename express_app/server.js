/*requiring modules*/
var express = require('express');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var Expense = require(__dirname + '/Expense');

/*creating necessary objects from modules*/
var app = express();
var server = http.createServer(app);

/*defining router*/
var contextRoot = '/webapp/express';
var router = express.Router();

/*setting default context root to app*/
app.use(bodyParser.json());
app.use(contextRoot,express.static(__dirname + '/webapp'));
app.use(contextRoot,router);

/*defining rest services for CRUD operations*/
router.post('/save',function(req,res){
	if(req.body['_id']!=undefined){
	    var query = {_id: req.body['_id']};
		Expense.findWithQuery(query)
		.then(function(result){
			Expense.updateRecord(query,req.body).then(function(result){
				Expense.findWithQuery({})
				.then(function(result){
					res.json(result);
				},function(err){	
					console.log(err);
				});
			}); 
		});
	}
	else {
		var expense = new Expense({
			expense_desc: req.body.expense_desc,
			amount: req.body.amount
		});
		expense.save(function(err){
			if(!err){
				Expense.findWithQuery({})
				.then(function(result){
					res.json(result);
				},function(err){	
					console.log(err);
				});
			}
			else{
				console.log(err);
			}
		});
	}
});
router.post('/expenses',function(req,res){
	Expense.findWithQuery({})
	.then(function(result){
		res.json(result);
	},function(err){	
		console.log(err);
	});	
});
router.delete('/delete/:id',function(req,res){
	Expense.deleteRecord(req.params.id)
	.then(function(result){
	    Expense.findWithQuery({})
		.then(function(result){
			res.json(result);
		},function(err){	
			console.log(err);
		});
	},function(err){	
		console.log(err);
	});	
});

/*starting server*/
server.listen(8080); 
console.log('Server is running at port 8080');