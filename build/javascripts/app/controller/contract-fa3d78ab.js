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
		$scope.error_list = [];


		$scope.confirmContract = false;

		$scope.user = JSON.parse(localStorage.getItem("user")) || localStorage.getItem("userId");

		$scope.userIdDefined = ($scope.user.id) ? $scope.user.id : $scope.user;

		$scope.confirm = function() {
			if ($scope.confirmContract && $scope.error == false) {
				var response = contract_service
					.contract($scope.userIdDefined)
					.success(function(data) {
						console.log("sucesss", data);

						if(data.id > 0){
							document.location = "/pagamento";

						}
					})
					.error(function(data) {
						console.log("error", data);
						$scope.error_list.push('Você já confirmou o contrato')

						// $scope.errorServer = true;

						if (data.form_error.user_id.length > 0) {
							setTimeout(function () {
									document.location = "/";
							}, 2000)
						}
					});
			} else {
				$scope.error_list.push('É necessário confirmar o contrato')
				$scope.error = true;
			}
		};
	}
]);
