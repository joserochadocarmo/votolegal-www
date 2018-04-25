/**
 * Dashboard Controller
 */

app.votolegal.controller('DashboardController', ["$scope", "$http", "auth_service", "serialize", "SweetAlert", function($scope, $http, auth_service, serialize, SweetAlert){
  // defaults
  $scope.list = [];


  // methods
  $scope.approval_list = function(){
    var user = auth_service.current_user();

    $http.get( BASE_API_JS +'/admin/candidate/list?results=9999&api_key=' + user.api_key)
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

    SweetAlert.swal({
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
          url: BASE_API_JS +'/admin/candidate/'+ model.id +'/activate?api_key='+ user.api_key,
        }).
        then(
          // success callback
          function(response){
            SweetAlert.swal({
              title: "Aprovado!",
              text: "O pré-candidato foi aprovado para utilizar o sistema!",
            });
            $scope.approval_list();
          },
          // error callback
          function(response){
            var res = response.data;
            SweetAlert.swal(error_msg(res.error));
          }
        );
      }
    });

    return false;
  };


  $scope.deny = function(model){
    var user = auth_service.current_user();

    SweetAlert.swal({
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
          url: BASE_API_JS +'/admin/candidate/'+ model.id +'/deactivate?api_key='+ user.api_key,
        }).
        then(
          // success callback
          function(response){
            SweetAlert.swal({
              title: "Rejeitado!",
              text: "O pré-candidato foi rejeitado com sucesso!",
            });
            $scope.approval_list();
          },
          // error callback
          function(response){
            var res = response.data;
            SweetAlert.swal(error_msg(res.error));
          }
        );
      }
    });
    return false;
  };

  // validate user
  auth_service.validate_user({role: 'admin'});

  // load parties from api
  $scope.approval_list();
}]);
