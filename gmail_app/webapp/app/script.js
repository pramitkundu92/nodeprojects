var app = angular.module('testApp',[]);

var CLIENT_ID = "463435458040-75qu2rrh47geg87v1mkirk1pqgfn8is7.apps.googleusercontent.com";
var API_KEY = "AIzaSyCdZ1_kB8EyodLqff8H5vIoduhF4I3W_Ys";
var contactAPI = "https://www.google.com/m8/feeds/contacts/default/full";
var authTokenAPI = "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=";

app.controller('MainCtrl',['$scope','$http','googleService',function($scope,$http,googleService){
	$scope.heading = 'Gmail App';
	$scope.login=function() {
		googleService.login($scope.username);
    };
	$scope.selectedContactIndex = -1;
	$scope.selectContact = function(index){
		$scope.selectedContact = angular.copy($scope.contactList[index]);
		$scope.selectedContactIndex = index;
	};
	$scope.fetchAllContacts = function(){
		googleService.fetchAllContacts().then(function(result){
			$scope.contactList = result;
			googleService.connectXMPP().then(function(result){
				console.log(result);
			},function(err){
				console.log(err);
			});
		},function(err){
			console.error(err);
		})		
	};
}]);

app.factory('googleService',['$http','$q',function($http,$q){
	var obj = {};
	obj.login = function(username){
		console.log(username)
		var scopes = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/hangout.av https://www.googleapis.com/auth/hangout.participants";
        var client_id=CLIENT_ID;
        var scope=scopes;
        var redirect_uri="http://localhost:10000/home.html";
        var response_type="token";
        var url="https://accounts.google.com/o/oauth2/auth?scope="+scope+"&client_id="+client_id+"&redirect_uri="+redirect_uri+
        "&response_type="+response_type;
		window.location.href = url;
	};
	obj.fetchAllContacts = function(){
		var deferred = $q.defer();
		var str = window.location.hash.substring(2);
		var accessToken = str.split('&')[0].split('=')[1];	
		$http.get(authTokenAPI + accessToken).then(function(result){
			var username = result.data.email.split('@')[0];
			var url = contactAPI;
			$http({method:'GET', url:url, headers: {'Authorization': 'Bearer ' + accessToken, 'HOST': 'googleapis.com', 
													'GData-Version': 3.0}, responseType : 'application/json'})
			.then(function(result){
				var contactXML = new window.DOMParser().parseFromString(result.data, "text/xml");
				var list = xmlToJson(contactXML).feed.entry;
				var contactList = [];
				angular.forEach(list,function(contact){
					if(contact.name){
						contactList.push({displayName: contact.name.fullName['#text'], contact: contact});	
					}
					else if(contact.email){
						contactList.push({displayName: contact.email['@attributes'].address, contact: contact});
					}
				});
				deferred.resolve(contactList);
			},function(err){
				deferred.reject(err);
			});
		},function(err){
			deferred.reject(err);
		});
		return deferred.promise;
	};
	obj.connectXMPP = function(){
		var str = window.location.hash.substring(2);
		var accessToken = str.split('&')[0].split('=')[1];
		var params = {accessToken: accessToken, clientId: CLIENT_ID, apiKey: API_KEY};
		var deferred = $q.defer();
		$http.post('/connectxmpp', params).then(function(response){
			deferred.resolve(response);
		},function(err){
			deferred.reject(err);
		});
		return deferred.promise;
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