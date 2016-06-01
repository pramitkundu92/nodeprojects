jadeApp.controller('AppCtrl', ['$scope','userService','$state', function($scope, userService, $state){
	$scope.heading = appName;
	$scope.userData = {};
	$scope.registerUser = function(){
		var data= new FormData();
		data.append('name', $scope.userData.name);
		data.append('file', $scope.userData.file);
		userService.registerUser(data).then(function(result){
			$state.go('home');
		});
	};
	$scope.progressInfo = undefined;
	$scope.uploadFile = function(){
		var socket = io();
		var data= new FormData();
		socket.on('socketId',function(id){
			data.append('socketId', id);
			data.append('file', $scope.uploadData.file);
			userService.uploadFile(data)
			.then(function(result){
				$scope.progressInfo = '100.00';
				console.log(result);
			},function(err){
				console.log('failed cz of - ' + err);
			});
		});
		socket.on('receiveProgressInfo',function(info){
			$scope.$apply(function(){
				$scope.progressInfo = info;
			});	
		});		
	};
}]);