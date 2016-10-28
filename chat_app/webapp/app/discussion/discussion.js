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
    function appendVideo(data){
      var v = document.createElement('video');
      v.src = data.video;
      v.height = 100;
      v.width = 100;
      v.play();
      var div = document.createElement('div');
      var span = document.createElement('span');
      span.innerHTML = data.msg;
      div.appendChild(v);
      div.appendChild(span);
      document.body.appendChild(div);
    };
    socket.emit('joined',$stateParams.userid);
    socket.on('initLoad',function(data){
        $scope.$apply(function(){
            $scope.msgList = data.slice();
            angular.forEach(data,function(d){
              appendVideo(d);
            });
        });
    });
    socket.on('loadMessages',function(data){
        $scope.$apply(function(){
            $scope.msgList.push(data);
            appendVideo(data);
        });
    });
    $scope.sendMessage = function(event){
        if(((event.type=='keypress' && event.keyCode == 13) || event.type=='click') && $scope.msg!=undefined && $scope.msg.trim()!='')
		    {
            if(!event.shiftKey){
                $('#msgbox').blur();
                socket.emit('sendMsg', {
                                        username: $scope.user.password,
                                        text: $scope.msg,
                                        video: $scope.video.src});
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
    //playing video from webcam
    $scope.video = document.createElement('video');
    // Get access to the camera
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            $scope.video.src = window.URL.createObjectURL(stream);
            $scope.video.height = 100;
            $scope.video.width = 100;
            $scope.video.play();
        });
    }
    //playing video from webcam
}]);
