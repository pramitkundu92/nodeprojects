var express = require('express');
var bodyparser = require('body-parser');
var mongojs = require('mongojs');
var events = require('events');
//var fs = require('fs');
var path = require('path');
var multer = require('multer');
var mime = require('mime-types');
var Promise = require('bluebird');
var http = require('http');
var socketio = require('socket.io');
var request = require('request');

var app = express();
var server = http.createServer(app);

/********** using jade templating system **************/

var jadeContextRoot = '/webapp/node/jade';
app.set('views', __dirname + '/webapp/jade_partials'); //needed only when the jade views folder name is different than 'views'
app.set('view engine', 'jade');
app.use(jadeContextRoot, express.static(__dirname + '/webapp'));
var jadeRouter = express.Router();
app.use(jadeContextRoot, jadeRouter);

jadeRouter.get('/', function(req,res){
	res.render('layout',{
		title : 'Using Jade Templating System',
		contextRoot : jadeContextRoot
	});
});
jadeRouter.get('/index', function(req,res){
	res.render('index',{
		title : 'Using Jade Templating System',
		contextRoot : jadeContextRoot
	});
});
jadeRouter.get('/about', function(req,res){
	res.render('about',{
		title : 'Using Jade Templating System',
		contextRoot : jadeContextRoot
	});
});
jadeRouter.get('/signup',function(req,res){
	res.render('signup', {
		title : 'Using Jade Templating System',
		contextRoot : jadeContextRoot
	});
});

/********** using jade templating system **************/

server.listen(10000);

console.log('Server is running at http://localhost:10000');