/**
 * Candidate Controller
 */

app.votolegal.controller('PreviewController', ["$scope", "$http", "$sce", "serialize", "auth_service", "SweetAlert", "trouble", "postmon", function($scope, $http, $sce, serialize, auth_service, SweetAlert, trouble, postmon){
  var load   = document.querySelector('#loading');

  console.log(window.location, 'location')
  var locationHost = window.location.host;



  // defaults
  $scope.candidate  = {};


  /**
   * getting data
   */
  $scope.get_candidate = function(){
    var params = {};

    var user = auth_service.current_user();
    params['api_key'] = user.api_key;

    $http.get('//dapi.votolegal.com.br/api/candidate/' + user.id +'?api_key=' + user.api_key)
    .then(
      function(response){
        $scope.candidate = response.data.candidate;

        (function(){
          var boleto = document.querySelector('#show-boleto');
          if(boleto && $scope.candidate.status === 'activated') boleto.classList.remove('hide');
        })();

        $scope.candidate.profile_url = function(){
          return $sce.trustAsResourceUrl("//" + locationHost + "/candidato?id=" + $scope.candidate.username);
        };
      },
      function(response){ throw new Error('ERROR_GET_CANDIDATE') }
    );
    return false;
  };

  /**
   * initializations
   */
  auth_service.validate_user({role: 'user'});
  $scope.get_candidate();
}]);
