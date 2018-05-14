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


		$scope.user = localStorage.getItem("userId");

		$scope.confirm = function () {
			errorList = [];

			if ($scope.confirmContract && $scope.user != null) {
				contract_service
					.contract($scope.user)
					.success(function (data) {
						if (data.id > 0) {
							document.location = "/pagamento";
						}
					})
					.error(function (data) {
						if (data.error == 'Candidate not found') {

							var error = [data];
							error.map(function (m) {
								var messages = error_msg(Object.values(m))

								errorList.push({
									title: messages
								});
							}, 0)
						} else {
							var error = [data.form_error];
							error.map(function (m) {
								var messages = error_msg(Object.keys(m))
								errorList.push({
									title: messages
								});
							}, 0)
						}

						$scope.error_list = errorList
					});
			} else if ($scope.user == null && $scope.error == true) {
				$scope.errorUser = true;
				$scope.error_list.push({
					title: 'Não conseguimos te identificar. Por gentileza faça seu pre cadastro, caso já tenha feito, faça seu login.'
				});
				$scope.error = true;

			} else if ($scope.confirmContract == false) {
				$scope.error_list.push({
					title: 'É necessário confirmar o contrato'
				});
				$scope.error = true;
			}
		};
	}
]);
