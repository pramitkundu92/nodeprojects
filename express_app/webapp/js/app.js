var app = angular.module('expenseApp',[]);
var appUrl = '/webapp/express';

app.config(['testServiceProvider',function(testServiceProvider){
	testServiceProvider.setData('App loaded at ' + new Date().toString());
}]);

app.controller('AppCtrl',['$scope','expenses','testService',function($scope,expenses,testService){
	$scope.selectedExpense = {};
	$scope.expenseList = [];
	$scope.expenseEdited = false;
	setTimeout(function(){
		expenses.getExpenses({})
		.then(function(result){
			$scope.expenseList.length = 0;
			angular.forEach(result,function(expense){
				$scope.expenseList.push(expense);
				$scope.expenseEdited = false;
			});
		},function(err){
			console.error(err);
		});
	},0);	
	$scope.saveExpense = function(){
		expenses.saveExpense($scope.selectedExpense)
		.then(function(result){
			$scope.expenseList = angular.copy(result);
		},function(err){
			console.error(err);
		});
		$scope.selectedExpense = {};
		$scope.expenseEdited = false;
	};
	$scope.editExpense = function(index){
		$scope.selectedExpense = angular.copy($scope.expenseList[index]);
		$scope.expenseEdited = true;
	};
	$scope.clear = function(){
		$scope.selectedExpense = {};
		$scope.expenseEdited = false;
	};
	$scope.deleteExpense = function(index){
		var expense = angular.copy($scope.expenseList[index]);
		expenses.deleteExpense(expense['_id'])
		.then(function(result){
			$scope.expenseList = angular.copy(result);
		},function(err){
			console.error(err);
		});
	};
	$scope.testMethod = function(){
		console.log(testService.getData());
	};
}]);

app.provider('testService',function(){
	var data = '';
	this.setData = function(d){
		data = d;	
	};
	this.$get = function(){
		return {
			getData: function(){
				return data;
			}
		};
	};
});

app.service('expenses',['$q','$http',function($q,$http){
	this.saveExpense = function(expense){
		var deferred = $q.defer();
		$http.post(appUrl + '/save', expense)
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
		$http.post(appUrl + '/expenses', query)
		.success(function(result){
			deferred.resolve(result);
		})
		.error(function(err){
			deferred.reject(err);
		})
		return deferred.promise;
	};
	this.deleteExpense = function(query){
		var deferred = $q.defer();
		$http.delete(appUrl + '/delete/' + query)
		.success(function(result){
			deferred.resolve(result);
		})
		.error(function(err){
			deferred.reject(err);
		})
		return deferred.promise;
	};
}]);