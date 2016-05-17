appUrl = '/webapp/node/jade';

jadeApp.factory('userService', ['$http', '$q', function($http,$q){
	var factory = {};
	factory.registerUser = function(userData){
		var def = $q.defer();
		$http.post(appUrl + '/adduser', userData, {
			transformRequest: angular.identity,
			headers: {'Content-Type': undefined}
		})
		.success(function(response){
			def.resolve('User successfully added');
		})
		.error(function(){
			def.reject('Error while registering user');
		});
		return def.promise;
	};
	factory.uploadFile = function(uploadData){
		var deferred = $q.defer();
		$http.post(appUrl + '/upload', uploadData, {
			transformRequest: angular.identity,
			headers: {'Content-Type': undefined}
		})
		.success(function(response){
			deferred.resolve(response);
		})
		.error(function(err){
			deferred.reject(err);
		});
		return deferred.promise;
	};
	return factory;
}]);