var domain=document.location.href;(!domain.match(/^https:\/\/www.votolegal.org.br/)&&domain.match(/^https:\/\/([a-z0-9_-]*).votolegal.org.br/)||domain.match(/votolegal.org.br\/candidato/))&&(app.votolegal.config(["$routeProvider",function(e){e.when("/",{templateUrl:"/javascripts/app/view/candidato/index.tmpl",controller:"CandidateController"}).when("/doar",{templateUrl:"/javascripts/app/view/candidato/doar.tmpl",controller:"CandidateController"}).when("/doar/success",{templateUrl:"/javascripts/app/view/candidato/success.tmpl",controller:"CandidateController"}).when("/votar/:token",{templateUrl:"/javascripts/app/view/candidato/votar.tmpl",controller:"CandidateController"}).otherwise({redirectTo:"/"})}]),$(document).ready(function(){$("body").on("click","input.opcao_doar_radio",function(e){e.preventDefault,$(this).hasClass("opcao_doar_diff")?$(this).closest(".valor-doa-container").find(".doar-number-diferente").attr("disabled",!1):$(".doar-number-diferente").attr("disabled",!0),$(".valor-doa-container").removeClass("doa-container-active"),$(this).closest(".valor-doa-container").addClass("doa-container-active")}),$("input.opcao_doar_radio:checked").trigger("click")})),app.votolegal.controller("CandidateController",["$scope","$http","$sce","serialize","auth_service","SweetAlert","trouble","postmon",function(e,r,t,a,o,d,n,i){var s=document.querySelector("#loading");e.vote=void 0,e.page="normal",e.candidate={},e.doar={},e.payment={},e.votes=[],e.error_list=[],e.donations=[],e.expenditures=[],e.name=function(){var e=document.location.href;return e=e.split(/\//)[2].split(".")[0],"localhost"!==e?e:void 0}(),e.month_list=function(){list=[];for(var e=1;12>=e;e++)list.push(e);return list}(),e.year_list=function(){list=[];for(var e=2016;2030>=e;e++)list.push(e);return list}(),e.config={paginatorLabels:{first:"Primeira",last:"Ultima",jumpBack:"...",stepBack:"...",stepAhead:"...",jumpAhead:"..."}},e.set_page=function(e){if("votar"===e){var r=document.querySelector(".candidate-header");r&&r.classList.add("hide");var t=document.querySelector("#candidate-container");t&&t.classList.remove("degrade-default")}else{var r=document.querySelector(".candidate-header");r&&r.classList.remove("hide");var t=document.querySelector("#candidate-container");t&&t.classList.add("degrade-default")}return!1},e.make_percent=function(e,r){return 0===r?"0%":(e/100/r*100).toFixed(2)+"%"},e.render_video=function(e){return e?'<iframe id="candidate_video" src="'+t.trustAsResourceUrl(e)+'" width="560" height="315" frameborder="0" allowfullscreen></iframe>':""},e._issues_priorities_decorator=function(r){return e.candidate.candidate_issue_priorities.map(function(e){return e.name}).join(r||", ")},e.candidate_by_name=function(t){return r({method:"GET",url:"/api/candidate/"+t}).then(function(r){var t=r.data.candidate;e.candidate=t,function(){var r=document.querySelector("title");"VotoLegal - Candidato(a)"===r.innerText&&(r.innerText+=" "+e.candidate.popular_name)}(),function(){var r=e.candidate.video_url;if(r&&(r.match("youtube")||r.match("youtu.be"))&&(r.match(/www.youtube.com\/watch/)&&(e.candidate.video_url="https://www.youtube.com/embed/"+URI.init(r).query("v")),r.match("youtu.be"))){var t=r.split("/")[3];e.candidate.video_url="https://www.youtube.com/embed/"+t}}(),e.candidate.issues_decorator=e._issues_priorities_decorator(),e.candidate.total_donated=e.candidate.total_donated||0,e.candidate.party_fund=e.candidate.party_fund||0,e.candidate.raising_goal=parseFloat(e.candidate.raising_goal)||0,function(){var r=document.querySelector("#video-renderer");r&&(r.innerHTML=e.render_video(t.video_url))}(),e.candidate.projects=[],e.candidate_projects(t)},function(e){throw n.shoot({route:document.location.href,error:JSON.stringify(e)}),new Error("Model is invalid or cannot be found!")}),!1},e.billing_by_zipcode=function(){var r=e.doar.billing_address_zipcode;return 9==r.length&&i(r).then(function(r){var t=r.data,a=e.doar;a.billing_address_city=t.cidade,a.billing_address_state=t.estado;var o=document.querySelector("form[name=doarForm] *[name=billing_address_district]");t.bairro?(a.billing_address_district=t.bairro,o.disabled=!0):(a.billing_address_district="",o.disabled=!1);var d=document.querySelector("form[name=doarForm] *[name=billing_address_street]");t.logradouro?(a.billing_address_street=t.logradouro,d.disabled=!0):(a.billing_address_street="",d.disabled=!1)},function(){throw swal({title:"Problemas ao carregar os dados do CEP!",text:"Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente."}),["billing_address_state","billing_address_city","billing_address_district","billing_address_street"].map(function(r){try{e.doar[r]="",document.querySelector("form[name=doarForm] *[name="+r+"]").disabled=!0}catch(t){}}),new Error("ERROR_GET_ZIPCODE")}),!1},e.address_by_zipcode=function(){var r=e.doar.address_zipcode;return 9==r.length&&i(r).then(function(r){var t=r.data,a=e.doar;a.address_city=t.cidade,a.address_state=t.estado;var o=document.querySelector("form[name=doarForm] *[name=address_district]");t.bairro?(a.address_district=t.bairro,o.disabled=!0):(a.address_district="",o.disabled=!1);var d=document.querySelector("form[name=doarForm] *[name=address_street]");t.logradouro?(a.address_street=t.logradouro,d.disabled=!0):(a.address_street="",d.disabled=!1)},function(){throw swal({title:"Problemas ao carregar os dados do CEP!",text:"Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente."}),["address_state","address_city","address_district","address_street"].map(function(r){try{e.doar[r]="",document.querySelector("form[name=doarForm] *[name="+r+"]").disabled=!0}catch(t){}}),new Error("ERROR_GET_ZIPCODE")}),!1},e.candidate_projects=function(t){return r({method:"GET",url:"/api/candidate/"+t.id+"/projects"}).then(function(r){var t=r.data.projects;!function(){var e=0;t.map(function(r){e+=r.votes}),t=t.map(function(r){return r.total=e,r})}(),e.candidate.projects=t},function(e){throw n.shoot({route:document.location.href,error:JSON.stringify(e)}),new Error("Project list is invalid or cannot be found!")}),s.classList.add("hide"),!1},e.candidate_expenditures=function(t){var a=document.querySelector("#expenditures-table"),o=document.querySelector("#loading-expenditures"),i=document.querySelector("#expenditures-error");i&&i.classList.add("hide"),a&&(a.classList.add("hide"),o&&o.classList.remove("hide"));try{r({method:"GET",url:"/api/candidate/"+t.id+"/expenditure?results=99999"}).then(function(r){var t=r.data;!function(){var e=t.expenditure,r=new DocumentFormat;for(var a in e)e[a].cpf_cnpj&&(e[a].cpf_cnpj=r.format(e[a].cpf_cnpj));t.expenditure=e}(),e.expenditures=t,a&&(o&&o.classList.add("hide"),a.classList.remove("hide"))},function(e){throw a&&(o&&o.classList.add("hide"),a.classList.remove("hide")),n.shoot({route:document.location.href,error:JSON.stringify(e)}),d.swal("Falha no carregamento dos dados","N\xe3o foi poss\xedvel carregar os dados de doa\xe7\xf5es."),new Error("Expenditures list is invalid or cannot be found!")})}catch(s){a&&(o&&o.classList.add("hide"),a.classList.remove("hide"))}},e.candidate_donations=function(t){var a=document.querySelector("#donations-table"),o=document.querySelector("#loading-donations"),i=document.querySelector("#donations-error");i&&i.classList.add("hide"),a&&(a.classList.add("hide"),o&&o.classList.remove("hide"));try{r({method:"GET",url:"/api/candidate/"+t.id+"/donate?results=9999"}).then(function(r){var t=r.data.donations;e.donations=t,e.donations.unshift({amount:e.candidate.party_fund||0,name:"Doa\xe7\xe3o do fundo partid\xe1rio",transaction_hash:null,species:"n/a"}),a&&(o&&o.classList.add("hide"),a.classList.remove("hide"))},function(e){throw a&&(o&&o.classList.add("hide"),a.classList.remove("hide")),n.shoot({route:document.location.href,error:JSON.stringify(e)}),d.swal("Falha no carregamento dos dados","N\xe3o foi poss\xedvel carregar os dados de doa\xe7\xf5es."),new Error("Donation list is invalid or cannot be found!")})}catch(s){a&&(o&&o.classList.add("hide"),a.classList.remove("hide"))}},e.doar_continue=function(r){if(!r||10>r)return d.swal("Preencha um valor superior a 10,00 reais."),!1;if(r>1064)return d.swal("Preencha um valor igual ou inferior a 1.064,00 reais."),!1;document.getElementById("amount-review").classList.remove("hide");var t=document.querySelectorAll(".valor-doa-container");for(var a in t)t[a]&&t[a].classList&&t[a].classList.add("hide");document.getElementById("doar-form").classList.remove("hide"),e.doar.amount=parseFloat(r),e.get_session()},e.doar_edit=function(){document.getElementById("amount-review").classList.add("hide");var e=document.querySelectorAll(".valor-doa-container");for(var r in e)e[r]&&e[r].classList&&e[r].classList.remove("hide");document.getElementById("doar-form").classList.add("hide")},e.get_session=function(){var t=e.candidate.id||0;return r({url:"/api/candidate/"+t+"/donate/session"}).then(function(r){e.payment.session=r.data.id,PagSeguroDirectPayment.setSessionId(r.data.id)},function(e){throw n.shoot({route:"/cadastro/boleto",error:JSON.stringify(e)}),new Error("ERROR_GET_SESSION")}),!1},e.get_brand=function(r){r.slice(0,6);return 6==r.length&&e.card_brand({bin:r.slice(0,6),success_cb:function(e){var r=e.brand,t=document.querySelector("#card-image");t&&(t.innerHTML='<img src="//stc.pagseguro.uol.com.br/public/img/payment-methods-flags/42x20/'+r.name+'.png" alt="'+r.name+'" title="'+r.name+'">')},error_cb:function(){var e=document.querySelector("#card-image");e&&(e.classList.add("text-danger"),e.innerText="(bandeira do cart\xe3o n\xe3o encontrada)")}}),!1},e.send_donation=function(){e.error_list=[];var t=document.querySelector("#btn-donate");t&&t.setAttribute("disabled",!0);var o=PagSeguroDirectPayment.getSenderHash();e.doar.sender_hash=o,function(){var r=document.querySelector("#billing_address"),t="address_zipcode address_state address_city address_street address_district address_house_number address_complement".split(/\s/);if(r.classList.contains("hide"))for(var a in t)e.doar["billing_"+t[a]]=e.doar[t[a]]}();var i=function(e){return document.querySelector("form[name=doarForm] label[for="+e+"]")||void 0},s=e.donation_params(),c=e.card_params(),l={credit_card_name:"Nome do cart\xe3o",card_number:"N\xfamero do cart\xe3o",card_month:"M\xeas do cart\xe3o",card_year:"Ano do cart\xe3o",card_cvv:"C\xf3digo do cart\xe3o"};for(var u in c)c[u]||0!=c[u].length||e.error_list.push(l[u]+" \xe9 obrigat\xf3rio");if(e.error_list.length>0){var t=document.querySelector("#btn-donate");return t&&t.removeAttribute("disabled"),!1}e.card_brand({bin:c.card_number.slice(0,6),success_cb:function(t){var o=t.brand?t.brand:void 0;o&&e.card_token({card_number:c.card_number,brand:o.name,cvv:c.card_cvv,month:c.card_month,year:c.card_year,success_cb:function(t){e.error_list=[],s.credit_card_token=t.card.token;var o=s.birthdate;if(o&&o.length>0){var c=o.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);4===c.length&&(s.birthdate=[c[3],c[2],c[1]].join("-"))}else s.birthdate="";return s.amount=parseInt(100*s.amount),r({method:"POST",url:"/api/candidate/"+e.candidate.id+"/donate",data:a.from_object(s),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(){document.location="#/doar/success"},function(r){if(e.error_list=[],r&&r.data&&r.data.form_error){var t=r.data.form_error;for(var a in t){var o=i(a);if(void 0!==o){var s=o.innerText;a.match(/billing/)&&(s+=" (endere\xe7o de cobran\xe7a) "),e.error_list.push(s+error_msg(t[a]))}}return n.shoot({route:document.location.href,error:JSON.stringify(r)}),!1}throw n.shoot({route:document.location.href,error:JSON.stringify(r)}),d.swal("Erro inesperado com a doa\xe7\xe3o"),new Error("DONATION_POST_ERROR")})["finally"](function(){var e=document.querySelector("#btn-donate");e&&e.removeAttribute("disabled")}),!1},error_cb:function(r){throw e.error_list.push("N\xe3o foi possivel carregar os dados do cart\xe3o!"),n.shoot({route:document.location.href,error:JSON.stringify(r)}),new Error("CARDBRAND_GET_ERROR")}})},error_cb:function(r){throw e.error_list.push("Bandeira do cart\xe3o n\xe3o pode ser id\xeantificada!"),n.shoot({route:document.location.href,error:JSON.stringify(r)}),new Error("CARDBRAND_GET_ERROR")}})},e.payment_method=function(e){PagSeguroDirectPayment.getPaymentMethods({amount:parseFloat(e.amount),success:e.success_cb,error:e.error_cb,complete:function(){var e=document.querySelector("#btn-donate");e&&e.removeAttribute("disabled")}})},e.card_brand=function(e){PagSeguroDirectPayment.getBrand({cardBin:e.bin,success:e.success_cb||function(){},error:e.error_cb||function(){},complete:e.complete_cb||function(){var e=document.querySelector("#btn-donate");e&&e.removeAttribute("disabled")}})},e.card_token=function(e){PagSeguroDirectPayment.createCardToken({cardNumber:e.card_number,brand:e.brand,cvv:e.cvv,expirationMonth:e.month,expirationYear:e.year,success:e.success_cb||function(){},error:e.error_cb||function(){},complete:e.complete_cb||function(){var e=document.querySelector("#btn-donate");e&&e.removeAttribute("disabled")}})},e.same_billing_addr=function(){var r=document.querySelector("#billing_address"),t="address_zipcode address_state address_city address_street address_district address_house_number address_complement".split(/\s/);if(r.classList.contains("hide")){for(var a in t)e.doar["billing_"+t[a]]="";r.classList.remove("hide")}else{for(var a in t)e.doar["billing_"+t[a]]=e.doar[t[a]];r.classList.add("hide")}return!1},e.donation_params=function(){return Params.require(e.doar).permit("name","cpf","email","phone","birthdate","address_street","address_house_number","address_district","address_zipcode","address_city","address_state","billing_address_street","billing_address_house_number","billing_address_complement","billing_address_district","billing_address_zipcode","billing_address_city","billing_address_state","credit_card_name","amount","sender_hash","credit_card_token","address_complement","billing_address_complement")},e.card_params=function(){return Params.require(e.payment).permit("card_number","card_month","card_year","card_cvv")},e.candidate_by_name(e.name)}]);