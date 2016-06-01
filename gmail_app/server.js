var express = require('express');
var path = require('path');
var Promise = require('bluebird');
var http = require('http');
var socketio = require('socket.io');

var app = express();
var router = express.Router();
var server = http.createServer(app);

app.use(express.static(__dirname + '/webapp'));
app.use(router);

server.listen(10000);

console.log('Server is running at http://localhost:10000');