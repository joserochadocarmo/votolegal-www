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
		SweetAlert,

	) {
		if (JSON.parse(localStorage.getItem("user") == null) && localStorage.getItem("userId") == null) {
			document.location = "/";
		}

		$scope.user = JSON.parse(localStorage.getItem("user")) || localStorage.getItem("userId");

		$scope.userIdDefined = ($scope.user.id) ? $scope.user.id : $scope.user;


		$scope.candidate = {
			name: '',
			email: '',
			cpf: '',
			phone: '',
			zipCode: '',
			addressState:'',
			addressCity: '',
			addressDistrict: '',
			addressStreet: '',
			addressHouseNumber:'',
			card:{
				name:'',
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
		$scope.error = false;

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
				$scope.boletoUrl = null;
				$scope.SetSessionId(val.data.id)
			})

		$scope.creditCardPayment = function () {
			$scope.loading = true;
			$scope.getSenderHash()

			var num = $scope.candidate.card.cardNumber + '';
			num =  num.split(' ').join('');

			return PagSeguroDirectPayment.getBrand({
				cardBin: num,
				success: function (response) {
					console.log('brandCards success', response)
				},
				error: function (response) {
					console.log(response, 'erro brands in erro ')
				},
				complete: function (response) {

					console.log(response, ' brands in complete')
					window.vLcardBrand = response.brand.name;
					getBrandCard(response).then(function (res) {

						$scope.createCardToken(res.brand.name)
					});
				}
			});
		}

		getBrandCard = function (res) {
			return new Promise(function (resolve) {
				resolve(res);
			})
		}
		$scope.redirectBoleto = function(){
			$scope.boletoUrl = null;

		}

		$scope.createCardToken = function (brand) {

			var num = $scope.candidate.card.cardNumber + '';
			num =  num.split(' ').join('');

				PagSeguroDirectPayment.createCardToken({
				cardNumber: num,
				brand: brand,
				cvv: $scope.candidate.card.cvvCard,
				expirationMonth: $scope.candidate.card.monthCardExpire,
				expirationYear: $scope.candidate.card.yearCardExpire,
				success: function (response) {
					console.log('cartdToken success', response)
				},
				error: function (response) {
					console.log('cartdToken error', response)
				},
				complete: function (response) {

					var credit_card_token = response.card.token;
					var userId = localStorage.getItem("userId");
					var sender_hash = PagSeguroDirectPayment.getSenderHash()

					payment_pagseguro.payment(
						userId,
						sender_hash,
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
						).then(function(){
							$scope.loading = false;
						})

				},
			});

		}
		$scope.payment = function(){

		}

		$scope.cepRequest = function(){
			return $http({
				method: 'GET',
				url: '//api-apoiadores.appcivico.com/cep?cep=' + $scope.candidate.zipCode,
				}).then(function(response){
					$scope.candidate.addressStreet = response.data.street;
					$scope.candidate.addressState = response.data.state;
					$scope.candidate.addressCity = response.data.city;
					$scope.candidate.addressDistrict = response.data.district;
				})
			}

		$scope.submit = function (valid, form) {

			if(valid){

				if(form.typePayment.$viewValue == 'boleto'){
					var userId = localStorage.getItem("userId");
					var sender_hash = PagSeguroDirectPayment.getSenderHash();
					var credit_card_token = null;
					$scope.loading = true;

					 var response  = payment_pagseguro.payment(
						userId,
						sender_hash,
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
						).success(function(val){

						console.log(val)
							$scope.loading = false;

							$scope.boletoUrl = val.url

						}).error(function(err){

							if(err['error']){
								$scope.error = true;
								$scope.loading = false;
							}

						})

				}else{
					$scope.creditCardPayment();
				}
			}

		}
	}]);
