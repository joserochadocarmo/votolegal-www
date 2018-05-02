app.votolegal.controller("ContractController", [
	"$scope",
	"$http",
	"$sce",
	"serialize",
	"auth_service",
	"contract_service",
	"SweetAlert",
	"trouble",
	"$route",
	"$location",
	function(
		$scope,
		$http,
		$sce,
		serialize,
		auth_service,
		contract_service,
		SweetAlert,
		trouble,
		$location
	) {
		$scope.error = false;
		$scope.errorServer = false;
		$scope.error_list = '';
		$scope.confirmContract = false;


		$scope.user = localStorage.getItem("userId");

		$scope.confirm = function() {

			if ($scope.confirmContract && $scope.error == false && $scope.user != null) {
				var response = contract_service
					.contract($scope.user )
					.success(function(data) {

						if(data.id > 0){
							document.location = "/pagamento";

						}
					})
					.error(function(data) {

						if (data.form_error.user_id.length > 0) {
							$scope.error_list = 'Você já confirmou o contrato tente logar para verificar em qual etapa você está'
						}
					});
			} else if ($scope.user == null && $scope.error == true) {
				$scope.errorUser = true;
				$scope.error_list = 'Não conseguimos te identificar. Por gentileza faça seu pre cadastro, caso ja tenha feito faça seu login. '
				$scope.error = true;

			} else if ($scope.confirmContract == false) {
				$scope.error_list = 'É necessário confirmar o contrato';
				$scope.error = true;
			}
		};
	}
]);