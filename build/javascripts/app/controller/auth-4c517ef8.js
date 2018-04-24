/**
 * Auth Controller
 */

app.votolegal.controller('AuthController', ["$scope", "$http", "auth_service", "SweetAlert", function($scope, $http, auth_service, SweetAlert){
  // defaults
  $scope.signin = {};
  $scope.error_list = [];

  // populate the token
  $scope.signin.token = URI.query('token');

  // getting form params
  $scope.signin_params = function(){
    return $scope.signin;
  };

  $scope.forgot_password = function(isValid){
    $scope.error_list = [];
    var params = $scope.signin_params();

    auth_service.forgot_password(params.email)
    .then(
      // success callback
      function(response){
        var res = response.data;
        document.location = '/conta/recuperar-senha/success'
      },
      // error callback
      function(response){
        var res = response.data;

        if(res.hasOwnProperty('form_error')){
          var res = res.form_error;

          var f = function(field){
            return document.querySelector('form[name=forgotForm] *[name='+field+']');
          };

          // setting error message
          for(var field in res){
            var name = f(field).attributes['placeholder'].value;
            $scope.error_list.push(name + error_msg(res[field]));
          }
        }
        else {
          $scope.error_list.push(error_msg(res.error));
        }

        throw new Error('ERROR_FORGOT_PASSWORD');
      }
    );
    return false;
  };

  $scope.change_password = function(isValid){
    $scope.error_list = [];
    var params = $scope.signin_params();

    // fields validation
    if(params.password == null)
      $scope.error_list.push('Nova Senha é um campo obrigatório.');

    if(params.password !== params.confirm_password)
      $scope.error_list.push('Os campos de senha devem ser iguais.');

    if($scope.error_list.length > 0) return false;

    // request for change
    auth_service.change_password(params.password, params.token)
    .then(
      // success callback
      function(response){
        var res = response.data;
        document.location = '/conta/trocar-senha/success'
      },
      // error callback
      function(response){
        var res = response.data;

        if(res.hasOwnProperty('form_error')){
          var res = res.form_error;

          var f = function(field){
            return document.querySelector('form[name=changePasswordForm] *[name='+field+']');
          };

          // setting error message
          for(var field in res){
            var name = f(field).attributes['placeholder'].value;
            $scope.error_list.push(name + error_msg(res[field]));
          }
        }
        else {
          $scope.error_list.push(error_msg(res.error));
        }

        throw new Error('ERROR_CHANGE_PASSWORD');
      }
    );
    return false;
  };

  // authenticate an user
  $scope.authenticate = function(isValid){
    var params = $scope.signin_params();

    auth_service.authenticate(params.email, params.password)
    .then(function(response){

	console.log(response, 'rsspone')
      var res = response.data;

      // getting role list
      var role_list = res.roles || [];

      res.candidate_name = res.candidate_name || ''; // fallback
      var name = res.candidate_name.split(/\s+/).shift();

      // save session
      var session = auth_service.session();
      session.set(
        auth_service.session_key, { id: res.candidate_id, api_key: res.api_key, name: name, role: role_list[0] || null }
      );

	  // check roles

      if(role_list.length == 0) {
        document.location = '/admin/signin';
        return false;
	  }


      for(var i in role_list){
        if(role_list[i] === 'admin') document.location = '/admin';
        if(role_list[i] === 'user'){


			if (rs.payment_status !== 'paid' && res.signed_contract == 0) {
				document.location = '/contrato'
			} else if (res.payment_status == 'paid' && res.signed_contract == 0) {
				document.location = '/pagamento'
			}else{
				document.location = '/cadastro-completo';
			}

		}
	  }

    }, function(response){
      SweetAlert.swal('Erro na autênticação', 'Usuário ou Senha incorretos!');
      throw new Error('ERROR_AUTH_USER');
    });
    return false;
  };

}]);
