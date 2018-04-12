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
		$location
	) {
		// $scope.error = false;
		// $scope.errorServer = false;

		// $scope.confirmContract = false;

		// console.log(
		// 	localStorage.getItem("userId"),
		// 	"aqui",
		// 	JSON.parse(localStorage.getItem("user"))
		// );

		// 	if (
		// 	JSON.parse(localStorage.getItem("user") == null) &&
		// 	localStorage.getItem("userId") == null
		// ) {
		// 	document.location = "/";
		// }

		// $scope.user = JSON.parse(localStorage.getItem("user")) || localStorage.getItem("userId") ;

		// $scope.userIdDefined = ($scope.user.id) ? $scope.user.id : $scope.user;

		// $scope.submit = function(event){
		// 	 event.preventDefault();


		$scope.method = "";
		$scope.userCardData = {
			name: '',
			email:'',
			cpf:'',
			cardNumber:'',
			monthCardExpire:'',
			yearCardExpire:'',
			cvvCard:'',
		}
		$scope.BrandCard ='';
		$scope.senderHash ='';

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
				.then(function(val){
					$scope.SetSessionId(val.data.id)
				.then(function(){
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
					getBrandCard(response).then(function(res){
						$scope.payment(res)
					});
				}
			});
		}
		getBrandCard = function(res){
			return new Promise(function(resolve){
				resolve(res);
			})
		}

		$scope.payment = function(brand){

			PagSeguroDirectPayment.createCardToken({
				cardNumber: $scope.userCardData.cardNumber,
				brand: brand.brand.name,
				cvv: $scope.userCardData.cvvCard,
				expirationMonth: $scope.userCardData.monthCardExpire,
				expirationYear: $scope.userCardData.yearCardExpire,
				success: function(reponse){
					console.log(response)

				},
				error: function () {

				},
				complete: function (response) {

				console.log(response, 'resonse')
						var userId = localStorage.getItem("userId");
						var hash = PagSeguroDirectPayment.getSenderHash()
						$scope.sendPayment( userId, hash, response.card.token)
				},
			});
		}

		$scope.sendPayment = function(userId, hash, tokenCard){
			payment_pagseguro.payment(userId, hash, tokenCard).then(function(val){
				console.log(val, 'val')
			})

		}
	}
]);
