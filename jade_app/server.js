var express = require('express');
var bodyparser = require('body-parser');
var mongojs = require('mongojs');
var events = require('events');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');
var Promise = require('bluebird');
var http = require('http');
var socketio = require('socket.io');
var request = require('request');
var formidable = require('formidable');
var multer = require('multer');

var storage = multer.diskStorage({
	destination: __dirname + '/file_uploads',
	filename: function(req, file, cb){
		cb(null, file.originalname);
	}
});

var upload = multer({storage: storage});

var utils = require(__dirname + '/custom_modules/utils.js');

var app = express();
app.use(bodyparser.json());
var server = http.createServer(app);
utils.initDB('jadeData', ['users']);
var eventEmitter = new events.EventEmitter();

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

jadeRouter.post('/adduser', upload.single('file'), function(req, res){
	/* var form = new formidable.IncomingForm();
	var data= {};
	form.uploadDir = './file_uploads';
	form.keepExtensions = true;
	form.on('fileBegin', function(name, file){
		//file.path = __dirname + '/file_uploads/' + file.name;
	});
	form.on('field', function(field, value){
		if(field != 'resume') 
		{
			data[field] = value;			
		}
	});
	form.parse(req, function(err, fields){		
		eventEmitter.emit('putindb', data);	
		res.end();
	}); */
	res.json();
});

/* eventEmitter.on('putindb', function(data){
	console.log(data);
	utils.insertInDB('users', data).then(function(result){ 
		console.log('*******************inserted');
 	}); 
}); */

server.listen(10000);

console.log('Server is running at http://localhost:10000');