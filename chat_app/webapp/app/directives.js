meanApp.directive('fileModel',['$parse',function($parse){
	var directive = {};
	directive.restrict = 'A';
	directive.link = function(scope,element,attrs){
		var model = $parse(attrs.fileModel);
		var modelSetter = model.assign;
		element.bind('change', function(){
            scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
            });
        });
	};	
	return directive;
}]);

meanApp.directive('chatBox',['$timeout',function($timeout){
	var directive = {};
	directive.restrict = 'A';
	directive.scope = {
		messageList : '='
	};
	directive.link = function(scope,element,attrs){
		scope.$watchCollection('messageList',function(newVal){
			if(newVal)
			{
				$timeout(function(){  //needed to execute the digest cycle
					//$(element).scrollTop($(element)[0].scrollHeight); //jquery dependent
					element[0].scrollTop = element[0].scrollHeight; //alternate ways to scroll to div bottom
				},0);
			}
		});
	};
	return directive;
}]);