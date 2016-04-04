meanApp.controller('LoginCtrl',['$scope','$http','$state',function($scope,$http,$state){
	$scope.user = {};
	$scope.login = function(){
		$http.post(appUrl + '/login', $scope.user).success(function(response){
			if(response.authenticated)
				$state.go('home',{userid : $scope.user.userid});
			else	
				$scope.message = 'Invalid login'; 
		});
	};
}]);