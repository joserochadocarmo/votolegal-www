/**
 * PreCandidate Controller
 */

app.votolegal.controller('PreCandidateController', ["$scope", "$http", "serialize", "auth_service", function($scope, $http, $location, serialize, auth_service){
  // defaults
  var user = auth_service.current_user();
  $scope.model  = {};
  $scope.params = URI.query();


  $scope.load = function(id){
    try{ id = parseInt(id); }
    catch(e){ throw new Error('Parametro id é inválido'); }

    $http({
      method: 'GET',
      url: 'https://api-to.votolegal.com.br/api/candidate/'+ id +'?api_key=' + user.api_key,
    }).
    then(
      function(response){
        var res = response.data.candidate;
        $scope.model = res;
      },
      function(response){
        throw new Error('Model is invalid or cannot be found!');
      }
    );
    return false;
  };

  $scope.load($scope.params.id);

  // validate user
  auth_service.validate_user({role: 'admin'});
}]);
