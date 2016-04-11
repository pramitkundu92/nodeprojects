jadeApp.controller('AppCtrl', ['$scope','userService','$state', function($scope, userService, $state){
	$scope.heading = appName;
	$scope.userData = {};
	$scope.registerUser = function(){
		var data= new FormData();
		//data.append('fields', $scope.userData);
		data.append('file', $scope.userData.file);
		userService.registerUser(data).then(function(result){
			$state.go('home');
		});
	};
}]);