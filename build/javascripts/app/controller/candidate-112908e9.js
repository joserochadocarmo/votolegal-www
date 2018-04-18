var currentURL = document.location;

if(!(/^https:\/\/participe.votolegal.com.br/.test(currentURL.origin)) && /\?.?&?id=[a-z0-9_-]+/.test(currentURL.search) && /\/candidato/.test(currentURL.pathname)) {

  app.votolegal.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: '/javascripts/app/view/candidato/index.tmpl',
      controller: 'CandidateController',
    }).
    when('/doar', {
      templateUrl: '/javascripts/app/view/candidato/doar.tmpl',
      controller: 'CandidateController',
    }).
    when('/doar/success', {
      templateUrl: '/javascripts/app/view/candidato/success.tmpl',
      controller: 'CandidateController',
    }).
    when('/votar/:token', {
      templateUrl: '/javascripts/app/view/candidato/votar.tmpl',
      controller: 'CandidateController',
    }).
    otherwise({
      redirectTo: '/',
    });
  }]);


  /**
   * Grafic interface and style interactions
   */
  $(document).ready(function(){
    $('body').on('click', 'input.opcao_doar_radio', function(e){
      e.preventDefault;
      if ($(this).hasClass('opcao_doar_diff')) {
        $(this).closest('.valor-doa-container').find('.doar-number-diferente').attr('disabled', false);
      } else {
        $('.doar-number-diferente').attr('disabled', true);
      }
      $('.valor-doa-container').removeClass('doa-container-active');
      $(this).closest('.valor-doa-container').addClass('doa-container-active');
    });
    $('input.opcao_doar_radio:checked').trigger('click');
  });
}

/**
 * Candidate Controller
 */
app.votolegal.controller('CandidateController', ["$scope", "$http", "$sce", "$route", "$location", "$routeParams","serialize", "auth_service", "SweetAlert", "trouble", "postmon", function($scope, $http, $sce, $route, $routeParams, $location, serialize, auth_service, SweetAlert, trouble, postmon){
  var load   = document.querySelector('#loading');
console.log($routeParams,'route',$location)


  // defaults
  $scope.vote           = undefined;
  $scope.page           = 'normal';
  $scope.candidate      = {};
  $scope.doar           = {};
  $scope.payment        = {};
  $scope.votes          = [];
  $scope.error_list     = [];
  $scope.donations      = [];
  $scope.expenditures   = [];

  // getting candidate name from url
  $scope.name = (function get_subdomain(){
	var url = document.location.href;
	var queryObject = {};
	url = url.split("?")[1].split("&");

	queryObject = url.map(function (u,i) {
		var query = u.split('=');
		var queries  = query.map(function (q, i) {

			return q;
		})
		return queries;
	})

	url = {id:queryObject[0][1]}

    if(url !== 'localhost') return url.id;
  })();
  $scope.month_list = (function(){
    list = [];
    for(var i=1; i<=12; i++) { list.push(i); }
    return list;
  })();
  $scope.year_list = (function(){
    list = [];
    for (var i = 2016; i<=2030; i++) { list.push(i); }
    return list;
  })();
  $scope.config = {
    paginatorLabels: {
      first: "Primeira", last: "Ultima",jumpBack:'...', stepBack:'...', stepAhead:'...', jumpAhead:'...'
    }
  };

  $scope.set_page = function(page){
    if(page === 'votar'){
      var header = document.querySelector('.candidate-header');
      if(header) header.classList.add('hide');
      var container = document.querySelector('#candidate-container');
      if(container) container.classList.remove('degrade-default');
    }
    else {
      var header = document.querySelector('.candidate-header');
      if(header) header.classList.remove('hide');
      var container = document.querySelector('#candidate-container');
      if(container) container.classList.add('degrade-default');
    }
    return false;
  };

  $scope.hide_label = function(){
    var list = document.querySelectorAll('.progress-candidate > .progress-bar > p');
    if(list) for(var i in list){ if(list[i] && typeof(list[i]) === 'object') list[i].style.display = 'none' }
  };

  $scope.show_label = function(bar, $event){
    $scope.hide_label();

    var element = $event.target.querySelector('p');
    if(element) element.style.display = 'block';

    return false;
  };

  // methods
  $scope.make_percent = function(number, total){
    if(total === 0) return '0%';
    return (((number/100)/total) * 100).toFixed(2) + '%'
  };

  $scope.render_video = function(src){
    if(src) return '<iframe id="candidate_video" src="' + $sce.trustAsResourceUrl(src) + '" width="560" height="315" frameborder="0" allowfullscreen></iframe>';
    else return '';
  };

  $scope._issues_priorities_decorator = function(separator){
    return $scope.candidate.candidate_issue_priorities
      .map(function(i){ return i.name })
      .join(separator || ', ')
  };

  $scope.candidate_by_name = function(name){
    $http({
      method: 'GET',
      url: BASE_API_JS + '/candidate/'+ name,
    }).
    then(
      function(response){
		var res = response.data.candidate;

		console.log(response.data.candidate, 'ffffff')

        $scope.candidate = res;

        (function(){
          var title = document.querySelector('title');
          if(title.innerText === 'VotoLegal - Candidato(a)')
            title.innerText += (" " + $scope.candidate.popular_name);
        })();

        (function(){
          var video = $scope.candidate.video_url;
          if(video && (video.match('youtube') || video.match('youtu.be')) ){
            if(video.match(/www.youtube.com\/watch/)){
              $scope.candidate.video_url = 'https://www.youtube.com/embed/' + URI.init(video).query('v');
            }
            if(video.match('youtu.be')){
              var code = video.split('/')[3];
              $scope.candidate.video_url = 'https://www.youtube.com/embed/' + code;
            }
          }
        })();

        // header issues list
        $scope.candidate.issues_decorator = $scope._issues_priorities_decorator();

        // default total donated
        $scope.candidate.total_donated = $scope.candidate.total_donated || 0;
        $scope.candidate.party_fund = $scope.candidate.party_fund || 0;
        $scope.candidate.raising_goal = parseFloat($scope.candidate.raising_goal) || 0.0;

        // video renderer
        (function(){
          var v = document.querySelector('#video-renderer');
          if(v) v.innerHTML = $scope.render_video(res.video_url);
        })();

        // load projects
        $scope.candidate.projects = [];
        $scope.candidate_projects(res);
      },
      function(response){
        trouble.shoot({
          route: document.location.href, error: JSON.stringify(response)
        });
        throw new Error('Model is invalid or cannot be found!');
      }
    );
    return false;
  };

  /* fetch zip_code info */
  $scope.billing_by_zipcode = function(event){
    var zipcode = $scope.doar.billing_address_zipcode;

    if(zipcode.length == 9){
      postmon(zipcode).then(
        // success callback
        function(response) {
          var res = response.data, $f = $scope.doar;
          $f.billing_address_city   = res.cidade;
          $f.billing_address_state  = res.estado;

          // load district
          var district = document.querySelector('form[name=doarForm] *[name=billing_address_district]');
          if(res.bairro) { $f.billing_address_district = res.bairro; district.disabled = true }
          else {  $f.billing_address_district = ""; district.disabled = false }

          // load street
          var street = document.querySelector('form[name=doarForm] *[name=billing_address_street]');
          if(res.logradouro) { $f.billing_address_street = res.logradouro; street.disabled = true }
          else { $f.billing_address_street = ""; street.disabled = false }
        },
        // error callback
        function(response){
          swal({ title: "Problemas ao carregar os dados do CEP!", text: "Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente." });
          ['billing_address_state', 'billing_address_city', 'billing_address_district', 'billing_address_street'].map(function(i){
            try{
              $scope.doar[i] = "";
              document.querySelector('form[name=doarForm] *[name='+i+']').disabled = true;
            } catch(e) {};
          });
          throw new Error("ERROR_GET_ZIPCODE");
        }
      );
    }

    return false;
  };
  $scope.address_by_zipcode = function(event){
    var zipcode = $scope.doar.address_zipcode;

    if(zipcode.length == 9){
      postmon(zipcode).then(
        // success callback
        function(response) {
          var res = response.data, $f = $scope.doar;
          $f.address_city   = res.cidade;
          $f.address_state  = res.estado;

          // load district
          var district = document.querySelector('form[name=doarForm] *[name=address_district]');
          if(res.bairro) { $f.address_district = res.bairro; district.disabled = true }
          else {  $f.address_district = ""; district.disabled = false }

          // load street
          var street = document.querySelector('form[name=doarForm] *[name=address_street]');
          if(res.logradouro) { $f.address_street = res.logradouro; street.disabled = true }
          else { $f.address_street = ""; street.disabled = false }
        },
        // error callback
        function(response){
          swal({ title: "Problemas ao carregar os dados do CEP!", text: "Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente." });
          ['address_state', 'address_city', 'address_district', 'address_street'].map(function(i){
            try{
              $scope.doar[i] = "";
              document.querySelector('form[name=doarForm] *[name='+i+']').disabled = true;
            } catch(e) {};
          });
          throw new Error("ERROR_GET_ZIPCODE");
        }
      );
    }

    return false;
  };


  /* fetch candidate projects */
  $scope.candidate_projects = function(candidate){
    $http({
      method: 'GET',
      url: BASE_API_JS + '/candidate/'+ candidate.id +'/projects',
    }).
    then(
      function(response){
        var res = response.data.projects;

        (function(){
          var total = 0; res.map(function(p){ total += p.votes });
          res = res.map(function(i){ i.total = total; return i });
        })();

        $scope.candidate.projects = res;
      },
      function(response){
        trouble.shoot({
          route: document.location.href, error: JSON.stringify(response)
        });
        throw new Error('Project list is invalid or cannot be found!');
      }
    );

    load.classList.add('hide');
    return false;
  };


  /* fetch candidate expenditures */
  $scope.candidate_expenditures = function(candidate){
    var table   = document.querySelector('#expenditures-table');
    var loading = document.querySelector('#loading-expenditures');
    var error   = document.querySelector('#expenditures-error');
    if(error) error.classList.add('hide');
    if(table) {
      table.classList.add('hide');
      if(loading) loading.classList.remove('hide');
    }

    try {
      $http({method: 'GET', url: BASE_API_JS + '/candidate/'+ candidate.id +'/expenditure?results=99999'}).
      then(
        function(response){
          var res = response.data;

          (function(){
            var list = res.expenditure, doc_format = new DocumentFormat();

            for(var i in list)
              if(list[i].cpf_cnpj) list[i].cpf_cnpj = doc_format.format(list[i].cpf_cnpj);

            res.expenditure = list;
          })();

          $scope.expenditures = res;

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
          throw new Error('Expenditures list is invalid or cannot be found!');
        }
      );
    }
    catch(e){
      if(table) {
        if(loading) loading.classList.add('hide');
        table.classList.remove('hide');
      }
    }
  };


  /* fetch candidate projects */
  $scope.candidate_donations = function(candidate){
    var table   = document.querySelector('#donations-table');
    var loading = document.querySelector('#loading-donations');
    var error   = document.querySelector('#donations-error');
    if(error) error.classList.add('hide');
    if(table) {
      table.classList.add('hide');
      if(loading) loading.classList.remove('hide');
    }

    try {
      $http({method: 'GET', url: BASE_API_JS + '/candidate/'+ candidate.id +'/donate?results=9999'}).
      then(
        function(response){
          var res = response.data.donations;
          $scope.donations = res;

          $scope.donations.unshift({
            amount          : $scope.candidate.party_fund || 0,
            name            : 'Doação do fundo partidário',
            transaction_hash: null,
            species         : 'n/a'
          });

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
    }
    catch(e){
      if(table) {
        if(loading) loading.classList.add('hide');
        table.classList.remove('hide');
      }
    }
  };



  /* setting donation amount */
  $scope.doar_continue = function(amount){
    if(!amount || amount < 10.00){
      SweetAlert.swal('Preencha um valor superior a 10,00 reais.');
      return false;
    }
    if(amount > 1064.00){
      SweetAlert.swal('Preencha um valor igual ou inferior a 1.064,00 reais.');
      return false;
    }

    document.getElementById('amount-review').classList.remove('hide');
    var list = document.querySelectorAll('.valor-doa-container');
    for(var i in list) {
      if(list[i] && list[i].classList) list[i].classList.add('hide');
    }
    document.getElementById('doar-form').classList.remove('hide');

    // update amount value
    $scope.doar.amount = parseFloat(amount);

    $scope.get_session();
  };


  /* doar edit method*/
  $scope.doar_edit = function(amount){
    document.getElementById('amount-review').classList.add('hide');
    var list = document.querySelectorAll('.valor-doa-container');
    for(var i in list) {
      if(list[i] && list[i].classList) list[i].classList.remove('hide');
    }
    document.getElementById('doar-form').classList.add('hide');
  };


  /* getting session */
  $scope.get_session = function(){
    var id = $scope.candidate.id || 0;
    $http({
      url: '//dapi.votolegal.com.br/api/candidate/'+id+'/donate/session'
    }).
    then(function(response){
      $scope.payment.session = response.data.id;
      PagSeguroDirectPayment.setSessionId(response.data.id);
    }, function(response){
      trouble.shoot({
        route: '/cadastro/boleto', error: JSON.stringify(response)
      });
      throw new Error("ERROR_GET_SESSION");
    });
    return false
  };

  $scope.get_brand = function(card_number){

    // getting card brand
    if(card_number.length >= 6){

      // cielo card check
      if($scope.candidate.payment_gateway_id === 1) {
        var card = new CreditCard();
        var c = card.card_brand(card_number) || undefined;

        var image = document.querySelector('#card-image');
        if(c){
          $scope.doar.credit_card_brand = c.alias;
          if(image) image.innerHTML = '<img src="/images/candidatos/card-brands/'+c.alias+'.png" alt="'+c.name+'">';
        }
      }

      // pagseguro card check
      if($scope.candidate.payment_gateway_id === 2) {
        $scope.card_brand({
          // 6 first digits
          bin: card_number.slice(0, 6),

          // success callback
          success_cb: function(response){
            var brand = response.brand;
            var image = document.querySelector('#card-image');
            if(image){
              image.innerHTML = '<img src="//stc.pagseguro.uol.com.br/public/img/payment-methods-flags/42x20/'+brand.name+'.png" alt="'+brand.name+'" title="'+brand.name+'">';
            }
          },

          // success callback
          error_cb: function(response){
            var image = document.querySelector('#card-image');
            if(image){
              image.classList.add('text-danger');
              image.innerText = '(bandeira do cartão não encontrada)';
            }
          }
        });
      }
    }
    return false;
  };

  /* sender donartion */
  $scope.send_donation = function(){
    $scope.error_list = [];

    // block button
    var button = document.querySelector('#btn-donate');
    if(button) button.setAttribute('disabled', true);

    // sender
    var sender = PagSeguroDirectPayment.getSenderHash();
    $scope.doar.sender_hash = sender;


    // billing address is same as address
    (function(){
      var billing_address = document.querySelector('#billing_address');
      var list = 'address_zipcode address_state address_city address_street address_district address_house_number address_complement'.split(/\s/);
      if(billing_address.classList.contains('hide')){
        for(var i in list) $scope.doar["billing_" + list[i]] = $scope.doar[list[i]];
      }
    })();

    var f = function(field){
      return document.querySelector('form[name=doarForm] label[for='+field+']') || undefined;
    };

    // getting params
    var params = $scope.donation_params();

    // getting card
    var card = $scope.card_params();
    var card_names = { credit_card_name: "Nome do cartão", card_number: "Número do cartão", card_month: "Mês do cartão", card_year: "Ano do cartão", card_cvv: "Código do cartão" };
    for(var field in card) {
      if(!card[field] && card[field].length == 0) $scope.error_list.push(card_names[field] + ' é obrigatório');
    }

    if($scope.error_list.length > 0) {
      var button = document.querySelector('#btn-donate');
      if(button) button.removeAttribute('disabled');
      return false;
    }


    // CIELO Payment
    if($scope.candidate.payment_gateway_id === 1){
      // adding brand
      params.amount = parseInt((params.amount * 100));
      params.credit_card_brand = $scope.doar.credit_card_brand;
      params.credit_card_validity = (function(){
        var validity = $scope.payment.card_year;
        var m = $scope.payment.card_month;
        validity += (m.length == 1? "0" + m : m);
        return ""+validity
      })();
      params.credit_card_cvv = $scope.payment.card_cvv;
      (function(){
        var date = params.birthdate;
        if(date && date.length > 0){
          var groups = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if(groups.length === 4) params.birthdate = [groups[3], groups[2], groups[1]].join('-');
        }
      })();
      params.credit_card_number =   $scope.payment.card_number;

      // brand not found
      if(!params.credit_card_brand || params.credit_card_brand == null || params.credit_card_brand === ''){
        SweetAlert.swal('Não foi possível idêntificar a bandeira do seu cartão de crédito');
        trouble.shoot({ route: document.location.href, error: JSON.stringify({error: 'brand not found', data: params}) });
        return false;
      }

      $http({
        method: 'POST',
        url : '//dapi.votolegal.com.br/api/candidate/'+ $scope.candidate.id +'/donate',
        data: serialize.from_object(params),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function(response){
        document.location = '#/doar/success';
      }, function(response){
        $scope.error_list = [];

        // clear up payment data
        $scope.payment = {};

        if(response && response.data && response.data.form_error){
          var res = response.data.form_error;

          if(res && res.donation){
            if(res.donation === 'not authorized') SweetAlert.swal('Transação não autorizada');
            var button = document.querySelector('#btn-donate');
            if(button) button.removeAttribute('disabled');
            return false;
          }

          // setting error message
          for(var field in res){
            var name = f(field);
            if(name !== undefined){
              var text = name.innerText;
              if(field.match(/billing/)) text += " (endereço de cobrança) ";
              $scope.error_list.push(text + error_msg(res[field]));
            }
          }

          // sending troubleshoot
          trouble.shoot({
            route: document.location.href, error: JSON.stringify(response)
          });

          return false;
        }

        // sending troubleshoot
        trouble.shoot({
          route: document.location.href, error: JSON.stringify(response)
        });

        var button = document.querySelector('#btn-donate');
        if(button) button.removeAttribute('disabled');

        SweetAlert.swal('Erro inesperado com a doação');
        throw new Error('DONATION_POST_ERROR');
      }).finally(function(){
        var button = document.querySelector('#btn-donate');
        if(button) button.removeAttribute('disabled');
      });

      return false;
    }

    // PAGSEGURO Payment
    $scope.card_brand({
      // 6 first digits
      bin: card.card_number.slice(0, 6),

      // success callback
      success_cb: function(response){
        var brand = (response.brand)? response.brand: undefined;

        if(brand){
          $scope.card_token({
            // credit card data
            card_number: card.card_number,
            brand:       brand.name,
            cvv:         card.card_cvv,
            month:       card.card_month,
            year:        card.card_year,

            // success callback
            success_cb: function(response){
              $scope.error_list = [];

              params.credit_card_token = response.card.token;

              // format date
              var date = params.birthdate;
              if(date && date.length > 0){
                var groups = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if(groups.length === 4) params.birthdate = [groups[3], groups[2], groups[1]].join('-');
              }
              else {
                params.birthdate = '';
              }

              // format amount
              params.amount = parseInt((params.amount * 100));


              // send to backend
              $http({
                method: 'POST',
                url : '//dapi.votolegal.com.br/api/candidate/'+ $scope.candidate.id +'/donate',
                data: serialize.from_object(params),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              }).
              then(function(response){
                document.location = '#/doar/success';
              }, function(response){
                $scope.error_list = [];

                if(response && response.data && response.data.form_error){
                  var res = response.data.form_error;


                  // setting error message
                  for(var field in res){
                    var name = f(field);
                    if(name !== undefined){
                      var text = name.innerText;
                      if(field.match(/billing/)) text += " (endereço de cobrança) ";
                      $scope.error_list.push(text + error_msg(res[field]));
                    }
                  }

                  // sending troubleshoot
                  trouble.shoot({
                    route: document.location.href, error: JSON.stringify(response)
                  });

                  return false;
                }

                // sending troubleshoot
                trouble.shoot({
                  route: document.location.href, error: JSON.stringify(response)
                });

                SweetAlert.swal('Erro inesperado com a doação');
                throw new Error('DONATION_POST_ERROR');
              }).
              finally(function(){
                var button = document.querySelector('#btn-donate');
                if(button) button.removeAttribute('disabled');
              });

              return false;
            },

            // error callback
            error_cb: function(response){
              $scope.error_list.push('Não foi possivel carregar os dados do cartão!');
              trouble.shoot({ route: document.location.href, error: JSON.stringify(response) });
              //SweetAlert.swal('Cartão inválido', 'Não foi possível obter as informações do cartão!');
              throw new Error('CARDBRAND_GET_ERROR');
            },
          });
        }
      },

      // error callback
      error_cb: function(response){
        $scope.error_list.push('Bandeira do cartão não pode ser idêntificada!');
        //SweetAlert.swal('Cartão inválido', 'Não foi possível obter as informações do cartão!');
        trouble.shoot({ route: document.location.href, error: JSON.stringify(response) });
        throw new Error('CARDBRAND_GET_ERROR');
      }
    });

  };

  /* payment methods */
  $scope.payment_method = function(opts){
    PagSeguroDirectPayment.getPaymentMethods({
      amount:   parseFloat(opts.amount),
      success:  opts.success_cb,
      error:    opts.error_cb,
      complete: function(){
        var button = document.querySelector('#btn-donate');
        if(button) button.removeAttribute('disabled');
      }
    });
  };

  // card brand
  $scope.card_brand = function(opts){
    PagSeguroDirectPayment.getBrand({
      cardBin:  opts.bin,
      success:  opts.success_cb  || function(){},
      error:    opts.error_cb    || function(){},
      complete: opts.complete_cb || function(){
        var button = document.querySelector('#btn-donate');
        if(button) button.removeAttribute('disabled');
      }
    });
  };

  // card token
  $scope.card_token = function(opts){
    PagSeguroDirectPayment.createCardToken({
      cardNumber:       opts.card_number,
      brand:            opts.brand,
      cvv:              opts.cvv,
      expirationMonth:  opts.month,
      expirationYear:   opts.year,
      success:          opts.success_cb   || function(){},
      error:            opts.error_cb     || function(){},
      complete:         opts.complete_cb  || function(){
        var button = document.querySelector('#btn-donate');
        if(button) button.removeAttribute('disabled');
      }
    });
  };

  $scope.same_billing_addr = function(){
    var billing_address = document.querySelector('#billing_address');

    // field list
    var list = 'address_zipcode address_state address_city address_street address_district address_house_number address_complement'.split(/\s/);

    if(billing_address.classList.contains('hide')){
      for(var i in list) $scope.doar["billing_" + list[i]] = "";
      billing_address.classList.remove('hide');
    }
    else {
      for(var i in list) $scope.doar["billing_" + list[i]] = $scope.doar[list[i]];
      billing_address.classList.add('hide');
    }
    return false;
  };


  $scope.donation_params = function(){
    //$scope.doar.credit_card_name = $scope.doar.name;

    return Params
      .require($scope.doar)
      .permit('name', 'cpf', 'email', 'phone', 'birthdate', 'address_street', 'address_house_number', 'address_district', 'address_zipcode', 'address_city', 'address_state', 'billing_address_street', 'billing_address_house_number', 'billing_address_complement', 'billing_address_district', 'billing_address_zipcode', 'billing_address_city', 'billing_address_state', 'credit_card_name', 'amount', 'sender_hash', 'credit_card_token', 'address_complement', 'billing_address_complement')
  };

  $scope.card_params = function(){
    return Params
      .require($scope.payment)
      .permit('card_number', 'card_month', 'card_year', 'card_cvv')
  };


  $scope.candidate_by_name($scope.name);
}]);
