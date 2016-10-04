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
