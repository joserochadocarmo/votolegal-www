/**
 * Explore Controller
 */

app.votolegal.controller('ExploreController', ["$scope", "$http", "auth_service", "serialize", "SweetAlert", "trouble", function($scope, $http, auth_service, serialize, SweetAlert, trouble){
  // defaults
  $scope.list       = [];
  $scope.party_list = [];
  $scope.term       = '';
  $scope.party      = { id: 0, acronym: 'Partido' };
  $scope.typesearch = 'Nome';


  // methods
  $scope.redirect_to = function(candidate){
    if(candidate.website_url.length > 0){
      var w = window.open(candidate.website_url, '_blank');
      w.focus();
      return false;
    }

    SweetAlert.swal('Website não definido', 'Este candidato não configurou nenhum website para acesso.');
    //document.location = '//'+ username +'.votolegal.org.br/candidato';
    return false;
  };


  $scope.set_typesearch = function(type){
    $scope.typesearch = type;
  };

  $scope.set_party = function(party){
    $scope.party = party;
  };


  // load party data
  $scope.load_parties = function(){
    $http.get('https://api-to.votolegal.com.br/api/party')
    .then(function(response){ 
      $scope.party_list = response.data.party;
      for(var i in $scope.party_list){
        if($scope.party_list[i].id == $scope.party.id) $scope.party = $scope.party_list[i];
        //console.log($scope.party_list[i]);
        //console.log($scope.party.id);
      }
    },function(response){ 
      $scope.party_list = []; throw new Error("ERROR_GET_PARTY_LIST"); 
    });
  };


  $scope.load_list = function(term){
    var params = {};
    switch($scope.typesearch){
      case 'Nome':
        params.name = term;
        break;
      case 'Cidade':
        params.address_city = term;
        break;
    }
    params.party_id = party;

    var loading        = document.querySelector('#loading-candidates');
    var candidate_list = document.querySelector('.candidate-list');

    $http({
      method: 'post',
      url: 'https://api-to.votolegal.com.br/api/search?results=9999', 
      data: serialize.from_object(params),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(
      function(response){
        $scope.list = response.data;

        if(loading) loading.classList.add('hide');
        if(candidate_list) candidate_list.classList.remove('hide');
      },
      function(response){
        var data = response.data;
        SweetAlert.swal('Erro inesperado', 'Não foi possivel carregar a lista de usuários!');
        trouble({
          route: document.location.href, error: JSON.stringify(response)
        });

        if(loading) loading.classList.add('hide');
        if(candidate_list) candidate_list.classList.remove('hide');
      }
    );
    return false;
  };

  // load candidate list
  var term = URI.query('q') || undefined;
  $scope.term = term;
  var party = URI.query('party') || 0;
  $scope.party.id = party;

  $scope.typesearch = URI.query('type') || 'Nome';
  $scope.load_parties();
  $scope.load_list(term);
}]);
