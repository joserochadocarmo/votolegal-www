

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




		$scope.candidate = {
			name: '',
			email: '',
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
		$scope.errorListPaymentServer = [];
		$scope.localStorageUserData = JSON.parse(localStorage.getItem('address'));



		$scope.getSessionId = function () {
			return new Promise(function (resolve) {
				var res = localStorage.getItem("userId");
				resolve(session_pagseguro.getSessionId(res))

			})
		}
		$scope.SetSessionId = function (id) {
			return new Promise(function (resolve) {
				resolve(PagSeguroDirectPayment.setSessionId(id))

			})
		}
		$scope.chargeUser = function () {

			var localStorageUserData = JSON.parse(localStorage.getItem('address'));

			if ($scope.localStorageUserData){
				$scope.candidate = {
					name: localStorageUserData.name,
					email: localStorageUserData.email,
					phone: localStorageUserData.phone,
					zipCode: localStorageUserData.address_zipcode,
					addressState: localStorageUserData.address_state,
					addressCity: localStorageUserData.address_city,
					addressDistrict: localStorageUserData.address_street.split('-')[1],
					addressStreet: localStorageUserData.address_street,
					addressHouseNumber: localStorageUserData.address_house_number,
					amount: localStorageUserData.amount,
					peyment_method: localStorageUserData.peyment_method,

				}

			}

		}
		$scope.chargeUser()


		//Start session
		$scope.getSessionId()
			.then(function (val) {
				$scope.boletoUrl = null;
				$scope.SetSessionId(val.data.id)
				//charge data user in form

				// var localStorageUserData = JSON.parse(localStorage.getItem('address'));

				$scope.$digest();

			}, function (resp) {

				if (resp.data.error == "user did not sign contract") {

					window.location = '/contrato';
				}
			})

		$scope.creditCardPayment = function () {

			var num = $scope.candidate.card.cardNumber + '';
			num = num.split(' ').join('');

			PagSeguroDirectPayment.getBrand({
				cardBin: num,
				complete: function (response) {
					$scope.loading = false;
					if (response.error) {
						var error = 'Tivemos um problema com as identificação da bandeira do cartão poderia tentar novamento'

						$scope.manageError(response.error, error)


					} else {
						$scope.createCardToken(response.brand.name)
					}
				}
			});

		}

		$scope.redirectBoleto = function () {
			$scope.boletoUrl = null;

		}
		$scope.manageError = function (data, message) {
			$scope.error = message;
			$scope.$apply();

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


		convertErrorToJson = function (string) {

			var xmlValue = Object.values(string)
			var x2js = new X2JS();
			var jsonError = x2js.xml_str2json(xmlValue);

			if (jsonError.errors && jsonError.errors.error){
				errors = jsonError.errors.error;
				errorList = [];

				if (typeof errors === 'object') {
					errors = [errors];
				}

				for (var i = 0; i < errors.length; i++) {

					var message = error_msg(errors[0][i]['code']) || errors[i]['code'] + ':' + errors[i]['message'];

					errorList.push({title:message});
				}

				if (errorList.length > 0){
					$scope.errorListPaymentServer = errorList;
				}
			}
		}

		payment = function (data) {

			if (data.errors) {
				$scope.error = 'Tivemos um problema com os dados do cartão, por gentileza confirme seus dados.';
				$scope.loading = false;
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
					$scope.candidate.phone,
					$scope.candidate.zipCode,
					$scope.candidate.addressState,
					$scope.candidate.addressCity,
					$scope.candidate.addressDistrict,
					$scope.candidate.addressStreet,
					$scope.candidate.addressHouseNumber,
				).success(function (successs) {

					// localStorage.removeItem('userId');
					localStorage.removeItem('address');

					$scope.loading = false;
					$scope.success = 'Sucesso';
					localStorage.setItem('paymentRedirect', 1)

					document.location = '/pagamento/analise';



				}).error(function (err) {

					$scope.loading = false;

					convertErrorToJson(err.form_error);
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
			$scope.errorListPaymentServer = [];


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
						form.typePayment.$viewValue,
						$scope.candidate.name,
						$scope.candidate.email,
						$scope.candidate.phone,
						$scope.candidate.zipCode,
						$scope.candidate.addressState,
						$scope.candidate.addressCity,
						$scope.candidate.addressDistrict,
						$scope.candidate.addressStreet,
						$scope.candidate.addressHouseNumber,
					).success(function (val) {
						localStorage.removeItem('userId');
						localStorage.removeItem('address');
						$scope.loading = false;
						$scope.boletoUrl = val.url;


					}).error(function (err) {

						if (err['error'] === 'candidate not found') {
							$scope.error = 'Candidato nao encontrado';
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


]);