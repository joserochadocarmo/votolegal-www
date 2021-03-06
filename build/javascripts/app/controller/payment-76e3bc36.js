

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

		$scope.disabledFields = {
			addressState: true,
			addressCity: true,
			addressDistrict: true,
			addressStreet: true,
		}

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
				brandCard: ''
			}
		};

		$scope.sendButtonAllow = true;
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
		$scope.token = '';
		$scope.errorListPaymentServer = [];
		$scope.paymentFields = true;
		$scope.mensagem_sucesso = '';

		if (CONFIG.paymentGateway === 'iugu' && typeof Iugu !== 'undefined') {
			Iugu.setAccountID('68DE978054A6496F9C1AC8214381195C');

			if (CONFIG.environment === 'development') {
				Iugu.setTestMode(true);
			}
		}

		$scope.validateCreditCardNumber = function () {
			if (CONFIG.paymentGateway !== 'iugu') return;

			var isCardNumberValid = !$scope.candidate.card.cardNumber
				? false
				: Iugu.utils.validateCreditCardNumber($scope.candidate.card.cardNumber);

			return $scope.pagamento.cardNumber.$setValidity('creditCardInvalid', isCardNumberValid);
		}

		_getCreditCardBrandIugu = function () {
			return $scope.candidate.card.brandCard = !$scope.candidate.card.cardNumber
				? false
				: Iugu.utils.getBrandByCreditCardNumber($scope.candidate.card.cardNumber);
		}

		$scope.validateCreditCardBrand = function () {
			if (CONFIG.paymentGateway !== 'iugu') return;

			return !_getCreditCardBrandIugu()
				? $scope.pagamento.cardNumber.$setValidity('creditCardInvalidBrand', false)
				: $scope.pagamento.cardNumber.$setValidity('creditCardInvalidBrand', true);
		}

		$scope.validateCreditCardExpirationDate = function () {
			if (CONFIG.paymentGateway !== 'iugu') return;

			var expirationMonthAndYear = $scope.candidate.card.monthCardExpire + '/' + $scope.candidate.card.yearCardExpire;
			var isExpirationValid = expirationMonthAndYear.indexOf('/') < 2
				? false
				: Iugu.utils.validateExpirationString(expirationMonthAndYear);

			return $scope.pagamento.yearCardExpire.$setValidity('creditCardInvalidDate', isExpirationValid);
		}

		$scope.validateCreditCardCvv = function () {
			if (CONFIG.paymentGateway !== 'iugu') return;

			var isCvvValid = !$scope.candidate.card.cvvCard || !$scope.candidate.card.brandCard
				? false
				: Iugu.utils.validateCVV($scope.candidate.card.cvvCard, $scope.candidate.card.brandCard);

			return $scope.pagamento.cvvCard.$setValidity('creditCardInvalidCvv', isCvvValid);
		}

		_createCreditCardObjectIugu = function () {
			var names = $scope.candidate.card.name.split(' ');
			var name = names.shift();
			var surname = names.join(' ') || '';

			return Iugu.CreditCard(
				$scope.candidate.card.cardNumber,
				$scope.candidate.card.monthCardExpire,
				$scope.candidate.card.yearCardExpire,
				name,
				surname,
				$scope.candidate.card.cvvCard
			);
		}

		_submitCcPaymentUsingIugu = function () {
			var cc = _createCreditCardObjectIugu();
			var isCcValid = cc.valid();

			if (!isCcValid) {
				$scope.errorListPaymentServer.push({
					title: 'cartão inválido'
				});
				return $scope.loading = false;
			}

			$scope.errorListPaymentServer = [];

			Iugu.createPaymentToken(cc, function (response) {
				if (response.errors) {
					return $scope.errorListPaymentServer.push(error_msg(response.errors.form_error.message));
				} else {
					$scope.token = response.id;
					return _submitPayment();
				}
			});
		}

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

			if (localStorageUserData) {
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
					payment_method: localStorageUserData.payment_method,
					card: $scope.candidate.card
				}
			}
		}
		$scope.chargeUser()
		//Start session
		$scope.getSessionId()
			.then(function (val) {
				$scope.boletoUrl = null;

				if (CONFIG.paymentGateway === 'pagseguro'){
					$scope.SetSessionId(val.data.id)
				}
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
						var error = 'Tivemos um problema com as identificação da bandeira do cartão poderia tentar novamente'

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

					$scope.payment(response);
				},
			});
		}

		convertErrorToJson = function (string) {
			if (string.error == 'form_error'){
				var xmlValue = Object.values(string.form_error)

				var x2js = new X2JS();
				var jsonError = x2js.xml_str2json(xmlValue);

				if (jsonError.errors && jsonError.errors.error) {
					errors = jsonError.errors.error;
					errorList = [];

					if (errors.code && errors.message) {
						var message = error_msg(errors.code) || errors.code + ':' + errors.message;
						if (message !== undefined) {
							errorList.push({
								title: message
							});
						}
					} else {
						for (var i = 0; i < errors.length; i++) {
							var message = error_msg(errors[i]['code']) || errors[i]['code'] + ':' + errors[i]['message'];
							if (message !== undefined) {
								errorList.push({
									title: message
								});
							}
						}
					}
					$scope.errorListPaymentServer = errorList;
				}
			} else {
				$scope.error = 'Usuário não encontrado'
			}
		}

		$scope.payment = function (data) {
			if (data.errors) {
				$scope.error = 'Tivemos um problema com os dados do cartão, por gentileza confirme seus dados.';
				$scope.loading = false;
			} else {
				var credit_card_token = data.card.token;
				var userId = localStorage.getItem("userId");

			$scope.$apply(function(){

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
				).success(function (success) {

					localStorage.removeItem('address');
					$scope.loading = false;
					$scope.success = 'Sucesso';
					localStorage.setItem('paymentRedirect', 1)
					document.location = '/pagamento/analise';

					}).error(function (err) {
						$scope.loading = false;
						convertErrorToJson(err);

					})
				})
			}
		}

		$scope.manageCondition = function (t) {
			if (t.$modelValue = 'creditCard') {
				$scope.boletoUrl = null;
			}
			$scope.sendButtonAllow = false;
		}

		$scope.focusErrorForm = function(){
			var elementError = document.querySelector('#pagamento .ng-invalid');
			elementError.focus()
			var react = elementError.getBoundingClientRect();
			window.scroll(react.x, react.y)
		}

		$scope.cepRequest = function () {
			return $http({
				method: 'GET',
				url: '//api-apoiadores.appcivico.com/cep?cep=' + $scope.candidate.zipCode,
			}).then(function (response) {
				console.log ('response', response);

				$scope.disabledFields.addressState = !!response.data.state;
				$scope.disabledFields.addressCity = !!response.data.street;
				$scope.disabledFields.addressDistrict = !!response.data.district;
				$scope.disabledFields.addressStreet = !!response.data.street;

				$scope.candidate.addressStreet = response.data.street;
				$scope.candidate.addressState = response.data.state;
				$scope.candidate.addressCity = response.data.city;
				$scope.candidate.addressDistrict = response.data.district;
			})
		}

		_submitPayment = function () {
			var name = $scope.paymentMethod === 'creditCard'
				? $scope.candidate.card.name
				: $scope.candidate.name;

			var userId = localStorage.getItem("userId");

			$scope.loading = true;

			return payment_pagseguro.payment(
				userId,
				$scope.senderHash,
				$scope.token,
				$scope.paymentMethod,
				name,
				$scope.candidate.email,
				$scope.candidate.phone,
				$scope.candidate.zipCode,
				$scope.candidate.addressState,
				$scope.candidate.addressCity,
				$scope.candidate.addressDistrict,
				$scope.candidate.addressStreet,
				$scope.candidate.addressHouseNumber,
			).success(function (response) {
				if ($scope.paymentMethod === 'creditCard') {
					$scope.mensagem_sucesso = 'Sucesso';
					localStorage.setItem('paymentRedirect', 1);
					document.location = '/pagamento/analise';
				} else if ($scope.paymentMethod === 'boleto') {
					$scope.boletoUrl = response.url;
					$scope.mensagem_sucesso = response.mensagem_sucesso;
				}

				$scope.loading = false;
			}).error(function (errors) {

				var errorMessage = !!errors.form_error.message
					? error_msg(errors.form_error.message)
					: error_msg(errors.error);
				$scope.errorListPaymentServer.push(errorMessage);

				$scope.loading = false;
			});
		}

		$scope.submit = function (valid, form) {
			$scope.error = '';
			$scope.errorListPaymentServer = [];

			if (valid) {
				if (CONFIG.paymentGateway === 'iugu') {

					$scope.loading = true;

					if (form.typePayment.$viewValue == 'creditCard') {
						return _submitCcPaymentUsingIugu();
					} else if (form.typePayment.$viewValue == 'boleto') {
						return _submitPayment();
					}
				}

				if (form.typePayment.$viewValue == 'boleto') {
					var userId = localStorage.getItem("userId");
					$scope.senderHash = PagSeguroDirectPayment.getSenderHash();
					var credit_card_token = null;
					$scope.loading = true;

					payment_pagseguro.payment(
						userId,
						$scope.senderHash,
						credit_card_token,
						$scope.paymentMethod,
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
						$scope.mensagem_sucesso = val.mensagem_sucesso;

					}).error(function (err) {
						$scope.loading = false;
						convertErrorToJson(err);
					})
				} else {
					$scope.senderHash = PagSeguroDirectPayment.getSenderHash();
					$scope.creditCardPayment();

				}
			}else{
				$scope.focusErrorForm();
			}
		}
	}

]);
