var contextRoot = '/webapp/node/jade';
var appStates = [
	{
		name: 'home',
		url: '/',
		controller: 'AppCtrl',
		templateUrl: contextRoot + '/index'
	},
	{
		name: 'about',
		url: '/about',
		controller: 'AppCtrl',
		templateUrl: contextRoot + '/about'
	},
	{
		name: 'signup',
		url: '/signup',
		controller: 'AppCtrl',
		templateUrl: contextRoot + '/signup'
	}
];