var app = angular.module('testApp',['ui.router']);

var CLIENT_ID = "463435458040-75qu2rrh47geg87v1mkirk1pqgfn8is7.apps.googleusercontent.com";
var API_KEY="AIzaSyCdZ1_kB8EyodLqff8H5vIoduhF4I3W_Ys";

app.controller('MainCtrl',['$scope','$http','$state',function($scope,$http,$state){
	$scope.heading = 'Gmail App';
	$scope.login=function() {
		var scopes = "https://www.googleapis.com/auth/userinfo.email https://www.google.com/m8/feeds/contacts/default/full";
        var client_id=CLIENT_ID;
        var scope=scopes;
        var redirect_uri="http://localhost:10000/index.html";
        var response_type="token";
        var url="https://accounts.google.com/o/oauth2/auth?scope="+scope+"&client_id="+client_id+"&redirect_uri="+redirect_uri+
        "&response_type="+response_type;
        window.location.replace(url);
    };

	$scope.fetchAllContacts = function(){
		gapi.client.load('oauth2', 'v2', function () { 
                         console.log(gapi.client.oauth2.userinfo); /* 
                         request.execute(function (resp) { 
                             data.email = resp.email; 
                         });  */
                    }); 

	};
}]);

app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
	$stateProvider.state({
		name: 'home',
		url: '/home',
		templateUrl: '/home.html',
		controller: 'MainCtrl'	
	});
	$stateProvider.state({
		name: 'index',
		url: '/',
		templateUrl: '/partial1.html',
		controller: 'MainCtrl'	
	});
	$urlRouterProvider.otherwise('/home');
}]);