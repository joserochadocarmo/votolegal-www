/**
 * Candidate Controller
 */



app.votolegal.controller('PreviewController', ["$scope", "$rootScope", "$http", "$sce", "serialize", "auth_service", "color_theme_service", "site_publish_service", "SweetAlert", "trouble", "postmon", function ($scope, $rootScope, $http, $sce, serialize, auth_service, color_theme_service, site_publish_service, SweetAlert, trouble, postmon) {



  var load   = document.querySelector('#loading');

  // defaults
$scope.candidate = {};
$scope.publish = false;
$scope.reponseTheme = '';
$scope.iframeStatus = {};
$scope.error_list = [];




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
			var domain = window.location.href.indexOf('//dev') !== -1 || window.location.href.indexOf('//localhost') !== -1 || window.location.href.indexOf('//192.') !== -1
				? 'dev.votolegal.com.br'
				: 'votolegal.com.br';

			return $sce.trustAsResourceUrl("//" + domain + "/em/" + $scope.candidate.username);
		};

		$scope.publish = ($scope.candidate.is_published == 1) ? true : false;

	  },
	  function(response){ throw new Error('ERROR_GET_CANDIDATE') }
	);
	return false;
  };

  //Verify preview status, theme aand publish

  $scope.controlPublishStatus = function () {
  	$scope.publish = !$scope.publish;
	$scope.responsePublish = ''

  }
  $scope.publishSite = function (statusSiteForm) {
	  $scope.error_list = [];
		var user = auth_service.current_user();
		var publish = (statusSiteForm.themeActive.$viewValue) ? 'publish' : 'unpublish';

	site_publish_service.edit(publish, user)
		.success(function(res){
			$scope.responsePublish = 'Alterações salvas'
			$scope.candidate.publish = ($scope.publish) ? 1 : 0;
		})

		.error(function(error){
			if(error.form_error)
				var errors = Object.keys(error.form_error);
				errors.map(function (error) {
					var message = error_msg(error);
					$scope.error_list.push({
						title: message
					})
				}, 0)
		})
	}

	$scope.choiceTheme = function () {
		var previewWindow = document.getElementById('preview');
		previewWindow.contentWindow.postMessage($scope.iframeStatus, window.location.origin);
		$scope.reponseTheme = '';
	}

  $scope.editConfigSite = function(valid, formData){
	var previewWindow = document.getElementById('preview');
	var user = auth_service.current_user();
	color_theme_service.edit($scope.iframeStatus, user)
		.success(function (res) {
			$scope.candidate.color = $scope.iframeStatus.theme;

			$scope.reponseTheme = 'Alterações salvas';

		}).error(function (er) {
		$scope.reponseThemeError = 'Erro ao salvar';

		})
}

  /**
   * initializations
   */
  auth_service.validate_user({role: 'user'});
  $scope.get_candidate();

}]);
