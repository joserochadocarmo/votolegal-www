if (document.location.href.indexOf('/cadastro-completo') >= 0) {
	app.votolegal.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
		$routeProvider.
		when('/dados-pessoais', {
			templateUrl: '/javascripts/app/view/cadastro/dados-pessoais.tmpl',
			controller: 'CadastroController',
			activetab: 'pessoal'
		}).
		when('/dados-campanha', {
			templateUrl: '/javascripts/app/view/cadastro/dados-campanha.tmpl',
			controller: 'CadastroController',
			activetab: 'campanha'
		}).
		when('/projetos', {
			templateUrl: '/javascripts/app/view/cadastro/projetos.tmpl',
			controller: 'CadastroController',
			activetab: 'projetos'
		}).
		when('/contrato', {
			templateUrl: '/javascripts/app/view/contrato/index.tmpl',
			controller: 'ContractController',
		}).
		when('/certiface/:token', {
			templateUrl: '',
			controller: 'CandidateController',
		}).
		otherwise({
			redirectTo: '/dados-pessoais',
			activetab: 'pessoal'
		});
	}]);

	var pid = window.setInterval(function () {
		if (typeof (Storage) !== "undefined") {
			var progress = localStorage.progress;

			var p = document.querySelector("div[role=progressbar]");
			p.innerHTML = progress + "%";
			p.style.width = progress + "%";
		}
	}, 500);
}

var BASE_API = '//dapi.votolegal.com.br/api';

var BASE_API_JS = '';

var server = window.location;
if (server.hostname == 'dev-participe.votolegal.com.br' || server.hostname == 'localhost') {
	BASE_API_JS = '//dapi.votolegal.com.br/api';
} else {
	BASE_API_JS = '//dapi.votolegal.com.br/api';
}

/**
 * Cadastro controller
 * Register a new candidate
 */
app.votolegal.controller('CadastroController', ['$scope', '$http', '$location', '$route', '$interval', 'auth_service', 'serialize', 'SweetAlert', 'trouble', function ($scope, $http, $location, $route, $interval, auth_service, serialize, SweetAlert, trouble) {
	$scope.candidate = {};
	$scope.issue_list = [];
	$scope.projects = [{
		id: 0,
		title: '',
		scope: '',
		changed: true
	}];
	$scope.bank_list = [];
	$scope.payment_gateway_list = [];

	$scope.error_list = [];
	$scope.submit_disabled = false;
	$scope.progress = 0;

	// count days to 15/08/2016
	$scope.date_to_profile = (function () {
		var difference = 0;
		difference = (new Date("08/15/2016 00:00:00")) - (new Date());
		return Math.round(difference / (1000 * 60 * 60 * 24)) + 1;
	})();

	// change input-file filename
	$scope.change_filename = function (name) {
		var filename = document.querySelector('input[name=' + name + ']');
		var value = filename.value.split(/\/|\\/g).reverse()[0];
		document.querySelector('.' + name + '_filename').value = value;

		if (name === 'picture' && filename.files.length > 0) {
			var file = filename.files[0];
			if ((Math.round(file.size * 100 / (1024 * 1024)) / 100) > 1) {
				SweetAlert.swal("Sua imagem de perfil é muito grande", "A imagem deve ter no máximo 1MB de tamanho!");
				throw new Error('IMAGE_MAXSIZE_ERROR');
				return false;
			}
		}
	};


	$scope.check_percent = function () {
		var p = 0;

		// personal data
		if ($scope.candidate) {
			var $c = $scope.candidate;
			if ($c.picture && $c.picture.length > 0) p += 4;
			if ($c.cnpj && $c.cnpj.length > 0) p += 4;
			if ($c.video_url && $c.video_url.length > 0) p += 4;
			if ($c.facebook_url && $c.facebook_url.length > 0) p += 4;
			if ($c.twitter_url && $c.twitter_url.length > 0) p += 4;
			if ($c.instagram_url && $c.instagram_url.length > 0) p += 4;
			if ($c.website_url && $c.website_url.length > 0) p += 4;
			if ($c.public_email && $c.public_email.length > 0) p += 4;
			if ($c.summary && $c.summary.length > 0) p += 4;
			if ($c.biography && $c.biography.length > 0) p += 4;
			if ($c.responsible_name && $c.responsible_name.length > 0) p += 4;
			if ($c.responsible_email && $c.responsible_email.length > 0) p += 4;



			if ($c.raising_goal && $c.raising_goal.length > 0) p += 5;
			if ($c.merchant_id && $c.merchant_id.length > 0) p += 5;
			if ($c.merchant_key && $c.merchant_key !== undefined) p += 5;
			if ($c.spending_spreadsheet && $c.spending_spreadsheet.length > 0) p += 7;
		}

		// personal data
		if ($scope.issue_list) {
			var $i = $scope.issue_list;
			if ($i && $i.length > 0) p += 10;
		}

		// project data
		if ($scope.projects) {
			if ($scope.projects && $scope.projects.length >= 4) p += 20;
		}

		$scope.progress = p;

		// save to session
		var session = auth_service.session();

		session.set('progress', p);
	};

	// mark project as changed
	$scope.changed_project = function (index) {
		$scope.projects[index].changed = true;
	};

	// save candidate data
	$scope.save_candidate = function (index) {
		$scope.error_list = [];
		var params = $scope.candidate_params();

		var user = auth_service.current_user();
		params.api_key = user.api_key;

		$scope.submit_disabled = true;
		try {
			$http({
				method: 'PUT',
				url: BASE_API_JS + '/candidate/' + user.id + "?api_key=" + user.api_key,
				data: params,
				headers: {
					'Content-Type': undefined
				},
				transformRequest: function (data) {

					var fd = new FormData();
					for (var p in data) fd.append(p, data[p]);
					// add file to form_data
					var file_field = document.querySelector('input[name=picture]');
					if (file_field.files.length > 0) {
						var file = file_field.files[0];
						fd.append("picture", file, file.name);

						if ((Math.round(file.size * 100 / (1024 * 1024)) / 100) > 1) {
							SweetAlert.swal("Sua imagem de perfil é muito grande", "A imagem deve ter no máximo 1MB de tamanho!");
							$scope.submit_disabled = false;
							return new FormData();
						}
					}
					return fd;
				}
			}).then(function (response) {
				SweetAlert.swal('Os dados da campanha foram salvos!');
				$scope.submit_disabled = false;
				$scope.check_percent();
			}, function (response) {

				var res = response;

				// send generic error
				trouble.shoot({
					route: document.location.href,
					error: JSON.stringify(res)
				});

				if (!res.data) {
					SweetAlert.swal('Erro ao salvar os dados!');
					return false
				}
				res = response.data.form_error;
				var f = function (field) {
					return document.querySelector('form[name=candidateForm] label[for=' + field + ']');
				};

				// setting error message
				for (var field in res) {
					if (field == 'picture' && res[field] === 'invalid image') {
						$scope.error_list.push("Arquivo de imagem inválido!");
						return false;
					}

					var name = f(field).innerText;
					$scope.error_list.push(name + error_msg(res[field]));
				}

				// enable submit
				$scope.submit_disabled = false;

				// throw an exception
				//SweetAlert.swal('Error', 'Os dados da campanha não puderam ser salvos!');
				throw new Error('ERROR_SAVING_CANDIDATE');

				return false;
			});
		} catch (e) {
			trouble.shoot({
				route: document.location.href,
				error: JSON.stringify(e)
			});

			$scope.submit_disabled = false;
			console.error(e);
		}

		return false;
	};
	// save campaign data
	$scope.save_campaign = function (index) {

		$scope.error_list = [];
		var params = $scope.campaign_params();
		console.log(params);

		var user = auth_service.current_user();
		params.api_key = user.api_key;

		$scope.submit_disabled = true;
		try {
			$http({
				method: 'PUT',
				url: BASE_API_JS + '/candidate/' + user.id + "?api_key=" + user.api_key,
				data: params,
				headers: {
					'Content-Type': undefined
				},
				transformRequest: function (data) {
					var fd = new FormData();
					for (var p in data) fd.append(p, data[p]);
					// add file to form_data
					var file_field = document.querySelector('input[name=spending_spreadsheet]');
					if (file_field.files.length > 0) {
						var file = file_field.files[0];
						fd.append("spending_spreadsheet", file, file.name);
					}
					return fd;
				}
			}).then(function (response) {
				SweetAlert.swal('Os dados da campanha foram salvos!');
				$scope.submit_disabled = false;
				$scope.check_percent();
			}, function (response) {
				console.log(response, 'response')
				var res = response.data.form_error;

				// spreadsheet invalid
				if (res.hasOwnProperty('spending_spreadsheet') && res.form_error.spending_spreadsheet == "invalid file") {
					SweetAlert.swal('Formato do arquivo de Planilha de Gastos inválido!');
					return false;
				}

				var f = function (field) {
					return document.querySelector('form[name=campaignForm] label[for=' + field + ']');
				};

				// setting error message
				for (var field in res) {
					if ( f(field) != null ){
						var name = f(field).innerText;
						$scope.error_list.push(name + error_msg(res[field]));
					}
				}

				// enable submit
				$scope.submit_disabled = false;

				// throw an exception
				//SweetAlert.swal('Error', 'Os dados da campanha não puderam ser salvos!');
				throw new Error('ERROR_SAVING_CAMPAIGN');

				return false;
			});
		} catch (e) {
			trouble.shoot({
				route: document.location.href,
				error: JSON.stringify(e)
			});
			$scope.submit_disabled = false;
		}
		return false;
	};

	// save project data
	$scope.save_project = function (index) {
		var p = $scope.projects[index];

		if (p.title == '' || p.scope == '') {
			SweetAlert.swal('Os campos de Titulo e Descrição são obrigatórios');
			return false;
		}

		// build params
		var params = {
			title: p.title,
			scope: p.scope
		};
		if (p.hasOwnProperty('id') && p.id > 0) params.id = p.id;

		// getting user data
		var user = auth_service.current_user();
		params.api_key = user.api_key;

		$http({
			method: (p.id && p.id > 0) ? 'PUT' : 'POST',
			url: BASE_API_JS + '/candidate/' + user.id + '/projects' + (p.id && p.id > 0 ? '/' + p.id : '') + "?api_key=" + user.api_key,
			data: serialize.from_object(params),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
		}).then(function (response) {

			//$scope.projects[index].changed = false;
			SweetAlert.swal('O projeto foi salvo!');
			$scope.check_percent();
		}, function (response) {
			SweetAlert.swal('Error', 'O projeto não pode ser salvo!');
			throw new Error('ERROR_SAVING_PROJECT');
		});

		return false;
	};


	$scope.new_project = function () {
		$scope.projects.push({
			id: 0,
			title: '',
			scope: '',
			changed: true
		});
		return false;
	};


	/**
	 * remove data
	 */
	$scope.remove_project = function (index) {
		var item = $scope.projects[index];

		SweetAlert.swal({
				title: "Tem certeza?",
				text: "Você tem certeza que deseja remover este projeto?",
				showCancelButton: true,
				confirmButtonText: "Sim",
				cancelButtonText: "Não",
				closeOnConfirm: true,
				closeOnCancel: true
			},
			function (isConfirm) {
				if (isConfirm) {
					if (item.hasOwnProperty('id') && item.id > 0) {
						var user = auth_service.current_user();
						$http.delete(BASE_API_JS+'/candidate/' + user.id + '/projects/' + item.id + '?api_key=' + user.api_key
						).then(function (response) {
							$scope.projects.splice(index, 1);
							swal('O projeto foi removido com sucesso!');
							$scope.check_percent();
						}, function (response) {
							throw new Error('ERROR_DELETE_PROJECTS')
						});
					} else {
						$scope.projects.splice(index, 1);
					}
				}
			});

		return false;
	};


	/**
	 * validate data
	 */
	$scope.count_checked = function (el) {
		var list = $scope.issue_list.filter(function (i) {
			if (i.selected) return true;
		});

		if (list.length > 4) {
			if (el) el.i.selected = false;
			swal('Selecione apenas 4 assuntos prioritários.');
		}
		return false;
	};


	/**
	 * form params
	 */
	$scope.candidate_params = function () {
		return Params
			.require($scope.candidate)
			.permit('picture', 'video_url', 'facebook_url', 'twitter_url', 'instagram_url', 'website_url', 'public_email', 'summary', 'biography', 'responsible_name', 'responsible_email', 'cnpj', 'bank_agency', 'bank_agency_dv', 'bank_account_number', 'bank_account_dv', 'bank_code')
	};

	$scope.campaign_params = function () {
		var selected_list = $scope.issue_list.filter(function (i) {
			if (i.selected) return true;
		});

		var list = [];
		for (var i in selected_list) list.push(selected_list[i].id);

		// fallback for decimal number
		var raising_goal_field = 0.0;
		if ($scope.candidate.raising_goal && $scope.candidate.raising_goal !== undefined) {
			raising_goal_field = parseFloat($scope.candidate.raising_goal || 0);
			if (raising_goal_field.toString().indexOf('.') != -1) raising_goal_field += '.00';
		}

		var p = {
			raising_goal: raising_goal_field,
			issue_priorities: list.join(','),
			payment_gateway_id: $scope.candidate.payment_gateway_id,
			merchant_id: $scope.candidate.merchant_id,
			merchant_key: $scope.candidate.merchant_key,
			crawlable: $scope.candidate.crawlable || 'false'
		};

		return Params
			.require(p)
			.permit('raising_goal', 'issue_priorities', 'merchant_key', 'merchant_id', 'payment_gateway_id', 'crawlable');
	};

	$scope.projects_params = function () {
		var list = [];
		var project_list = document.querySelectorAll('.project-item');
		for (var i = 0; i < project_list.length; i++) {
			var n = project_list[i];
			var id = n.getAttribute("data-id").replace('item-', ''),
				title = n.querySelector('input[name=project_title]').value,
				content = n.querySelector('textarea[name=project_content]').value;

			list.push({
				'id': id,
				'title': title,
				'content': content
			});
		}
		return list;
	};


	/**
	 * getting data
	 */
	$scope.get_candidate = function () {
		var params = {};

		var user = auth_service.current_user();
		params['api_key'] = user.api_key;

		$http.get(BASE_API_JS+'/candidate/' + user.id + '?api_key=' + user.api_key)
			.then(
				function (response) {

					$scope.candidate = response.data.candidate;

					if ($scope.candidate.paid == 0 && $scope.candidate.signed_contract == 0 &&  $scope.candidate.payment_created == 0) {
						document.location = '/contrato';
					}else if ($scope.candidate.paid == 0 && $scope.candidate.signed_contract == 1 &&  $scope.candidate.payment_created == 0) {
						document.location = '/pagamento';
					}else if ($scope.candidate.paid == 0 && $scope.candidate.signed_contract == 1 &&  $scope.candidate.payment_created == 1) {
						document.location = '/pre-cadastro/analise';
					}

					(function () {
						var boleto = document.querySelector('#show-boleto');
						if (boleto && $scope.candidate.status === 'activated') boleto.classList.remove('hide');
					})();

					if ($scope.candidate.crawlable && $scope.candidate.crawlable == 0) $scope.candidate.crawlable = 'false';
					else $scope.candidate.crawlable = 'true';

					$scope.get_issues_priority();
					$scope.get_gateways();
				},
				function (response) {
					throw new Error('ERROR_GET_CANDIDATE')
				}
			);
		return false;
	};

	$scope.get_projects = function () {
		var user = auth_service.current_user();

		$http.get(
			BASE_API_JS +'/candidate/' + user.id + '/projects', {
				api_key: user.api_key
			}
		).then(function (response) {
			var list = response.data.projects.map(function (i) {
				i.changed = false;
				return i
			});
			if (list.length > 0) $scope.projects = list;
			$scope.check_percent();
		}, function (response) {
			throw new Error('ERROR_GET_PROJECTS')
		});
	};

	$scope.get_issues_priority = function () {
		$http.get(BASE_API_JS +'/issue_priority').
		then(
			function (response) {
				$scope.issue_list = response.data.issue_priority;

				for (var i in $scope.issue_list) {
					if ($scope.candidate.hasOwnProperty('candidate_issue_priorities')) {
						$scope.candidate.candidate_issue_priorities.map(function (item) {
							if ($scope.issue_list[i].id == item.id) $scope.issue_list[i].selected = true;
						});
					}
				}

				$scope.check_percent();
			},
			function (response) {
				throw new Error('ERROR_GET_ISSUE_PRIORITY')
			}
		);
	};
	// get banks list
	$scope.get_banks = function () {
		$http({
			method: 'GET',
			url: BASE_API_JS + '/bank',
		}).
		then(function (response) {
			$scope.bank_list = response.data.bank;
		}, function (response) {
			trouble.shoot({
				route: '/cadastro/boleto',
				error: JSON.stringify(response)
			});
			throw new Error("ERROR_GET_BANK");
		});
		return false
	};


	$scope.get_gateways = function () {
		$http({
			method: 'GET',
			url: BASE_API_JS + '/payment_gateway',
		}).then(function (response) {
			$scope.payment_gateway_list = response.data.payment_gateway;
		}, function (response) {
			trouble.shoot({
				route: '/api/payment_gateway',
				error: JSON.stringify(response)
			});
			throw new Error("ERROR_GET_PAYMENT_GATEWAY");
		});
	};



	/**
	 * initializations
	 */
	auth_service.validate_user({
		role: 'user'
	});

	// load candidate data (issues are loaded into get_candidate cb)
	$scope.get_candidate();
	$scope.get_projects();
	$scope.get_banks();
	$scope.check_percent();
}]);
