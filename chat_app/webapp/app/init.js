meanApp.config(['$stateProvider',function($stateProvider){
	angular.forEach(appStates,function(appState){
		$stateProvider.state(appState.name,appState);
	});
}]);