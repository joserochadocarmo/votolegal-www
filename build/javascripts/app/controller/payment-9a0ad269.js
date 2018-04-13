app.votolegal.controller("PaymentController", [
	"$scope",
	"$http",
	"$sce",
	"serialize",
	"auth_service",
	"payment_pagseguro",
	"session_pagseguro",
	"SweetAlert",
	"trouble",
	"$route",
	"$location",
	"SweetAlert",

	function (
		$scope,
		$http,
		$sce,
		serialize,
		auth_service,
		payment_pagseguro,
		session_pagseguro,
		SweetAlert,
		trouble,
		$location,
		SweetAlert
	) {
		if (JSON.parse(localStorage.getItem("user") == null) && localStorage.getItem("userId") == null) {
			document.location = "/";
		}

		$scope.user = JSON.parse(localStorage.getItem("user")) || localStorage.getItem("userId");

		$scope.userIdDefined = ($scope.user.id) ? $scope.user.id : $scope.user;

		$scope.submit = function(event){
			 event.preventDefault();

		$scope.method = "";
		$scope.userCardData = {
			name: '',
			email: '',
			cpf: '',
			cardNumber: '',
			monthCardExpire: '',
			yearCardExpire: '',
			cvvCard: '',
		};
		$scope.errorList = [];
		$scope.BrandCard = '';
		$scope.senderHash = '';
		$scope.formDisable = true;

		$scope.getSessionId = function () {
			return new Promise(function (resolve) {
				var res = localStorage.getItem("userId");
				resolve(session_pagseguro.getSessionId(res))
				return sessionId;

			})
		}
		$scope.SetSessionId = function (id) {
			return new Promise(function (resolve) {
				resolve(PagSeguroDirectPayment.setSessionId(id))

			})
		}
		$scope.getSenderHash = function () {
			return new Promise(function (resolve) {
				resolve(PagSeguroDirectPayment.getSenderHash())
			})
		}

		//Start session
		$scope.getSessionId()
			.then(function (val) {
				$scope.SetSessionId(val.data.id)
					.then(function () {
						$scope.getSenderHash()
					})
			})

		$scope.brandCards = function () {
			return PagSeguroDirectPayment.getBrand({
				cardBin: $scope.userCardData.cardNumber,
				success: function (response) {
					return response;
				},
				error: function (response) {
					console.log(response, 'c')
				},
				complete: function (response) {
					window.vLcardBrand = response;
					getBrandCard(response).then(function (res) {
						$scope.payment(res)
					});
				}
			});
		}
		getBrandCard = function (res) {
			return new Promise(function (resolve) {
				resolve(res);
			})
		}

		$scope.payment = function (brand) {

			PagSeguroDirectPayment.createCardToken({
				cardNumber: $scope.userCardData.cardNumber,
				brand: brand.brand.name,
				cvv: $scope.userCardData.cvvCard,
				expirationMonth: $scope.userCardData.monthCardExpire,
				expirationYear: $scope.userCardData.yearCardExpire,
				success: function (reponse) {
					console.log(response)

				},
				error: function () {

				},
				complete: function (response) {
					var userId = localStorage.getItem("userId");
					var hash = PagSeguroDirectPayment.getSenderHash()
					payment_pagseguro.payment(userId, hash, tokenCard)

				},
			});
		}

		$scope.submit = function (form) {

			console.log(form, 'fomr')
			var error = [];
			if (form.$error.required) {
				error = form.$error.required;
				error.map(function (erro) {
					switch (erro.$name) {
						case 'name':
							$scope.errorList[0] = 'Nome'
						case 'email':
							$scope.errorList[1] = 'E-mail'
						case 'cpf':
							$scope.errorList[2] = 'CPF'
						case 'cardNumber':
							$scope.errorList[3] = 'Número do cartão'
						case 'monthCardExpire':
							$scope.errorList[4] = 'Mês que o cartão expira'
						case 'yearCardExpire':
							$scope.errorList[5] = 'Ano que o cartão expira'
						case 'cvvCard':
							$scope.errorList[6] = 'Código de segurança'
							break;
						default:
							break;
					}
				})
			}else{
				$scope.brandCards()
			}
		}
	}
	}]);
