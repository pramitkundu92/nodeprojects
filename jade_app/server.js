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
var Busboy = require('busboy');
var formidable = require('formidable');
var util = require('util');

//importing custom modules
var utils = require(__dirname + '/custom_modules/utils');

var storage = multer.diskStorage({
	destination: './file_uploads',
	filename: function(req, file, cb){
		cb(null, file.originalname);
	}
});
var upload = multer({storage: storage}).single('file');

var app = express();
var server = http.createServer(app);
var io = socketio(server);
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
jadeRouter.get('/upload',function(req,res){
	res.render('upload', {
		title : 'Using Jade Templating System',
		contextRoot : jadeContextRoot
	});
});

/********** using jade templating system **************/
jadeRouter.post('/adduser', function(req, res){
	var data = {};
	var busboy = new Busboy({headers: req.headers});
	busboy.on('file', function(fieldname, file, filename, encoding, mimetype){
		var saveTo = __dirname + '/file_uploads/' + new Date().getTime().toString() + '_' + filename;
		file.pipe(fs.createWriteStream(saveTo));
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

jadeRouter.post('/upload', function(req,res){
	var form = new formidable.IncomingForm();
	form.uploadDir = './file_uploads';
	form.keepExtensions = true;
	var socketId = '';	
	form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload');
	  res.end();
    }); 
	form.on('field', function(name, value){
		socketId = value;
	});
    form.on('progress', function(bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
		io.to(socketId).emit('receiveProgressInfo', percent_complete.toFixed(2));
    }); 
    form.on('error', function(err) {
        console.error(err);
    }); 
});
var clientsConnected = [];
io.on('connection',function(socket){
	clientsConnected.push({id: socket.id, socket: socket});	
	socket.emit('socketId', socket.id);
	socket.on('disconnect',function(){
		removeClient(socket.id);
	});
});
function removeClient(socketId){
	var len = clientsConnected.length;
	for(var i=0;i<len;i++){
		if(clientsConnected[i].id == socketId){
			clientsConnected.splice(i,1);
			break;
		}
	}
	return;
};

server.listen(10000);

console.log('Server is running at http://localhost:10000');