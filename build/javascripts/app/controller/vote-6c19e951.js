/**
 * Vote Controller
 */

app.votolegal.controller('VoteController', ["$scope", "$http", "$sce", "serialize", "$interval", "SweetAlert", "trouble", "postmon", function($scope, $http, $sce, serialize, $interval, SweetAlert, trouble, postmon){

  /**
   * VOTES
   */
  $scope.set_vote = function(el){
    var list = [];

    var projetos = document.querySelectorAll('.vote--item');
    projetos.forEach(function(i){ if(i.checked) list.push(i) });

    console.log(el);

    if(list.length > 3){
      // TODO: uncheck recent box
      SweetAlert.swal('Selecione apenas 3 assuntos prioritários.');
    }
    return false;
  };

  $scope.generate_project = function(){
    // define render_project function
    var render_projects = function(list){
      var render = '';
      var tmpl = document.getElementById('project-template').innerHTML;
      var compiled = _.template(tmpl);

      list.forEach(function(item, i){
        var rendered = compiled({
          title: "Projeto"+(i +1)+") " + item.title, 
          description: item.scope,
          value: item.id
        });
        render += rendered;
      });

      var project_list = document.getElementById('project--list');
      if(project_list) project_list.innerHTML = render;
    };


    // spy candidate variable
    (function(){
      var pid = $interval(function(){
        if($scope.candidate && $scope.candidate.projects && $scope.candidate.projects.length > 0){
          render_projects($scope.candidate.projects || []);
          $interval.cancel(pid);
        }
      }, 100);
    })();
  };


  $scope.save_vote = function(){
    // TODO: validate
    var list = document.querySelectorAll('.vote--item');
    list = _.filter(list, function(item){ if(item.checked) return item });
    console.log(list);

    // save data
    if(list && list.length === 3){
      var votes = _.map(list, function(item){ return item.value });

      console.log(votes);
      $http({
        method: 'POST',
        url: '/api/',
        data: serialize.from_object(params),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).then(function(response){
        console.log(response);
      }, function(response){
        console.log(response);
      });

      // TODO: send to back-end
      SweetAlert.swal('Obrigado por votar', 'Seu voto foi salvo com sucesso!');
    }
    else {
      // errors
      if(list.length > 3 ) SweetAlert.swal('Selecione apenas 3 projetos prioritários para a votação.');
      if(list.length < 3 ) SweetAlert.swal('Selecione 3 projetos prioritários para a votação.');
      return false;
    }

    return false;
  };

  //$scope.candidate = $scope.$parent.candidate;
  $scope.generate_project();
}]);
