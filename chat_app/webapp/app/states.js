var appStates = [
	{
		name : 'home',
		url : '/{userid}/home',
		controller : 'HomeCtrl',
		templateUrl : appUrl + '/app/home.html',
		params : {userid : null},
		abstract : false
	},
	{
		name : 'login',
		url : '/login',
		controller : 'LoginCtrl',
		templateUrl : appUrl + '/app/login/login.html',
		abstract : false
	},
	{
		name : 'message',
		url : '/message',
		controller : 'MessageCtrl',
		templateUrl : appUrl + '/app/message/message.html',
		params : {user : null, from: null},
		abstract : false
	}
];