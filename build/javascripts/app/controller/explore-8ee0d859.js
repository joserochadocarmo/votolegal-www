app.votolegal.controller("ExploreController",["$scope","$http","auth_service","serialize","SweetAlert","trouble",function(e,o,t,r,n,i){e.list=[],e.redirect_to=function(e){if(e.website_url.length>0){var o=window.open(e.website_url,"_blank");return o.focus(),!1}return n.swal("Website n\xe3o definido","Este candidato n\xe3o configurou nenhum website para acesso."),!1},e.load_list=function(t){return o({method:"post",url:"/api/search",data:r.from_object({name:t}),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(o){e.list=o.data,console.log(e.list)},function(e){e.data;console.log(e),n.swal("Erro inesperado","N\xe3o foi possivel carregar a lista de usu\xe1rios!"),i({route:"/explore",error:JSON.stringify(e)})}),!1};var l=URI.query("q")||void 0;console.log(l),e.load_list(l)}]);