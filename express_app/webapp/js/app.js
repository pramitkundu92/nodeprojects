var app = angular.module('expenseApp',[]);
var appUrl = '/webapp/express';

app.controller('AppCtrl',['$scope','expenses',function($scope,expenses){
	setTimeout(function(){
		expenses.getExpenses({})
		.then(function(result){
			$scope.expenseList = angular.copy(result);
		},function(err){
			console.error(err);
		});
	},0);
	$scope.selectedExpense = {};
	$scope.addExpense = function(){
		expenses.addExpense($scope.selectedExpense)
		.then(function(result){
			console.log(result);
		},function(err){
			console.error(err);
		});
		$scope.expense = {};
	};
	$scope.listAllExpenses = function(){
		expenses.getExpenses({})
		.then(function(result){
			$scope.expenseList = angular.copy(result);
		},function(err){
			console.error(err);
		});
	};
	$scope.editExpense = function(index){
		$scope.selectedExpense = angular.copy($scope.expenseList[index]);
		console.log($scope.selectedExpense);
	};
}]);

app.service('expenses',['$q','$http',function($q,$http){
	this.addExpense = function(expense){
		var deferred = $q.defer();
		$http.post(appUrl + '/create', expense)
		.success(function(result){
			deferred.resolve(result);
		})
		.error(function(err){
			deferred.reject(err);
		})
		return deferred.promise;
	};
	this.getExpenses = function(query){
		var deferred = $q.defer();
		$http.post(appUrl + '/getexpenses', query)
		.success(function(result){
			deferred.resolve(result);
		})
		.error(function(err){
			deferred.reject(err);
		})
		return deferred.promise;
	};
}]);