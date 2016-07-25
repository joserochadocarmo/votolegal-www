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
