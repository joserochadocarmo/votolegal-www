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
      url: '//dapi.votolegal.com.br/api/contact', 
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

