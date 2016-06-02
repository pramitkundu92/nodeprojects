var app = angular.module('testApp',['ui.router']);

var CLIENT_ID = "463435458040-75qu2rrh47geg87v1mkirk1pqgfn8is7.apps.googleusercontent.com";
var API_KEY="AIzaSyCdZ1_kB8EyodLqff8H5vIoduhF4I3W_Ys";
var contactAPI = "https://www.google.com/m8/feeds/contacts/default/full";
var authTokenAPI = "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=";

app.controller('MainCtrl',['$scope','$http','$state','googleService',function($scope,$http,$state,googleService){
	$scope.heading = 'Gmail App';
	$scope.login=function() {
		googleService.login($scope.username);
    };
	$scope.fetchAllContacts = function(){
		var str = window.location.hash.substring(2);
		var accessToken = str.split('&')[0].split('=')[1];	
		$http.get(authTokenAPI + accessToken).then(function(result){
			var url = contactAPI;
			$http({method:'GET', url:url, headers: {'Authorization': 'Bearer ' + accessToken, 'HOST': 'googleapis.com', 
													'GData-Version': 3.0}, responseType : 'application/json'})
			.then(function(result){
				contactXML = new window.DOMParser().parseFromString(result.data, "text/xml");
				var list = xmlToJson(contactXML).feed.entry;
				$scope.contactList = [];
				angular.forEach(list,function(contact){
					if(contact.name){
						$scope.contactList.push({displayName: contact.name.fullName['#text'], contact: contact});	
					}
					else if(contact.email){
						$scope.contactList.push({displayName: contact.email['@attributes'].address, contact: contact});
					}
				});
				console.log($scope.contactList);
			},function(err){
				console.error(err);
			});
		},function(err){
			console.error(err);
		});		
	};
}]);

app.factory('googleService',['$http','$q',function($http,$q){
	var obj = {};
	obj.login = function(username){
		console.log(username)
		var scopes = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/contacts.readonly";
        var client_id=CLIENT_ID;
        var scope=scopes;
        var redirect_uri="http://localhost:10000/home.html";
        var response_type="token";
        var url="https://accounts.google.com/o/oauth2/auth?scope="+scope+"&client_id="+client_id+"&redirect_uri="+redirect_uri+
        "&response_type="+response_type;
		window.location.href = url;
	};
	return obj;
}]);

function xmlToJson(xml) {
    var obj = {};
    if (xml.nodeType == 1) {                
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { 
        obj = xml.nodeValue;
    }            
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
			var arr = item.nodeName.split(':');
            var nodeName = arr.length > 1 ? arr[1] : arr[0] ;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}