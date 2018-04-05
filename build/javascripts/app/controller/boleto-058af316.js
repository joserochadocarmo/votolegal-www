/**
 * Boleto controller
 */
 
app.votolegal.controller('BoletoController', ['$scope', '$http', 'postmon', 'auth_service', 'serialize', 'SweetAlert', 'trouble', function($scope, $http, postmon, auth_service, serialize, SweetAlert, trouble){
  $scope.candidate = {};
  $scope.payment   = {};
  $scope.bank_list = [];
  $scope.accept_terms = 0;
  $scope.submit_disabled = false;

  // load zipcode meta informations
  $scope.address_by_zipcode = function(event){
    var zipcode = $scope.candidate.address_zipcode;

    if(zipcode.length == 9){
      postmon(zipcode).then(
        // success callback
        function(response) {
          var res = response.data, $f = $scope.candidate;
          $f.address_city   = res.cidade;
          $f.address_state  = res.estado_info.nome;
          
          // load district
          var district = document.querySelector('form[name=boletoForm] *[name=address_district]');
          if(res.bairro) { $f.address_district = res.bairro; district.disabled = true }
          else {  $f.address_district = ""; district.disabled = false }

          // load street
          var street = document.querySelector('form[name=boletoForm] *[name=address_street]');
          if(res.logradouro) { $f.address_street = res.logradouro; street.disabled = true }
          else { $f.address_street = ""; street.disabled = false }
        },
        // error callback
        function(response){
          swal({ title: "Problemas ao carregar os dados do CEP!", text: "Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente." });
          ['address_state', 'address_city', 'address_district', 'address_street'].map(function(i){ 
            try{ 
              $scope.candidate[i] = "";
              document.querySelector('form[name=boletoForm] *[name='+i+']').disabled = true;
            } catch(e) {};
          });
          throw new Error("ERROR_GET_ZIPCODE");
        }
      );
    }

    return false;
  };


  // getting session
  $scope.get_session = function(){
    var user = auth_service.current_user();
    $http({
      method: 'GET',
      url: '//dapi.votolegal.com.br/api/candidate/'+user.id+'/payment/session?api_key=' + user.api_key,
    }).
    then(function(response){
      $scope.payment.session = response.data.id || 0;
      try{ 
        PagSeguroDirectPayment.setSessionId(response.data.id);
      } catch(e){}
    }, function(response){
      trouble.shoot({
        route: '/cadastro/boleto', error: JSON.stringify(response)
      });
      throw new Error("ERROR_GET_SESSION");
    });
    return false
  };

  // getting session
  $scope.get_banks = function(){
    $http({
      method: 'GET',
      url: '//dapi.votolegal.com.br/api/bank',
    }).
    then(function(response){
      $scope.bank_list = response.data.bank;
    }, function(response){
      trouble.shoot({
        route: '/cadastro/boleto', error: JSON.stringify(response)
      });
      throw new Error("ERROR_GET_BANK");
    });
    return false
  };
  


  $scope.load_candidate = function(){
    var user = auth_service.current_user();
    $http({
      method: 'GET',
      url: '//dapi.votolegal.com.br/api/candidate/'+ user.id +'?api_key=' + user.api_key,
    }).
    then(
      function(response){
        var res = response.data.candidate;

        if(!res.address_district) document.querySelector('form[name=boletoForm] *[name=address_district]').disabled = false;

        (function(){
          var list = res.address_street.split(' - ');
          if(list.length == 2){
            if(list[0]) res.address_street   = list[0];
            else document.querySelector('form[name=boletoForm] *[name=address_street]').disabled = false;
            console.log(document.querySelector('form[name=boletoForm] *[name=address_street]'));

            if(list[1]) res.address_district = list[1];
            else document.querySelector('form[name=boletoForm] *[name=address_district]').disabled = false;
          }
        })();

        $scope.candidate = res;
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


  $scope.generate = function(){
    var sender = PagSeguroDirectPayment.getSenderHash();
    var user = auth_service.current_user();

    if(!$scope.accept_terms || $scope.accept_terms == 0){
      SweetAlert.swal('Error', 'Você deve aceitar o termo de contrato!');
      return false;
    }

    var params = Params
      .require($scope.candidate)
      .permit('phone', 'address_zipcode', 'address_city', 'address_state', 'address_street', 'address_house_number', 'address_district', 'bank_code', 'bank_agency', 'bank_agency_dv', 'bank_account_number', 'bank_agency_dv');

    $http({
      method: 'PUT',
      url: '//dapi.votolegal.com.br/api/candidate/'+ user.id +'?api_key='+ user.api_key,
      data: serialize.from_object(params),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    }).then(function (response) {
      $http({
        method: 'POST',
        url: '//dapi.votolegal.com.br/api/candidate/'+user.id+'/payment?api_key='+user.api_key,
        data: serialize.from_object({ senderHash: sender }),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      }).
      then(
        function(response){
          var url = response.data.url;
          document.location = url;
        }, 
        function(response){ 
          trouble.shoot({
            route: document.location.href, error: JSON.stringify([response, user])
          });
          SweetAlert.swal('Não foi possivel emitir o boleto!', 'Por favor, verifique se você digitou todos os campos acima corretamente.');
          throw new Error('ERROR_GET_BOLETO');
        }
      );
    }, function(response){
      var res = response.data.form_error;

      trouble.shoot({
        route: document.location.href, error: JSON.stringify([response, user])
      });

      var f = function(field){
        return document.querySelector('form[name=boletoForm] *[name='+field+']');
      };

      // setting error message
      for(var field in res){
        var name = f(field).attributes['data-name'].value;
        $scope.error_list.push(name + error_msg(res[field]));
      }

      // enable submit
      $scope.submit_disabled = false;

      // throw an exception
      throw new Error("ERROR_PUT_CADIDATE");
      return false;
    });
    return false;
  };

  
  /**
   * initializations
   */
  auth_service.validate_user({role: 'user'});
  $scope.load_candidate();
  $scope.get_banks();

  $scope.get_session();
}]);
