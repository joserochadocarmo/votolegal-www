/**
 * Candidate Controller
 */



app.votolegal.controller('PreviewController', ["$scope", "$rootScope", "$http", "$sce", "serialize", "auth_service", "color_theme_service", "site_publish_service", "SweetAlert", "trouble", "postmon", function ($scope, $rootScope, $http, $sce, serialize, auth_service, color_theme_service, site_publish_service, SweetAlert, trouble, postmon) {



  var load   = document.querySelector('#loading');

  // defaults
$scope.candidate  = {};
$scope.publish = false;
$scope.reponseTheme='';


$scope.iframeStatus = {}

var locationHost = window.location.host;



  /**
   * getting data
   */
  $scope.get_candidate = function(){
    var params = {};

    var user = auth_service.current_user();
    params['api_key'] = user.api_key;

    $http.get(BASE_API_JS+'/candidate/' + user.id +'?api_key=' + user.api_key)
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

		$scope.publish = ($scope.candidate.publish == 1) ? true : false;

      },
      function(response){ throw new Error('ERROR_GET_CANDIDATE') }
    );
    return false;
  };

  //Verify preview status, theme aand publish

  $scope.controlPublishStatus = function () {
  	$scope.publish = !$scope.publish;

  }
  $scope.publishSite = function (statusSiteForm) {
		var user = auth_service.current_user();

		var publish = (statusSiteForm.themeActive.$viewValue) ? 'publish' : 'unpublish';

	site_publish_service.edit(publish, user)
		.success(function(res){
			$scope.responsePublish = 'Salvo'
			$scope.candidate.publish = ($scope.publish) ? 1 : 0;

		})
		.error(function(res){
				$scope.erroPublish = 'Houve um erro, por favor tentar novamente'
		})

  }

	$scope.choiceTheme = function () {
		var previewWindow = document.getElementById('preview');

		previewWindow.contentWindow.postMessage($scope.iframeStatus, window.location.href);

	}

  $scope.editConfigSite = function(valid, formData){
	var previewWindow = document.getElementById('preview');

	var user = auth_service.current_user();

	color_theme_service.edit($scope.iframeStatus, user)

		.success(function (res) {
			$scope.candidate.color = $scope.iframeStatus.theme;

			$scope.reponseTheme = 'Tema salvo com sucesso';

		}).error(function (er) {
		$scope.reponseThemeError = 'Tivemos um erro ao salvar';

		})
}

  /**
   * initializations
   */
  auth_service.validate_user({role: 'user'});
  $scope.get_candidate();

}]);
