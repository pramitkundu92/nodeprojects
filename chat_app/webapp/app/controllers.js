meanApp.controller('MainCtrl',['$scope','$http','$state','$stateParams',function($scope,$http,$state,$stateParams){
	$scope.heading = 'NODER App';
	
	$scope.gotoState = function(stateName,stateParams){
		if(!stateParams)
			$state.go(stateName);
		else
			$state.go(stateName,stateParams);
	};
}]);

meanApp.controller('HomeCtrl',['$scope','$http','$state','$stateParams','$window',function($scope,$http,$state,$stateParams,$window){
	$scope.userList = [];
	
	$scope.newUser = '';
	$scope.loggedInUser = $stateParams.userid;
	getUser($stateParams.userid);
	
	function getUser(id){
		$http.get(appUrl + '/getusername/' + id).success(function(response){
			$scope.greeting = 'Welcome, ' +  response[0].name;
		});
	};
	
	var refresh = function(){
		$http.get(appUrl + '/getallusers').success(function(response){
			var arr = [];
			angular.forEach(response,function(usr){
				if(usr.userid !== $scope.loggedInUser)
					arr.push(usr);
			});
			$scope.userList = angular.copy(arr);	
		});
	};
	
	refresh();
	
	$scope.addUser = function(){
		$http.post(appUrl + '/adduser', $scope.newUser).success(function(response){
			var arr = [];
			angular.forEach(response,function(usr){
				if(usr.userid !== $scope.loggedInUser)
					arr.push(usr);
			});
			$scope.userList = angular.copy(arr);
			$scope.newUser = '';
		});
	};
	
	$scope.deleteUser = function(userid){
		$http.delete(appUrl + '/deleteuser/' + userid).success(function(response){
			var arr = [];
			angular.forEach(response,function(usr){
				if(usr.userid !== $scope.loggedInUser)
					arr.push(usr);
			});
			$scope.userList = angular.copy(arr);
		});
	};
	
	$scope.openChatWindow = function(){
		$http.get(appUrl + '/online/' + $scope.loggedInUser).success(function(response){
			$scope.gotoState('message',{});
		});		
	};
	
	$scope.gotoState = function(stateName,stateParams){
		if(!stateParams)
			$state.go(stateName);
		else
			$state.go(stateName,{user : stateParams, from : $scope.loggedInUser});
	};
	
	$scope.download = function(){
		$http.get(appUrl + '/downloadmsg/' + $scope.loggedInUser).success(function(data,status,headers,config){
			var file = new Blob([ data ], {type : headers('Content-Type')});
            var fileURL   = URL.createObjectURL(file);
            var a         = document.createElement('a');
            a.href        = fileURL; 
            a.target      = '_blank';
            a.download    = headers('FileName')
            document.body.appendChild(a);
            a.click();
		});
	};
	
	$scope.uploadObject = {};
	$scope.uploadUrl = appUrl + '/upload';
	
	$scope.upload = function(){
		if($scope.uploadObject.file!=undefined)
		{
		var formData = new FormData();
		formData.append('file', $scope.uploadObject.file);
		$http.post($scope.uploadUrl, formData, {
			transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
		}).success(function(response){
			angular.element(document.getElementById('uploadFile')).val(null);
		});
		}
	};
	
	$scope.errormsg = '';
	$scope.fileName = '';
	$scope.downloadUrl = appUrl + '/downloadfile/';
	$scope.keypressFunc = function(ev){
		if(ev.keyCode == 13)
			$scope.downloadFile();
	};
	$scope.downloadFile = function(){
		if($scope.fileName.trim() != '')
		{
			$http.get($scope.downloadUrl + $scope.fileName,	{responseType : 'arraybuffer'})
						.success(function(data,status,headers,config){
				if(data.byteLength == 35)
				{
					$scope.errormsg = 'Error in file download';
				}
				else{	
                    var file = new Blob([ data ], {type : headers('Content-Type')});
                    var fileURL   = URL.createObjectURL(file);
                    var a         = document.createElement('a');
                    a.href        = fileURL; 
                    a.target      = '_blank';
                    a.download    = headers('FileName');
                    document.body.appendChild(a);
                    a.click();
				}
			}); 
		}
		else
			$scope.errormsg = 'Please enter a filename';
	};
	
	$scope.getAllMessages = function(){
		$http.get(appUrl + '/getmessagesummary').success(function(data,status,headers,config){ 
			var file = new Blob([ data ], {type : headers('Content-Type')});
			var fileUrl = URL.createObjectURL(file);
			var a = document.createElement('a');
			a.target = '_blank';
			a.href = fileUrl;
			a.download = file.name;
			document.body.appendChild(a);
			a.click();
		});
	};
	
	$scope.decodeUrl = function(){
		var search = window.location.href.split('?')[1] == undefined ? '' : window.location.href.split('?')[1];
		search = search.replace(/&/g, '","').replace(/=/g, '":"');
		search = '{"' + search + '"}';
		console.log(JSON.parse(search));
	};
    
    $scope.testFileDownload = function(){
        $http.post(appUrl + '/createdocfile', {text:$scope.textWrittenByUser})
        .success(function(data,status,headers,config){
            $http.get($scope.downloadUrl + data, {responseType : 'arraybuffer'})
						.success(function(data,status,headers,config){
				if(data.byteLength == 35)
				{
					$scope.errormsg = 'Error in file download';
				}
				else{	
                    var file = new Blob([ data ], {type : headers('Content-Type')});
                    var fileURL   = URL.createObjectURL(file);
                    var a         = document.createElement('a');
                    a.href        = fileURL; 
                    a.target      = '_blank';
                    a.download    = headers('FileName');
                    document.body.appendChild(a);
                    a.click();
				}
			});        
        })
    };
}]);