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

/*defining rest services*/
router.post('/save',function(req,res){
	var expense = new Expense({
		expense_desc: req.body.expenseDesc,
		amount: req.body.amount
	});
	if(req.body['_id']!=undefined){
		console.log(req.body['_id']);
		Expense.findWithQuery({_id: req.body['_id']})
		.then(function(result){
			console.log(result);
			res.json();
		});
	}
	else {
		expense.save(function(err){
			if(!err){
				res.json('Expense added successfully');
			}
			else{
				console.log(err);
			}
		});
	}
});
router.post('/getexpenses',function(req,res){
	Expense.findWithQuery({})
	.then(function(result){
		res.json(result);
	},function(err){	
		console.log(err);
	});	
});

/*starting server*/
server.listen(8080); 
console.log('Server is running at port 8080');