var express = require('express');
var path = require('path');
var Promise = require('bluebird');
var http = require('http');
var socketio = require('socket.io');
var xmpp = require('node-xmpp-client');
var sys = require('sys');
var parser = require('body-parser');

var app = express();
var router = express.Router();
var server = http.createServer(app);
app.use(parser.json());

app.use(express.static(__dirname + '/webapp'));
app.use(router);

router.post('/connectxmpp',function(req,res){
	var token = req.body.accessToken;
	var clientId = req.body.clientId;
	var apiKey = req.body.apiKey;	
	var config = {
		"status_message": "A demo Node.js Google Talk", 
		"client": { 
			"jid": "pramitkundu92@gmail.com", 
			"password": "", 
			"host": "talk.google.com", 
			"port": 5222, 
			"reconnect": true ,
			"client_id": clientId,
			"api_key": apiKey
		}, 
		"allow_auto_subscribe": true, 
		"command_argument_separator": /\s*\;\s*/ 
	};
	const conn = new xmpp.Client(config.client);
	conn.on('online',function(){
		res.json('online');
	});
	res.json();
});

server.listen(10000);

console.log('Server is running at http://localhost:10000');