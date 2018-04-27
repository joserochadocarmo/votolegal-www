
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
	"$routeParams",
	"SweetAlert",
	"$route",

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
		SweetAlert,
		$routeParams,
		$route

	) {


	if (JSON.parse(localStorage.getItem("user") !== null) && localStorage.getItem("userId") == null && localStorage.getItem('paymentRedirect') == null ){
			document.location = "/";
		}else if (document.location.pathname == '/pagamento'){


		$scope.candidate = {
			name: '',
			email: '',
			cpf: '',
			phone: '',
			zipCode: '',
			addressState: '',
			addressCity: '',
			addressDistrict: '',
			addressStreet: '',
			addressHouseNumber: '',
			card: {
				name: '',
				cardNumber: '',
				monthCardExpire: '',
				yearCardExpire: '',
				cvvCard: '',
			}
		};


		$scope.BrandCard = '';
		$scope.senderHash = '';
		$scope.formDisable = true;
		$scope.loading = false;
		$scope.error_list = [],
			$scope.paymentMethod = '';
		var year = new Date()
		$scope.currentYear = year.getFullYear();
		$scope.boletoUrl = null;
		$scope.error = '';
		$scope.senderHash = '';


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


		//Start session
		$scope.getSessionId()
			.then(function (val) {
				$scope.boletoUrl = null;
				$scope.SetSessionId(val.data.id)
			})

		$scope.creditCardPayment = function () {


			var num = $scope.candidate.card.cardNumber + '';
			num = num.split(' ').join('');

			return PagSeguroDirectPayment.getBrand({
				cardBin: num,
				complete: function (response) {
					$scope.loading = false;

					if (response.erro) {
						$scope.error = 'Tivemos um problema com as informações do seu cartão poderia verificar os dados';
					} else {
						$scope.createCardToken(response.brand.name)
					}
				}
			});
		}


		$scope.redirectBoleto = function () {
			$scope.boletoUrl = null;

		}


		$scope.createCardToken = function (brand) {
			$scope.loading = true;
			var num = ($scope.candidate.card.cardNumber + '').split(' ').join('');

			return PagSeguroDirectPayment.createCardToken({
				cardNumber: num,
				brand: brand,
				cvv: $scope.candidate.card.cvvCard,
				expirationMonth: $scope.candidate.card.monthCardExpire,
				expirationYear: $scope.candidate.card.yearCardExpire,

				complete: function (response) {
					payment(response)
				},
			});

		}

		payment = function (data) {

		console.log($scope.senderHash, 'sender')
			if (data.errors) {
				$scope.error = 'Tivemos um problema com as informações do seu cartão poderia verificar os dados';
			} else {

				var credit_card_token = data.card.token;
				var userId = localStorage.getItem("userId");

				var response = payment_pagseguro.payment(
					userId,
					$scope.senderHash,
					credit_card_token,
					$scope.paymentMethod,
					$scope.candidate.card.name,
					$scope.candidate.email,
					$scope.candidate.cpf,
					$scope.candidate.phone,
					$scope.candidate.zipCode,
					$scope.candidate.addressState,
					$scope.candidate.addressCity,
					$scope.candidate.addressDistrict,
					$scope.candidate.addressStreet,
					$scope.candidate.addressHouseNumber,
				).success(function (successs) {

					localStorage.removeItem('userId');
					localStorage.setItem('paymentRedirect', 1)
					$scope.loading = false;
					$scope.success = 'Sucesso';
					document.location = '/pagamento/analise';

				}).error(function (err) {

					$scope.error = 'Tivemos um problema com seu pagamento poderia tentar novamente';
					$scope.loading = false;

				})
			}

			$scope.$apply();
		}
		$scope.manageCondition = function (t) {

			if (t.$modelValue = 'creditCard') {
				$scope.boletoUrl = null;
			}
		}

		$scope.cepRequest = function () {
			return $http({
				method: 'GET',
				url: '//api-apoiadores.appcivico.com/cep?cep=' + $scope.candidate.zipCode,
			}).then(function (response) {
				$scope.candidate.addressStreet = response.data.street;
				$scope.candidate.addressState = response.data.state;
				$scope.candidate.addressCity = response.data.city;
				$scope.candidate.addressDistrict = response.data.district;
			})
		}

		$scope.submit = function (valid, form) {
			$scope.error = '';

			if (valid) {

				if (form.typePayment.$viewValue == 'boleto') {
					var userId = localStorage.getItem("userId");
					$scope.senderHash = PagSeguroDirectPayment.getSenderHash();
					var credit_card_token = null;
					$scope.loading = true;

					var response = payment_pagseguro.payment(
						userId,
						$scope.senderHash,
						credit_card_token,
						$scope.paymentMethod,
						$scope.candidate.name,
						$scope.candidate.email,
						$scope.candidate.cpf,
						$scope.candidate.phone,
						$scope.candidate.zipCode,
						$scope.candidate.addressState,
						$scope.candidate.addressCity,
						$scope.candidate.addressDistrict,
						$scope.candidate.addressStreet,
						$scope.candidate.addressHouseNumber,
					).success(function (val) {
						$scope.loading = false;
						$scope.boletoUrl = val.url;

					}).error(function (err) {

						if (err['error']) {
							$scope.error = 'Tivemos um problema para gerar seu boleto poderia tentar novamente';
							$scope.loading = false;

						}
					})
				} else {

					$scope.senderHash = PagSeguroDirectPayment.getSenderHash();
					$scope.creditCardPayment();

				}
			}
		}

		}

	}]);
