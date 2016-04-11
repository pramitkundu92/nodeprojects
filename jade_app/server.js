var express = require('express');
var bodyparser = require('body-parser');
var mongojs = require('mongojs');
var events = require('events');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var mime = require('mime-types');
var Promise = require('bluebird');
var http = require('http');
var socketio = require('socket.io');
var request = require('request');
//var formidable = require('formidable');
var Busboy = require('busboy');

//importing custom modules
var utils = require(__dirname + '/custom_modules/utils');

var app = express();
var server = http.createServer(app);
app.use(bodyparser.json());
utils.initDB('jadeData',['users']);
var emitter = new events.EventEmitter();
var db = mongojs('jadeData',['users']);

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
var count = 0;
jadeRouter.post('/adduser', function(req, res){
	var data = {};
	var busboy = new Busboy({headers: req.headers});
	busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
		var saveTo = __dirname + '/file_uploads/' + new Date().getTime().toString() + '_' + filename;
		file.pipe(fs.createWriteStream(saveTo));
		count = count + 1;
	});
	busboy.on('field', function(fieldname, value){
		if(fieldname != 'file')
			data[fieldname] = value;
	});
	busboy.on('finish', function(){
		utils.insertInDB('users', data)
		.then(function(result){
			res.json({success: true});
		});
	});
	req.pipe(busboy);
});

server.listen(10000);

console.log('Server is running at http://localhost:10000');