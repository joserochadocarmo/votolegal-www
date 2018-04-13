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

		$scope.BrandCard = '';
		$scope.senderHash = '';
		$scope.formDisable = true;
		$scope.formDisable = [],



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
			if (form.$invalid == true) {
				error = form.$error.required;
				var errorsForm = error.map(function (erro) {

					var e = []
					switch (erro.$name) {
						case 'name':
							e[0] = "Nome"
						case "email":
							e[1] = "E-mail"
						case "cpf":
							e[2] = "CPF"
						case "cardNumber":
							e[3] = "Número do cartão"
						case "monthCardExpire":
							e[4] = "Mês que o cartão expira"
						case "yearCardExpire":
							e[5] = "Ano que o cartão expira"
						case "cvvCard":
							e[6] = "Código de segurança"
						default:
							break
					}
					return e;
				}, 1)
					$scope.errorList= errorsForm[0];
			}else{
				$scope.brandCards()
			}
		}

	}]);
