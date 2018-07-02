/**
 * Histórico Doações Controller
 */

app.votolegal.controller('DonationHistoryController', ["$scope", "$http", "$sce", "serialize", "auth_service", "SweetAlert", "trouble", "postmon", function ($scope, $http, $sce, serialize, auth_service, SweetAlert, trouble, postmon) {
	var load = document.querySelector('#loading');

	// defaults
	$scope.user = auth_service.current_user();
	$scope.sortOptions = [
		{
			label: 'mais antigas',
			name: 'asc'
		},
		{
			label: 'mais recentes',
			name: 'desc'
		}
	];
	$scope.sort = 'desc';
	$scope.hasMoreDonations = false;
	$scope.error_list = [];
	$scope.config = {
		fillLastPage: 'yes',
		paginatorLabels: {
			first: "Primeira",
			last: "Última",
			jumpBack: '...',
			stepBack: '...',
			stepAhead: '...',
			jumpAhead: '...'
		},
		itemsPerPage: 10,
	};

	$scope.donationsReportDate = null;
	$scope.donationsLoading = false;
	$scope.donationsError = false;

	$scope.donationsRecent = [];
	$scope.donationsRecentCount = 0;
	$scope.donations = [];
	$scope.download = {};
	$scope.donationsStatuses = [];
	$scope.status = 'captured';

	$scope.getDonationsList = function (positionToInsert) {
		var user = $scope.user;
		var lastDonation = $scope.donations[$scope.donations.length - 1];
		var markerSegment = (positionToInsert === 'after' && !!lastDonation && !!lastDonation._marker)
		? '/' + lastDonation._marker
		: '';

		var url = BASE_API_JS + '/candidate/' + user.id + '/votolegal-donations' + markerSegment + '?api_key=' + user.api_key + ( !!$scope.status ? '&filter=' + $scope.status : '' ) + '&order_by_created_at=' + $scope.sort;

		if ( positionToInsert !== 'before' && positionToInsert !== 'after' && positionToInsert !== '' ) {
			positionToInsert = '';
		}

		if (positionToInsert === '') {
			$scope.donationsRecent = [];
			$scope.donationsRecentCount = 0;
			$scope.donations = [];
		}

		if (positionToInsert !== 'before') {
			$scope.donationsLoading = true;
		}

		try {
			$http({
				method: 'GET',
				url: url
			}).
			then(
				function (response) {
					var res = response.data.donations;

					for (var i in res) {
						// format birthday
						if (res[i].birthdate) {
							var birth = res[i].birthdate.match(/^(\d{4})\-(\d{2})\-(\d{2})$/);
							res[i].birthday = birth[3] + "/" + birth[2] + "/" + birth[1];
						} else {
							res[i].birthday = '';
						}
					}

					if (response.data.statuses) $scope.donationsStatuses = response.data.statuses;
					if (response.data.sortOptions) $scope.sortOptions = response.data.order_by_created_at;
					if (response.data.generated_at) $scope.donationsReportDate = response.data.generated_at;

					$scope.hasMoreDonations = response.data.has_more !== undefined
						? !!response.data.has_more
						: false;

					if (!positionToInsert) {
						$scope.donations = res;
					} else if (positionToInsert === 'before' ) {
						var donationToCompare = $scope.donationsRecent.length === 0
							? $scope.donations[0]
							: $scope.donationsRecent[0];

						if (!!donationToCompare) {
							if ($scope.donations.length === 0) {

								$scope.donationsRecentCount = res.length;
								$scope.donationsRecent = res;

							} else {
								var i = 0;

								while ( !!res[i] && res[i]._marker !== donationToCompare._marker ) {
									i += 1;
								}

								if (i > 0){
									$scope.donationsRecentCount += i;
									$scope.donationsRecent = res;
								}
							}
						}

					} else if (positionToInsert === 'after' ) {
						$scope.donations = $scope.donations.concat(res);
					}

					$scope.donationsLoading = false;
				},
				function (response) {
					$scope.donationsLoading = false;
					$scope.donationsError = true;
					trouble.shoot({
						route: document.location.href,
						error: JSON.stringify(response)
					});

					SweetAlert.swal('Falha no carregamento dos dados', 'Não foi possível carregar os dados de doações.');
					throw new Error('Donation list is invalid or cannot be found!');
				}
			);
		} catch (e) {
			$scope.donationsLoading = false;
			$scope.donationsError = true;
			trouble.shoot({
				route: document.location.href,
				error: JSON.stringify(e)
			});

			SweetAlert.swal('Falha no carregamento dos dados', 'Não foi possível carregar os dados de doações.');
		}
	}

	/* methods */
	$scope.history_list = function () {
		var table = document.querySelector('#donations-table');

		if (table) {
			$scope.getDonationsList('after');

			window.setInterval(
				function () {
					$scope.getDonationsList('before');
				}, 5 * 1000 * 60);
		}

		// TO-DO: call for new donations on intervals
	};

	$scope.refreshDonationsList = function () {
		$scope.donations = $scope.donationsRecent;

		$scope.donationsRecentCount = 0;
		$scope.donationsRecent = [];
	};

	// setting download of donations table
	$scope.download.csv_file = function () {
		var user = $scope.user;
		return BASE_API_JS + '/candidate/' + user.id + '/donate/download/csv?api_key=' + user.api_key + '&filter=' + $scope.status + '&order_by_created_at=' + $scope.sort;
	};


	/**
	 * initializations
	 */
	auth_service.validate_user({
		role: 'user'
	});
	$scope.history_list($scope.user);

}]);
