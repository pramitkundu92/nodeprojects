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
var officegen = require('officegen');
//importing custom modules
var utils = require(__dirname + '/custom_modules/utils');

var app = express();
var router = express.Router();
var router2 = express.Router();
//var db = mongojs('users',['users','messages']);
var emitter = new events.EventEmitter();
var server = http.createServer(app);
var io = socketio(server);
var contextRoot = '/webapp/node/ui';

app.use(contextRoot, express.static(__dirname + '/webapp'));
app.use(bodyparser.json());
app.use(contextRoot, router);
app.use('/webapp/node/ui2', router2);

var userDBName = 'users';
var messageDBName = 'messages';
//using db util modules
utils.initDB('users', [userDBName, messageDBName, 'activities', 'useractivity']);

var storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
	cb(null, file.originalname);
  }
});
var upload = multer({storage : storage});

router.get('/index',function(req,res){
	res.sendFile(__dirname + '/index.html');
});

router.get('/getallusers',function(req,res){
	utils.findInDB(userDBName, {})
	.then(function(result){
		res.json(result);
	});
});

router.post('/adduser',function(req,res){
	var user = {};
	user.name = req.body.name;
	user.password = req.body.password;
	user.userid = req.body.userid;

	utils.insertInDB(userDBName, user)
	.then(function(result){ return utils.findInDB(userDBName, {}); })
	.then(function(result){	res.json(result); });
});

router.delete('/deleteuser/:id',function(req,res){
	var id = req.params.id;
	utils.deleteFromDB(userDBName, {_id: mongojs.ObjectId(id)})
	.then(function(result){ return utils.findInDB(userDBName, {}); })
	.then(function(result){ res.json(result)});
});

router.post('/login',function(req,res){
	var id = req.body.userid;
	utils.findInDBUnique(userDBName, {userid : id})
	.then(function(result){
		if(result!=null)
		{
			if(result.password == req.body.password)
			{
				res.json({authenticated : true});
			}
			else
				res.json({authenticated : false});
		}
		else
			res.json({authenticated : false});
	});
});

router.get('/online/:id', function(req,res){
	var id = req.params.id;
	utils.findInDB(userDBName, {userid : id})
	.then(function(result){
		result[0].online = true;
		return utils.updateInDB(userDBName, {userid : id}, result[0]);
	})
	.then(function(result){
		io.emit('online', id);
		res.end();
	});
});

router.get('/getusername/:id',function(req,res){
	var id = req.params.id;
	utils.findInDB(userDBName, {userid : id})
	.then(function(result){
		res.json(result);
	});
});

//start of chat server configuration
var connectionMap = []; //map all the sockets connected
var timer = '';
var timers = [];
var room = {};
var blogChats = [];
io.on('connection',function(socket){
	console.log('chat server connected');
	addConnection(socket);
	socket.on('load chats', function(data){
		var query = {$or:[{to: socket.handshake.query.to, from : socket.handshake.query.from},{to: socket.handshake.query.from, from : socket.handshake.query.to}]};
		utils.findInDB(messageDBName, query).then(function(result){
			socket.emit('chat load', result); //send to connected client only
		});
	});
	socket.on('message sent', function(data){
		utils.insertInDB(messageDBName, data).then(function(result){
			socket.emit('chat update', result); //send to self
			connectionMap.forEach(function(c){ //search for the corresponding counter chat
				if(c.party2 == socket.handshake.query.to && c.party1 == socket.handshake.query.from)
					io.to(c.socketId).emit('chat update', result);
			});
		});
	});
	socket.on('disconnect', function(){
		removeConnection(socket);
	});
	socket.on('offline',function(id){
		utils.findInDB(userDBName, {userid : id})
		.then(function(result){
			result[0].online = false;
			return utils.updateInDB(userDBName, {userid : id}, result[0]);
		})
		.then(function(result){
			socket.broadcast.emit('offline2', id);
		});
		//send to all connected clients
	});
	socket.on('start typing1',function(){
		clearTimeouts(socket.handshake.query.from);
		connectionMap.forEach(function(c){ //search for the corresponding counter chat
			if(c.party2 == socket.handshake.query.to && c.party1 == socket.handshake.query.from)
			{
				io.to(c.socketId).emit('start typing2');
			}
		});
		timer = setTimeout(function(){
			connectionMap.forEach(function(c){ //search for the corresponding counter chat
				if(c.party2 == socket.handshake.query.to && c.party1 == socket.handshake.query.from)
				{
					io.to(c.socketId).emit('stop typing2');
				}
			});
		}, 2500);
		timers.push({userid: socket.handshake.query.from, timer : timer});
	});
	socket.on('stop typing1',function(){
		connectionMap.forEach(function(c){ //search for the corresponding counter chat
			if(c.party2 == socket.handshake.query.to && c.party1 == socket.handshake.query.from)
			{
				io.to(c.socketId).emit('stop typing2');
			}
		});
	});
	console.log('Number of connections - ' + connectionMap.length);
    //code for discussion room
    var displayRoom = function(){
        console.log('current room - ');
        console.log(room);
    };
    socket.on('joined',function(user){
        room[socket.id] = user;
        socket.emit('initLoad',blogChats);
        displayRoom();
    });
    socket.on('sendMsg',function(data){
        var obj = {
                   socketId: socket.id,
                   msg: data.text,
                   userid: room[socket.id],
                   username: data.username,
                   video: data.video
                 };
        console.log(data.video);
        blogChats.push(obj);
        for(key in room){
          io.to(key).emit('loadMessages',obj);
        }
    });
    socket.on('disconnect',function(){
        delete room[socket.id];
        displayRoom();
    });
    //code for discussion room
});

function clearTimeouts(userid){
	var arr = [];
	timers.forEach(function(each){
		if(each.userid != userid)
		{
			arr.push(each);
		}
		else
		{
			clearTimeout(each.timer);
		}
	});
	timers = arr.slice();
};

function addConnection(socket)
{
	var flag = true;
	connectionMap.forEach(function(c){
		if(c.socketId == socket.id)
		{
			flag = false;
		}
	});
	if(flag)
	{
		var conn = {}; //register a new connection
		conn.party1 = socket.handshake.query.to;
		conn.party2 = socket.handshake.query.from;
		conn.socketId = socket.id;
		connectionMap.push(conn);
	}
	return;
}
function removeConnection(socket)
{
	var len = connectionMap.length;
	var arr = [];
	connectionMap.forEach(function(c){
		if(c.socketId != socket.id)
			arr.push(c);
	});
	connectionMap = arr.slice();
}
// end of chat server configuration

router.get('/downloadmsg/:id',function(req,res){
	var id = req.params.id;
	var message = '';
	var content = '';
	var filename = __dirname + '/messages/' + id + '.txt';
	var temp;
	utils.findInDB(messageDBName, {$or:[{to: id},{from : id}]})
	.then(function(result){ temp = result.slice(); return utils.openFile(filename, 'r'); })
	.then(function(result){
		temp.forEach(function(msg){
			message = '';
			message += 'To : ' + msg.to;
			message += ' From : ' + msg.from;
			message += ' Message : ' + msg.message;
			message += ' At : ' + msg.time;
			content += message + '\r\n';
		});
		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.setHeader('Content-Type','text/plain');
		res.setHeader('FileName', id + '.txt');
		res.send(content);
		return utils.writeFile(filename,content);
	})
	.then(function(result){	});
});

router.post('/upload', upload.single('file'), function(req,res){
	res.json('successfully uploaded');
});

router.get('/downloadfile/:filename',function(req,res){
	var fullname = __dirname + '/uploads/' + req.params.filename;
	var mode = 'r';
	var fileSize;
	var fd;
	//traditional callback based implementation - triangle of DOOM :D
	/* fs.open(fullname, 'r',function(err,fd){
		if(err)
			res.send({message : 'Error in finding file'});
		else
		{
			fs.stat(fullname,function(err,stats){
				fileSize = stats['size'];
				var buff = new Buffer(fileSize);
				fs.read(fd, buff, 0, buff.length, 0, function(err,bytes){
					res.setHeader('Content-disposition', 'attachment; filename=' + fullname);
					res.setHeader('Content-Type',mime.lookup(fullname));
					res.setHeader('FileName', req.params.filename);
					res.send(buff);
				});
			});
		}
	}); */
	//promise chaining based implementation
	utils.openFile(fullname, mode)
	.then(function(result){	fd = result; return utils.getFileStats(fullname); })
	.then(function(result){ var buff = new Buffer(result['size']); return utils.readFile(fd, buff); })
	.then(function(result){
		res.setHeader('Content-disposition', 'attachment; filename=' + fullname);
		res.setHeader('Content-Type', mime.lookup(fullname));
		res.setHeader('FileName', req.params.filename);
		res.send(result);
	})
	.catch(function(err){
		console.log(err);
	});
});

router.get('/getmessagesummary',function(req,res){ //dependent query
	var str = '';
	var message = '';
	var count = 0;
	utils.findInDB(userDBName,{}) 										//find all users with query as  blank  object
	.then(function(result){
		str = '----------Message summary on ' + new Date() + '----------\r\n';
		result.forEach(function(user){ 									//traverse the users array received from promise
			utils.findInDB(messageDBName, {from : user.userid}) 		//search for a single user's messages
			.then(function(result2){
				str += user.name + '\r\n';								// formatted output in str String variable
				result2.forEach(function(msg){  						//traverse the message array received from promise
					message = '';
					message += 'To : ' + msg.to;
					message += ' From : ' + msg.from;
					message += ' Message : ' + msg.message;
					message += ' At : ' + msg.time;
					str += message + '\r\n';
				});
				str += '-----------------------------------------------------------------\r\n'; // formatted output in str String variable
				count++;  												//increase count of users already considered
				if(count == result.length) 								//if all users are considered return response
				{
					res.setHeader('Content-Type', 'text/plain'); 		//adding this so that the file can be downloaded as .txt in front end
					res.send(str);
				}
			});
		});
	})
	.catch(function(err){
		console.log(err);
	});
});

router.get('/runcomplexquery', function(req,res){
	var json = {};
	var count = 0;
	var usr = {};
	utils.findInDB('users', {})
	.then(function(result){
		if(result.length > 0)
		{
			json.data = [];
			result.forEach(function(user){
				utils.findInDB('useractivity', {userid : user.userid})
				.then(function(result2){
					if(result2.length > 0)
					{
						usr = {};
						for(var i=0;i<result2.length;i++)
						{
							var useract = result2[i];
							usr.activities = [];
							utils.findInDB('activities', {actid : useract.actId})
							.then(function(act){
								usr.userid = user.userid;
								usr.activityCount = result2.length;
								usr.activities.push(act[0].name);
								console.log('received data for ' + usr.activities);
								if(usr.activities.length == usr.activityCount)
								{
									count++;
									json.data.push(usr);
									usr = {};
									usr.activities = [];
									if(count >= result.length)
									{
										res.json(json);
									}
								}
							});
							console.log('call made by ' + user.userid);
						}
					}
					else
					{
						count++;
						json.data.push({userid : user.userid, activities : [], activityCount : 0});
						if(count >= result.length)
						{
							res.json(json);
						}
					}
				});
			});
		}
		else
			res.json(json);
	});
});

router2.get('/getdata/:id',function(req,res){ //router2 corresponds to a diff REST api context root /webapp/node/ui2; router corresponds to the previous REST api context root /webapp/node/ui
	var id = req.params.id;
	var obj = {};
	var url = 'http://localhost:10000/webapp/node/ui/runcomplexquery';

	//calling a rest service on same server using REQUEST MODULE
	/* request(url , function(error, response, body){
		var bodyData = JSON.parse(body);
		bodyData.data.forEach(function(d){
			if(d.userid == id)
			{
				utils.findInDB(userDBName,{userid : d.userid})
				.then(function(result){
					obj.username = result[0].name;
					obj.activities = d.activities;
					res.json(obj);
				});
			}
		});
	}); */

	// calling a rest service on same server with HTTP
	var options = {
		host : 'localhost', //hostname
		port : 10000,
		path : '/webapp/node/ui/runcomplexquery', //path to be given after host and port in order to call service
		method : 'GET'
	};
	var req = http.request(options, function(response){
		response.on('data', function(body){
			var bodyData = JSON.parse(body);
			bodyData.data.forEach(function(d){
				if(d.userid == id)
				{
					utils.findInDB(userDBName,{userid : d.userid})
					.then(function(result){
						obj.username = result[0].name;
						obj.activities = d.activities;
						res.json(obj);
					});
				}
			});
		});
		response.on('end', function(){
			//console.log('ended\r\n');
		});
	});
	req.end();
});

router.post('/send', function(req,res){
	var id = req.body.userid;
	var options = {
		host : 'localhost',
		port : 10000,
		path : '/webapp/node/ui2/getdata/' + id,
		method : 'GET'
	};
	var req = http.request(options, function(response){
		response.on('data', function(body){
			var obj = JSON.parse(body);
			var count = obj.activities.length;
			obj.count = count;
			res.json(obj);
		});
	});
	req.end();
});

router2.get('/send/:id', function(req,res){
	var post_data = {};
	post_data.userid = req.params.id;
	var options = {
		host : 'localhost',
		port : 10000,
		path : '/webapp/node/ui/send',
		method : 'POST',
		headers : {
			'Content-Type' : 'application/json' //headers mentioned for the object passed to POST method
		}
	};
	var req = http.request(options, function(response){
		response.on('data',function(data){
			res.json(JSON.parse(data));
		});
	});
	req.write(JSON.stringify(post_data)); //passing data to the POST method
	req.end();
});

router.post('/createdocfile',function(req,res){
    var fileName = __dirname + '/uploads/test_'+ new Date().getTime() + '.docx';
    var data = req.body.text;
    var out = fs.createWriteStream(fileName);
    var docx = officegen ({
        'type': 'docx',
        'subject': 'test',
        'keywords': 'test'
    });

    var pObj = docx.createP();
    pObj.addText (data, { color: '00ffff', back: '000088' });
    pObj.addLineBreak();
    pObj.addText('hahahahhaha');

    pObj = docx.createP();
    pObj.addText (data, { color: '000', back: 'ff0' });

    //other methods - putPageBreak, addImage, createTable

    out.on('close',function(){
        res.send(fileName.split('/')[fileName.split('/').length-1]);
    });
    docx.generate(out);
});

server.listen(10000);

console.log('Server is running at http://localhost:10000');
