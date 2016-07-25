//= require 'angular.min-022f3ec8.js'
//= require 'angular-sanitize-6b8d3cf9.js'
//= require 'angular-ng_mask-eb54aea8.js'

(function(app){

  /**
   * Array polyfills
   */
  if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {
      var T, A, k;
      if (this == null) throw new TypeError(' this is null or not defined');
      var O = Object(this);
      var len = O.length >>> 0;
      if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
      if (arguments.length > 1) T = thisArg;
      A = new Array(len);
      k = 0;
      while (k < len) {
        var kValue, mappedValue;
        if (k in O) {
          kValue = O[k];
          mappedValue = callback.call(T, kValue, k, O);
          A[k] = mappedValue;
        }
        k++;
      }
      return A;
    };
  }
  if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun) {
      'use strict';

      if (this === void 0 || this === null) throw new TypeError();

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== 'function') throw new TypeError();

      var res = [];
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      for (var i = 0; i < len; i++) {
        if (i in t) {
          var val = t[i];
          if (fun.call(thisArg, val, i, t)) res.push(val);
        }
      }
      return res;
    };
  }

  var URI = {
    absolute: function(){
      return document.location.href;
    },
    query: function(name) {
      var url = this.absolute();
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    } 
  };


  var Params = {
    _value: undefined,
    require: function(value){
      if(value == null || value == undefined) 
        throw new Error('value cannot be undefined');
      
      this._value = value;

      return this;
    },
    permit: function(){
      var _self = this;

      var param_list = {};
      angular.forEach(arguments, function(i){
        if(_self._value.hasOwnProperty(i) && _self._value[i] != null) 
          return param_list[i] = _self._value[i];
      });

      return param_list;
    }
  };
  

  /**
   * Serializer
   */
  var Serializer = function(){
    this.from_object = function(data){
      var buffer = [];
      
      if (typeof data !== 'object')
        throw new Error('Param to be serializer isnt a object');
      
      for (var name in data) {
        if (!data.hasOwnProperty(name)) {
          continue;
        }
        var value = data[name];
        buffer.push(
          encodeURIComponent(name) + "=" +
          encodeURIComponent( ( value == null ) ? "" : value )
        );
      }

      return buffer.join( "&" ).replace(/%20/g, "+");
    };

    this.from_form = function(element_id){
      var f = document.forms[element_id];
      
      var buffer = {};
      for(var i in f.elements){
        if(f.elements[i].type !== undefined)
          buffer[f.elements[i].name] = f.elements[i].value;
      }
      return this.from_object(buffer);
    };

    this.to_json = function(data){
      return JSON.stringify(data);
    };
  };


  // error messages translation
  var error_msg  = function(token){
    var msg_list = {
      "missing"               : " não foi preenchido.",
      "invalid"               : " está inválido.",
      "already exists"        : " já foi cadastrado.",
      "access denied"         : "Acesso negado!",
      "Bad email or password.": "E-mail ou senha inválidos.",
      "invalid token"         : " é invalido ou esta expirado."
    };
    return msg_list[token];
  };

  /**
   * VotoLegal Project App
   */
  app.votolegal = angular.module('votolegal', ['ngRoute', 'ngMask', 'ngSanitize', 'angular-storage', 'idf.br-filters', 'oitozero.ngSweetAlert']);
  app.votolegal.config(['$httpProvider', '$locationProvider', function($httpProvider, $locationProvider) {
    // http configurations
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Content-Type"] = 'application/x-www-form-urlencoded';

    // location configurations
    $locationProvider.html5Mode(false);
  }]);

  /**
   * Show String as HTML
   */
  app.votolegal.filter('unsafe', ['$sce', function($sce){
    return function(val){ return $sce.trustAsHtml(val) };
  }]);

  /**
   * Postmon Service
   * Connect to the Postmon service API to get zipcode informations
   */ 
  app.votolegal.factory('postmon', ['$http', function($http){
    return function(zipcode) {
      return $http.get('//api.postmon.com.br/v1/cep/' + zipcode, {cache: false});
    }
  }]);

  /**
   * Serializer Service
   */ 
  app.votolegal.factory('serialize', function(){ return new Serializer() });


  /**
   * Authentication Service
   */ 
  app.votolegal.factory('auth_service', ['$http', 'serialize', 'store', function($http, serialize, store){ 
    return {
      // attributes
      session_key: 'user',
      sign_page  : '/',
      admin_page : '/admin',
      role_list  : {
        admin: '/admin', user: '/pre-cadastro/aprovado'
      },

      // methods
      authenticate: function(username, password) {
        return $http({
          method: 'POST',
          url: '/api/login',
          data: serialize.from_object({"email": username, "password": password}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
      },
      
      // forgot password
      forgot_password: function(username){
        return $http({
          method: 'POST',
          url: '/api/login/forgot_password',
          data: serialize.from_object({"email": username}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
      },

      // change my password
      change_password: function(password, token){
        return $http({
          method: 'POST',
          url: '/api/login/forgot_password/reset/' + token,
          data: serialize.from_object({"new_password": password}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
      },

      // store wrapper
      session: function(){
        return store;
      },

      // load user data
      current_user: function(){
        return this.session().get(this.session_key);
      },

      // validate user
      // usage: validate_user({role: 'admin'})
      validate_user: function(){
        var args = arguments[0] || {};

        var user = this.current_user();

        // validate session
        if(user == undefined) 
          document.location = this.sign_page;
        // validade role
        if(user.role != args.role)
          document.location = '/error/permissao-negada';

        return false;
      },

      signature_exists: function(){
        if(this.current_user) return true;
        return false;
      },

      // logout
      logout: function(){
        this.session().remove(this.session_key);
        if (arguments[0]) document.location = arguments[0];
        return false;
      }
    }
  }]);


  app.votolegal.controller('MenuController', ['$scope', '$http', 'serialize', 'auth_service', function($scope, $http, serialize, auth_service){ 
    $scope.current_user = auth_service.current_user() || {};

    $scope.is_admin = function(){
      var user = auth_service.current_user();
      if(user && user.role == 'user') return true;
      return false;
    };

    $scope.logout = function(){
      auth_service.logout('/');
      return false;
    };
  }]);

  /**
   * load votolegal controllers
   */
  /**
 * PreCadastro controller
 * Register a new candidate to be moderated by admin team
 */ 
app.votolegal.controller('PreCadastroController', ['$scope', '$http', 'postmon', 'serialize', function($scope, $http, postmon, serialize){
  $scope.candidate = {};
  $scope.submit_disabled = false;

  // getting form params
  $scope.register_params = function(){
    return $scope.candidate;
  };

  // create a new cadidate
  $scope.create = function(isValid){
    var params = $scope.register_params();
    $scope.error_list = [];

    // password confirmation error
    if(!$scope.candidate.password || ($scope.candidate.password != $scope.candidate.confirm_password)){
      $scope.error_list.push("Os campos de senha devem ser iguais.");
      return false;
    }
    if (!$scope.accept_terms && !$scope.transparent_campaign){
      if(!$scope.accept_terms) $scope.error_list.push("Você deve aceitar os termos de uso.");
      if(!$scope.transparent_campaign) $scope.error_list.push("Você deve aceitar fazer uma campanha transparente.");
      return false;
    }

    $scope.submit_disabled = true;
    $http({
      method: 'POST', 
      url: '/api/register', 
      data: serialize.from_object(params),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(
      // success callback
      function(response){
        if($scope.error_list.length == 0)
          document.location = '/pre-cadastro/success';

        return false;
      },
      // error callback
      function(response){
        var res = response.data.form_error;

        var f = function(field){
          return document.querySelector('form[name=candidateForm] *[name='+field+']');
        };

        // setting error message
        for(var field in res){
          var name = f(field).attributes['placeholder'].value;
          $scope.error_list.push(name + error_msg(res[field]));
        }

        // password confirmation error
        if($scope.candidate.password && ($scope.candidate.password != $scope.candidate.confirm_password)){
          $scope.error_list.push("Os campos de senha devem ser iguais.");
        }
        if (!$scope.accept_terms && !$scope.transparent_campaign){
          if(!$scope.accept_terms) $scope.error_list.push("Você deve aceitar os termos de uso.");
          if(!$scope.transparent_campaign) $scope.error_list.push("Você deve aceitar fazer uma campanha transparente.");
        }

        // enable submit
        $scope.submit_disabled = false;

        // throw an exception
        throw new Error("ERROR_POST_NEW_CADIDATE");
        return false;
      }
    );

    return false;
  };

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
          
          var street = document.querySelector('form[name=candidateForm] *[name=address_street]');
          if(res.bairro && res.logradouro) {
            $f.address_street = res.logradouro + " - " + res.bairro; 
            street.disabled = true
          }
          else {
            $f.address_street = ""; 
            street.disabled = false;
          }
        },
        // error callback
        function(response){
          swal({ title: "Problemas ao carregar os dados do CEP!", text: "Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente." });
          throw new Error("ERROR_GET_ZIPCODE");
        }
      );
    }

    return false;
  };

  // load party data
  $scope.load_parties = function(){
    $http.get('/api/party')
    .then(
      function(response){ $scope.party_list = response.data.party; },
      function(response){ $scope.party_list = []; throw new Error("ERROR_GET_PARTY_LIST"); }
    );
  };

  // load office data
  $scope.load_offices = function(){
    $http.get('/api/office')
    .then(
      function(response){ $scope.office_list = response.data.office; },
      function(response){ $scope.office_list = []; throw new Error("ERROR_GET_OFFICE_LIST"); }
    );
  };
  
  // reset form fields
  $scope.reset = function(){
    $scope.candidate = {};
  };


  // load parties from api
  $scope.load_offices();
  $scope.load_parties();
}]);

  /**
 * Contato controller
 * Register a new contact message
 */ 
app.votolegal.controller('ContatoController', ['$scope', '$http', 'serialize', function($scope, $http, serialize){
  $scope.message = {};

  // getting form params
  $scope.message_params = function(){
    return $scope.message;
  };

  // create a new cadidate
  $scope.create = function(isValid){
    var params = $scope.message_params();

    $http({
      method: 'POST', 
      url: '/api/contact', 
      data: serialize.from_object(params),
      headers : {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then(
      // success callback
      function(response){
        var res = response.data;
        document.location = '/contato/success';
        return false;
      },
      // error callback
      function(response){
        var res = response.data.form_error;

        var f = function(field){
          return document.querySelector('form[name=contactForm] *[name='+field+']');
        };

        // setting error message
        $scope.error_list = [];
        for(var field in res){
          var name = f(field).attributes['placeholder'].value;
          $scope.error_list.push(name + error_msg(res[field]));
        }

        // throw an exception
        throw new Error("ERROR_POST_NEW_CONTACT");
        return false;
      }
    );

    return false;
  };
}]);


  /**
 * Faq Controller
 * Controller of faq page
 */
app.votolegal.controller('FaqController', ['$scope', '$sce', function($scope, $sce){
  // defaults
  $scope.highlight = true;

  // getting list
  $scope.faq_list = faq_list;
  
  $scope.search_answer = function(q){
    // check if faq-item contains string 
    var list = faq_list.map(function(i){
      if(i.title.match(new RegExp(q, "ig")) || i.content.match(new RegExp(q, "gi")) ){
        return i;
      } 
    });
    
    // define array/list filter 
    var clean_list = function(list){
      var l = [];
      for(var i in list)
        if(list[i] !== undefined) l.push(list[i]);
      return l;
    };

    // update list
    $scope.faq_list = clean_list(list);
    return false;
  };
}]);

  /**
 * Auth Controller
 */
app.votolegal.controller('AuthController', ["$scope", "$http", "auth_service", function($scope, $http, auth_service){
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
    .then(
      // success callback
      function(response){
        var res = response.data;

        // getting role list
        var role_list = res.roles || [];

        // TODO: Apenas para teste
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
          if(role_list[i] === 'user') document.location = '/pre-cadastro/aprovado';
        }
      },
      // error callback
      function(response){
        $scope.error_list = [];
        var res = response.data;

        if(res.form_error){
          var res = res.form_error;

          var f = function(field){
            return document.querySelector('form[name=signinForm] *[name='+field+']');
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

        throw new Error('ERROR_AUTH_USER');
      }
    );
    return false;
  };

}]);

  /**
 * Dashboard Controller
 */
app.votolegal.controller('DashboardController', ["$scope", "$http", "auth_service", "serialize", function($scope, $http, auth_service, serialize){
  // defaults
  $scope.list = [];


  // methods
  $scope.approval_list = function(){
    var user = auth_service.current_user();

    $http.get('/api/admin/candidate/list?api_key=' + user.api_key)
    .then(
      function(response){
        var res = response.data;
        $scope.list = res;
      },
      function(response){
        var data = response.data;

        // error: access denied
        if(data.error === "access denied") 
          document.location = auth_service.sign_page;
      }
    );
    return false;
  };

  $scope.allow = function(model){
    var user = auth_service.current_user();

    swal({
      title: "Tem certeza?",
      text: "Você tem certeza que deseja autorizar este pré-candidato?",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
      closeOnConfirm: false,
      closeOnCancel: true
    },
    function(isConfirm){
      if (isConfirm) {
        $http({
          method: 'PUT',
          url: '/api/admin/candidate/'+ model.id +'/activate?api_key='+ user.api_key,
        }).
        then(
          // success callback
          function(response){
            swal({
              title: "Aprovado!",
              text: "O pré-candidato foi aprovado para utilizar o sistema!",
            });
            $scope.approval_list();
          },
          // error callback
          function(response){
            var res = response.data;
            swal(error_msg(res.error));
          }
        );
      }
    });

    return false;
  };


  $scope.deny = function(model){
    var user = auth_service.current_user();

    swal({
      title: "Tem certeza?",
      text: "Você tem certeza que deseja rejeitar este pré-candidato?",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
      closeOnConfirm: false,
      closeOnCancel: true
    },
    function(isConfirm){
      if (isConfirm) {
        $http({
          method: 'PUT',
          url: '/api/admin/candidate/'+ model.id +'/deactivate?api_key='+ user.api_key,
        }).
        then(
          // success callback
          function(response){
            swal({
              title: "Rejeitado!",
              text: "O pré-candidato foi rejeitado com sucesso!",
            });
            $scope.approval_list();
          },
          // error callback
          function(response){
            var res = response.data;
            swal(error_msg(res.error));
          }
        );
      }
    });
    return false;
  };

  // load parties from api
  $scope.approval_list();

  // validate user
  auth_service.validate_user({role: 'admin'});
}]);

  /**
 * PreCandidate Controller
 */
app.votolegal.controller('PreCandidateController', ["$scope", "$http", "serialize", "auth_service", function($scope, $http, $location, serialize, auth_service){
  // defaults
  var user = auth_service.current_user();
  $scope.model  = {};
  $scope.params = URI.query();


  $scope.load = function(id){
    try{ id = parseInt(id); }
    catch(e){ throw new Error('Parametro id é inválido'); }

    $http({
      method: 'GET',
      url: '/api/candidate/'+ id +'?api_key=' + user.api_key,
    }).
    then(
      function(response){
        var res = response.data.candidate;
        $scope.model = res;
      },
      function(response){
        throw new Error('Model is invalid or cannot be found!');
      }
    );
    return false;
  };

  $scope.load($scope.params.id);

  // validate user
  auth_service.validate_user({role: 'admin'});
}]);

  /**
 * Default Controller
 */
app.votolegal.controller('DefaultController', ["$scope", "$http", "auth_service", "serialize", function($scope, $http, auth_service, serialize){
  // validate user
  auth_service.validate_user({role: 'user'});
}]);

  if(document.location.href.indexOf('/cadastro-completo') >= 0){
  app.votolegal.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/dados-pessoais', {
      templateUrl: '/javascripts/app/view/cadastro/dados-pessoais.tmpl',
      controller: 'CadastroController'
    }).
    when('/dados-campanha', {
      templateUrl: '/javascripts/app/view/cadastro/dados-campanha.tmpl',
      controller: 'CadastroController'
    }).
    when('/projetos', {
      templateUrl: '/javascripts/app/view/cadastro/projetos.tmpl',
      controller: 'CadastroController'
    }).
    otherwise({
      redirectTo: '/dados-pessoais'
    });
  }]);
}

/**
 * Cadastro controller
 * Register a new candidate
 */ 
app.votolegal.controller('CadastroController', ['$scope', '$http', '$location', 'auth_service', 'serialize', 'SweetAlert', function($scope, $http, $location, auth_service, serialize, SweetAlert){
  $scope.issues     = {};
  $scope.candidate  = {};
  $scope.projects   = [{ id: 0, title: '', scope: '', changed: true}];

  $scope.tabname    = 'pessoal';
  $scope.submit_disabled = false;
  $scope.progress   = { percent: 0 };
  $scope.issue_list = []; 


  $scope.$watch("progress", function(newValue, oldValue) {
    $scope.progress.percent = $scope.progress.percent;
  });

  $scope.check_percent = function(){
    var p = 0;
    if($scope.projects.length >= 4) p += 30;
    $scope.progress.percent = p;
  };

  // mark project as changed
  $scope.changed_project = function(index){
    $scope.projects[index].changed = true;
  };

  // save campaign data
  $scope.save_candidate = function(index){
    var params = $scope.candidate_params();

    var user = auth_service.current_user();
    params.api_key = user.api_key;

    $http({
      method: 'PUT',
      url: '/api/candidate/'+ user.id,
      data: params,
      headers: {'Content-Type': undefined },
      transformRequest: function (data) {
        var fd = new FormData();
        for (var p in data) fd.append(p, data[p]);
        // add file to form_data
        var file_field = document.querySelector('input[name=picture]');
        if(file_field.files.length > 0){
          var file = file_field.files[0];
          fd.append("picture", file, file.name);
        }
        return fd;
      }
    }).then(function (response) {
      SweetAlert.swal('Os dados da campanha foram salvos!');
    },function(response){
      SweetAlert.swal('Error', 'Os dados da campanha não puderam ser salvos!');
      throw new Error('ERROR_SAVING_CAMPAIGN');
    });
    return false;
  };

  // save campaign data
  $scope.save_campaign = function(index){
    var params = $scope.campaign_params();

    var user = auth_service.current_user();
    params.api_key = user.api_key;

    // TODO: fix amount mask

    $http({
      method: 'PUT',
      url: '/api/candidate/'+ user.id,
      data: params,
      headers: {'Content-Type': undefined },
      transformRequest: function (data) {
        var fd = new FormData();
        for (var p in data) fd.append(p, data[p]);
        // add file to form_data
        var file_field = document.querySelector('input[name=spending_spreadsheet]');
        if(file_field.files.length > 0){
          var file = file_field.files[0];
          fd.append("spending_spreadsheet", file, file.name);
        }
        return fd;
      }
    }).then(function (response) {
      SweetAlert.swal('Os dados da campanha foram salvos!');
    },function(response){
      SweetAlert.swal('Error', 'Os dados da campanha não puderam ser salvos!');
      throw new Error('ERROR_SAVING_CAMPAIGN');
    });
    return false;
  };

  // save project data
  $scope.save_project = function(index){
    var p = $scope.projects[index];

    if(p.title == '' || p.scope == ''){
      SweetAlert.swal('Os campos de Titulo e Descrição são obrigatórios');
      return false;
    }


    // build params
    var params = {title: p.title, scope: p.scope};
    if (p.hasOwnProperty('id') && p.id > 0) params.id = p.id;

    // getting user data
    var user = auth_service.current_user();
    params.api_key = user.api_key;
    
    $http({
      method: (p.id && p.id > 0)? 'PUT' : 'POST',
      url: '/api/candidate/'+ user.id +'/projects' + (p.id && p.id > 0 ? '/' + p.id : ''),
      data: serialize.from_object(params),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    }).then(function (response) {
      $scope.projects[index].changed = false;
      SweetAlert.swal('O projeto foi salvo!');
    },function(response){
      SweetAlert.swal('Error', 'O projeto não pode ser salvo!');
      throw new Error('ERROR_SAVING_PROJECT');
    });

    return false;
  };


  $scope.create_issue = function(isValid){
    var issue = $scope.issue_name; 
    var modal = $('#new-issue-priority').modal('hide');

    if(issue){
      var list = $scope.issue_list.filter(function(i){
        if(i.selected) return true;
      });

      if(list.length >= 4) {
        SweetAlert.swal('Selecione apena 4 assuntos');
      }
      else {
        //$http.post('/api/candidate');
        $scope.issue_list.push({selected: true, id: 11, name: issue});
      }
    }

    $scope.issue_name = '';
    return false;
  };


  // update candidate
  $scope.update = function(isValid){
    var params = $scope.candidate_params();
    $scope.error_list = [];

    // getting current user candidate
    var user = auth_service.current_user();
    params['api_key'] = user.api_key;

    $scope.submit_disabled = true;
    $http.put('/api/candidate/' + user.id, serialize.from_object(params), {
      //headers: { 'Content-Type': false },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      //transformRequest: function (data) {
      //  var fd = new FormData();

      //  for (var p in data)
      //    fd.append(p, data[p]);

      //  // TODO: add image upload

      //  return fd;
      //}
      //headers: {'Content-Type': undefined},
      //data: serialize.from_object(params)
      //headers: {'Content-Type': 'enctype="multipart/form-data'}
      //headers: {'Content-Type': 'multipart/form-data'}
      //transformRequest: angular.identity
    });
    return false;
  };

  $scope.new_project = function(){
    $scope.projects.push({id: 0, title: '', scope: '', changed: true});
    return false;
  };


  /**
   * remove data
   */
  $scope.remove_project = function(index){
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
    function(isConfirm){
      if (isConfirm) {
        if(item.hasOwnProperty('id') && item.id > 0){
          var user = auth_service.current_user();
          $http.delete(
            '/api/candidate/' + user.id + '/projects/' + item.id + '?api_key='+ user.api_key 
          ).then(function(response){ 
            $scope.projects.splice(index, 1);
            swal('O projeto foi removido com sucesso!');
            $scope.check_percent();
          }, function(response){ throw new Error('ERROR_DELETE_PROJECTS') });
        }
        else {
          $scope.projects.splice(index, 1);
        }
      }
    });

    return false;
  };


  /**
   * validate data
   */
  $scope.count_checked = function(el){
    var list = $scope.issue_list.filter(function(i){
      if(i.selected) return true;
    });

    if(list.length > 4){
      if(el) el.i.selected = false;
      swal('Selecione apena 4 assuntos');
    }
    return false;
  };


  /**
   * form params
   */
  $scope.candidate_params = function(){
    return Params
      .require($scope.candidate)
      .permit('picture', 'video_url', 'facebook_url', 'twitter_url', 'instagram_url', 'website_url', 'public_email', 'responsible_name', 'responsible_email');
  };

  $scope.campaign_params = function(){
    var selected_list = $scope.issue_list.filter(function(i){
      if(i.selected) return true;
    });

    var list = [];
    for(var i in selected_list) list.push(selected_list[i].id);

    var p = {
      raising_goal: $scope.candidate.raising_goal,
      issue_priorities: list.join(','),
      cielo_merchant_key: $scope.candidate.cielo_merchant_key
    };

    return Params
      .require(p)
      .permit('raising_goal', 'issue_priorities', 'cielo_merchant_key');
  };

  $scope.projects_params = function(){
    var list = [];
    var project_list = document.querySelectorAll('.project-item');
    for(var i=0; i < project_list.length; i++) {
      var n = project_list[i];
      var id      = n.getAttribute("data-id").replace('item-', ''),
          title   = n.querySelector('input[name=project_title]').value,
          content = n.querySelector('textarea[name=project_content]').value;

      list.push({id, title, content});
    }
    return list;
  };


  /**
   * getting data
   */
  $scope.get_candidate = function(){
    var params = {};

    var user = auth_service.current_user();
    params['api_key'] = user.api_key;

    $http.get('/api/candidate/' + user.id, serialize.from_object(params))
    .then(
      function(response){ $scope.candidate = response.data.candidate },
      function(response){ throw new Error('ERROR_GET_CANDIDATE') }
    );
    return false;
  };

  $scope.get_projects = function(){
    var user = auth_service.current_user();

    $http.get(
      '/api/candidate/' + user.id + '/projects', { api_key: user.api_key }
    ).then( function(response){ 
      var list = response.data.projects.map(function(i){ i.changed = false; return i });
      $scope.projects = list;
      $scope.check_percent();
    }, function(response){ throw new Error('ERROR_GET_PROJECTS') });
  };

  $scope.get_issues_priority = function(){
    $http.get('/api/issue_priority').
    then(
      function(response){ 
        $scope.issue_list = response.data.issue_priority; 

        for (var i in $scope.issue_list){
          if($scope.candidate.hasOwnProperty('candidate_issue_priorities')){
            $scope.candidate.candidate_issue_priorities.map(function(item){
              if($scope.issue_list[i].id == item.id) $scope.issue_list[i].selected = true;
            });
          }
        } 
        $scope.check_percent();
      },
      function(response){ throw new Error('ERROR_GET_ISSUE_PRIORITY') }
    );
  };

  // getting route
  $scope._get_tabname = function(){
    var route = $location.path();
    if(route == '/dados-pessoais') return 'pessoal';
    if(route == '/dados-campanha') return 'campanha';
    if(route == '/projetos') return 'projetos';
  };

  
  /**
   * initializations
   */
  auth_service.validate_user({role: 'user'});
  $scope.tabname = $scope._get_tabname();
  $scope.get_candidate();
  $scope.get_issues_priority();
  $scope.get_projects();

  // check registered fields
  $scope.check_percent();
}]);


})(window.app = window.app || {});
