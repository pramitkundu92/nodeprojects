var appName = 'Just started with Jade';

var jadeApp = angular.module('jadeApp', ['ui.router']);

jadeApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
	angular.forEach(appStates, function(appState){
		$stateProvider.state(appState.name, appState);
	});
	$urlRouterProvider.otherwise('/');
}]);