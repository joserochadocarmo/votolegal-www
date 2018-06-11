/**
 * Histórico Doações Controller
 */

app.votolegal.controller('DonationHistoryController', ["$scope", "$http", "$sce", "serialize", "auth_service", "SweetAlert", "trouble", "postmon", function($scope, $http, $sce, serialize, auth_service, SweetAlert, trouble, postmon){
	var load   = document.querySelector('#loading');

	// defaults
	$scope.user       = auth_service.current_user();
	$scope.error_list = [];
	$scope.config = {
		fillLastPage: 'yes',
		paginatorLabels: {
			first: "Primeira",
			last: "Última",
			jumpBack:'...',
			stepBack:'...',
			stepAhead:'...',
			jumpAhead:'...'
		},
		itemsPerPage: 10,
	};

	$scope.donations  = [];
	$scope.download   = {};

	/* methods */
	$scope.history_list = function(user){
		var table   = document.querySelector('#donations-table');
		var loading = document.querySelector('#loading-donations');
		var error   = document.querySelector('#donations-error');
		if(error) error.classList.add('hide');

		if(table) {
			table.classList.add('hide');
			if(loading) loading.classList.remove('hide');
		}

		try {
			$http({
				method: 'GET',
				url: BASE_API_JS + '/candidate/'+ user.id +'/votolegal-donations?results=9999&api_key=' + user.api_key
			}).
			then(
				function(response){
					var res = response.data.donations;

					for (var i in res){
						// parsing date
						res[i].captured_at = Date.parse(res[i].captured_at);

						// format birthday
						if (res[i].birthdate) {
							var birth = res[i].birthdate.match(/^(\d{4})\-(\d{2})\-(\d{2})$/);
							res[i].birthday = birth[3]+"/"+birth[2]+"/"+birth[1];
						} else {
							res[i].birthday = '';
						}
					}

					$scope.donations = res;

					// diasble loading
					if(table) {
						if(loading) loading.classList.add('hide');
						table.classList.remove('hide');
					}
				},
				function(response){
					// diasble loading
					if(table) {
						if(loading) loading.classList.add('hide');
						table.classList.remove('hide');
					}
					trouble.shoot({
						route: document.location.href, error: JSON.stringify(response)
					});

					SweetAlert.swal('Falha no carregamento dos dados', 'Não foi possível carregar os dados de doações.');
					throw new Error('Donation list is invalid or cannot be found!');
				}
			);
		} catch(e){
			if(table) {
				if(loading) loading.classList.add('hide');
				table.classList.remove('hide');
			}

			trouble.shoot({
				route: document.location.href, error: JSON.stringify(e)
			});

			SweetAlert.swal('Falha no carregamento dos dados', 'Não foi possível carregar os dados de doações.');
		}
	};

	// setting download of donations table
	$scope.download.csv_file = function(){
		var user = $scope.user;
		return BASE_API_JS + '/candidate/'+ user.id +'/donate/download/csv?api_key=' + user.api_key;
	};


	/**
	 * initializations
	 */
	auth_service.validate_user({role: 'user'});
	$scope.history_list($scope.user);

}]);
