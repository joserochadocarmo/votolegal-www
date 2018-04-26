/**
 * Default Controller
 */
app.votolegal.controller('DefaultController', ["$scope", "$http", "auth_service", "serialize", function($scope, $http, auth_service, serialize){

  // validate user
	localStorage.removeItem('paymentRedirect')



  auth_service.validate_user({role: 'user'});
}]);
