jadeApp.controller('AppCtrl', ['$scope','userService','$state', function($scope, userService, $state){
	$scope.heading = appName;
	$scope.userData = {};
	$scope.registerUser = function(){
		userService.registerUser($scope.userData).then(function(result){
			$state.go('home');
		});
	};
}]);