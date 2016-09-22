app.votolegal.controller("ExploreController",["$scope","$http","auth_service","serialize","SweetAlert","trouble",function(e,t,r,a,i,o){e.list=[],e.party_list=[],e.term="",e.party={id:0,acronym:"Partido"},e.typesearch="Nome",e.redirect_to=function(e){if(e.website_url.length>0){var t=window.open(e.website_url,"_blank");return t.focus(),!1}return i.swal("Website n\xe3o definido","Este candidato n\xe3o configurou nenhum website para acesso."),!1},e.set_typesearch=function(t){e.typesearch=t},e.set_party=function(t){e.party=t},e.load_parties=function(){t.get("//45.55.50.43/api/party").then(function(t){e.party_list=t.data.party;for(var r in e.party_list)e.party_list[r].id==e.party.id&&(e.party=e.party_list[r])},function(){throw e.party_list=[],new Error("ERROR_GET_PARTY_LIST")})},e.load_list=function(r){var s={name:r};switch(e.typesearch){case"Nome":s.name=r;break;case"Cidade":s.address_city=r}s.party_id=n;var d=document.querySelector("#loading-candidates"),c=document.querySelector(".candidate-list");return t({method:"post",url:"//45.55.50.43/api/search?results=9999",data:a.from_object(s),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(t){e.list=t.data,d&&d.classList.add("hide"),c&&c.classList.remove("hide")},function(e){e.data;i.swal("Erro inesperado","N\xe3o foi possivel carregar a lista de usu\xe1rios!"),o({route:document.location.href,error:JSON.stringify(e)}),d&&d.classList.add("hide"),c&&c.classList.remove("hide")}),!1};var s=URI.query("q")||void 0;e.term=s;var n=URI.query("party")||0;e.party.id=n,e.typesearch=URI.query("type")||"Nome",e.load_parties(),e.load_list(s)}]);