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
router.post('/create',function(req,res){
	var expense = new Expense({
		expense_desc: req.body.desc,
		amount: req.body.amount
	});
	Expense.findWithQuery({}).then(function(data){
		console.log(data);
	});
	/* expense.save(function(err){
		if(!err){
			res.json('Expense added successfully');
		}
		else{
			console.log(err);
		}
	}); */
});
router.post('/getexpenses',function(req,res){
	Expense.find({},function(err,expenses){
		if(!err){
			res.json(expenses);
		}
		else{
			console.log(err);
		}
	})
	.and([{
		amount: {$ne: null}
	},{
		expense_desc: {$ne: null}
	}]);	
});

/*starting server*/
server.listen(8080); 
console.log('Server is running at port 8080');