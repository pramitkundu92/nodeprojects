meanApp.controller('DiscussionCtrl',['$scope','$http','$stateParams','$timeout','$state',function($scope,$http,$stateParams,$timeout,$state){
    var socket = io();
    $scope.msgList = [];
    $scope.msg = '';
    $scope.user = {};
    setTimeout(function(){
      $http.get(appUrl + '/getusername/' + $stateParams.userid)
      .success(function(result){
        $scope.user = angular.copy(result[0]);
      });
    },0);
    socket.emit('joined',$stateParams.userid);
    socket.on('initLoad',function(data){
        $scope.$apply(function(){
            $scope.msgList = data.slice();
        });
    });
    socket.on('loadMessages',function(data){
        $scope.$apply(function(){
            $scope.msgList.push(data);
        });
    });
    $scope.sendMessage = function(event){
        if(((event.type=='keypress' && event.keyCode == 13) || event.type=='click') && $scope.msg!=undefined && $scope.msg.trim()!='')
		    {
            if(!event.shiftKey){
                $('#msgbox').blur();
                socket.emit('sendMsg', {username: $scope.user.password, text: $scope.msg});
                $scope.msg = '';
            }
		    }
    };
    $scope.closeForum = function(){
      socket.disconnect();
      $state.go('home',{userid : $scope.user.userid});
    };
    $scope.$on('$destroy',function(){
        socket.emit('disconnect');
    });
}]);
