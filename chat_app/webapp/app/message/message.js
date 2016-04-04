meanApp.controller('MessageCtrl',['$scope','$http','$stateParams','$timeout','$state',function($scope,$http,$stateParams,$timeout,$state){
	$scope.user = {};
	$scope.user = angular.copy($stateParams.user);
	$scope.from = $stateParams.from;
	$scope.msg = {};
	$scope.msg.to = $scope.user.userid;
	$scope.msg.from = $scope.from;
	
	function loadUsers(){
		$http.get(appUrl + '/getallusers').success(function(response){
			var arr = [];
			angular.forEach(response,function(usr){
				if(usr.userid !== $scope.from)
					arr.push(usr);
			});
			$scope.userList = angular.copy(arr);	
		});
	};
	
	loadUsers();
	$scope.msgList = [];
	
	var socket;
	var socket2 = io(); //track online/offline of users
	
	socket2.on('online',function(data){ //check who came online
		console.log(data + ' came online');
		loadUsers();
	});
	socket2.on('offline2',function(data){ //check who went offline
		console.log(data + ' went offline');
		loadUsers();
	});
	
	$scope.onChat = false;
	
	$scope.selectUserToChat = function(user){ //select user to chat with
		if($scope.onChat)
		{
			$scope.close();
		}
		$scope.onChat = true;
		$scope.user = user;
		$scope.userTyping = false;
		$scope.msg.to = $scope.user.userid;
		
		socket = io({query : {to : $scope.msg.to, from : $scope.msg.from}});
		
		socket.emit('load chats'); //load chat event emitted
		socket.on('chat load', function(data){ //chats set to msgList in scope
			$scope.$apply(function(){
				$scope.msgList = data;
			});
		});
	
		socket.on('chat update', function(data){ //updating chat list after sending message
			$scope.$apply(function(){
				$scope.msgList.push(data);
			});
		});

		socket.on('start typing2',function(){
			$timeout(function(){
				$scope.userTyping = true;
			},0);
		});	
		socket.on('stop typing2',function(){
			$timeout(function(){
				$scope.userTyping = false;
			},0);
		});	
	};
		
	$scope.keydownEvent = function(event){
		if(event.keyCode != 13)
		{	
			socket.emit('start typing1'); 
		}		
	};
		
	$scope.sendMessage = function(event){
		if(((event.type=='keypress' && event.keyCode == 13) || event.type=='click') && $scope.msg.message!=undefined && $scope.msg.message.trim()!='')
		{
			$('#msgbox').blur();
			$scope.msg.time = new Date().toString().substring(0,24);
			socket.emit('message sent', $scope.msg);
			socket.emit('stop typing1');
			$scope.msg.message = '';
		}	
	};
	
	$scope.close = function(){
		$scope.onChat = false;
		if(socket!=undefined)
			socket.disconnect();
	};	
	
	$scope.exitChat = function(){
		$scope.close();
		socket2.emit('offline', $scope.from); //going offline
		socket2.disconnect();
		$state.go('home',{userid : $scope.from});
	};
}]);