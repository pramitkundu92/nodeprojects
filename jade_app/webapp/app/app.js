var appName = 'Just started with Jade';

var jadeApp = angular.module('jadeApp', ['ui.router']);

jadeApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
	angular.forEach(appStates, function(appState){
		$stateProvider.state(appState.name, appState);
	});
	$urlRouterProvider.otherwise('/');
}]);

jadeApp.directive('fileModel',['$parse', function($parse){
	var directive = {};
	directive.restrict = 'A';
	directive.link = function(scope,elem,attrs){
		var model = $parse(attrs.fileModel);
		var modelSetter = model.assign;
		elem.bind('change', function(){
			scope.$apply(function(){
				modelSetter(scope, elem[0].files[0]);
			});
		});
	};
	return directive;
}]);