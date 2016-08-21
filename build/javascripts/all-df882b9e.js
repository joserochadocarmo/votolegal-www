!function(e){Array.prototype.map||(Array.prototype.map=function(e,r){var t,a,o;if(null==this)throw new TypeError(" this is null or not defined");var n=Object(this),i=n.length>>>0;if("function"!=typeof e)throw new TypeError(e+" is not a function");for(arguments.length>1&&(t=r),a=new Array(i),o=0;i>o;){var s,d;o in n&&(s=n[o],d=e.call(t,s,o,n),a[o]=d),o++}return a}),Array.prototype.filter||(Array.prototype.filter=function(e){"use strict";if(void 0===this||null===this)throw new TypeError;var r=Object(this),t=r.length>>>0;if("function"!=typeof e)throw new TypeError;for(var a=[],o=arguments.length>=2?arguments[1]:void 0,n=0;t>n;n++)if(n in r){var i=r[n];e.call(o,i,n,r)&&a.push(i)}return a}),NodeList.prototype.forEach=Array.prototype.forEach;var r=function(){return{_location:void 0,init:function(e){return this._location=e,this},absolute:function(){return this._location||document.location.href},query:function(e){var r=this.absolute();e=e.replace(/[\[\]]/g,"\\$&");var t=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)"),a=t.exec(r);return a?a[2]?decodeURIComponent(a[2].replace(/\+/g," ")):"":null}}}(),t=function(){return{_value:void 0,require:function(e){if(null==e||void 0==e)throw new Error("value cannot be undefined");return this._value=e,this},permit:function(){var e=this,r={};for(var t in arguments)r[arguments[t]]=e._value[arguments[t]]||"";return r},normalize:function(){return name.split(/\s+/).map(function(e){return e=e.toLowerCase(),e.length>=3?e.charAt(0).toUpperCase()+e.slice(1):e.length<3?e:void 0})}}}(),a=function(){this.from_object=function(e){var r=[];if("object"!=typeof e)throw new Error("Param to be serializer isnt a object");for(var t in e)if(e.hasOwnProperty(t)){var a=e[t];r.push(encodeURIComponent(t)+"="+encodeURIComponent(null==a?"":a))}return r.join("&").replace(/%20/g,"+")},this.from_form=function(e){var r=document.forms[e],t={};for(var a in r.elements)void 0!==r.elements[a].type&&(t[r.elements[a].name]=r.elements[a].value);return this.from_object(t)},this.to_json=function(e){return JSON.stringify(e)}},o=function(e){var r={missing:" n\xe3o foi preenchido.",invalid:" est\xe1 inv\xe1lido.","already exists":" j\xe1 foi cadastrado.","access denied":"Acesso negado!","Bad email or password.":"E-mail ou senha inv\xe1lidos.","invalid token":" \xe9 invalido ou esta expirado."};return r[e]};if(e.votolegal=angular.module("votolegal",["ngRoute","ngMask","ngSanitize","angular-storage","idf.br-filters","oitozero.ngSweetAlert","ui.utils.masks","ui.bootstrap"]),e.votolegal.config(["$httpProvider","$locationProvider",function(e,r){delete e.defaults.headers.common["X-Requested-With"],e.defaults.headers.common["Content-Type"]="application/x-www-form-urlencoded",r.html5Mode(!1)}]),e.votolegal.factory("serialize",function(){return new a}),e.votolegal.filter("unsafe",["$sce",function(e){return function(r){return e.trustAsHtml(r)}}]),e.votolegal.factory("postmon",["$http",function(e){return function(r){return e.get("//api.postmon.com.br/v1/cep/"+r,{cache:!1})}}]),e.votolegal.factory("serialize",function(){return new a}),e.votolegal.factory("trouble",["$http","serialize",function(e,r){return{shoot:function(t){t.hasOwnProperty("route")||console.log("route param for troubleshoot is required"),t.hasOwnProperty("error")||console.log("error param for troubleshoot is required"),t.route&&t.error&&e({method:"POST",url:"/api/troubleshoot",data:r.from_object(t),headers:{"Content-Type":"application/x-www-form-urlencoded"}})}}}]),e.votolegal.factory("auth_service",["$http","serialize","store",function(e,r,t){return{session_key:"user",sign_page:"/",admin_page:"/admin",role_list:{admin:"/admin",user:"/cadastro-completo"},authenticate:function(t,a){return e({method:"POST",url:"/api/login",data:r.from_object({email:t,password:a}),headers:{"Content-Type":"application/x-www-form-urlencoded"}})},forgot_password:function(t){return e({method:"POST",url:"/api/login/forgot_password",data:r.from_object({email:t}),headers:{"Content-Type":"application/x-www-form-urlencoded"}})},change_password:function(t,a){return e({method:"POST",url:"/api/login/forgot_password/reset/"+a,data:r.from_object({new_password:t}),headers:{"Content-Type":"application/x-www-form-urlencoded"}})},session:function(){return t},current_user:function(){return this.session().get(this.session_key)},validate_user:function(){var e=arguments[0]||{},r=this.current_user()||void 0;return void 0==r&&(document.location=this.sign_page),r.role!=e.role&&(document.location="/error/permissao-negada"),!1},signature_exists:function(){return!!this.current_user},logout:function(){return this.session().remove(this.session_key),arguments[0]&&(document.location=arguments[0]),!1}}}]),e.votolegal.controller("MenuController",["$scope","$http","serialize","auth_service",function(e,r,t,a){e.current_user=a.current_user()||{},e.is_admin=function(){var e=a.current_user();return!(!e||"user"!=e.role)},e.logout=function(){return a.logout("/"),!1}}]),e.votolegal.controller("PreCadastroController",["$scope","$http","postmon","serialize",function(e,r,t,a){e.candidate={},e.submit_disabled=!1,e.register_params=function(){return e.candidate},e.create=function(){var t=e.register_params();return e.error_list=[],e.accept_terms||e.transparent_campaign?e.candidate.password&&e.candidate.password==e.candidate.confirm_password?(e.submit_disabled=!0,r({method:"POST",url:"/api/register",data:a.from_object(t),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(){return 0==e.error_list.length&&(document.location="/pre-cadastro/success"),!1},function(r){var t=r.data.form_error,a=function(e){return document.querySelector("form[name=candidateForm] *[name="+e+"]")};for(var n in t){if("cpf"==n&&"already exists"==t[n])return e.error_list.push("CPF j\xe1 cadastrado! Para completar o seu cadastro, por favor fa\xe7a o login."),!1;var i=a(n).attributes.placeholder.value;e.error_list.push(i+o(t[n]))}throw e.candidate.password&&e.candidate.password!=e.candidate.confirm_password&&e.error_list.push("Os campos de senha devem ser iguais."),e.accept_terms||e.transparent_campaign||(e.accept_terms||e.error_list.push("Voc\xea deve aceitar os termos de uso."),e.transparent_campaign||e.error_list.push("Voc\xea deve aceitar fazer uma campanha transparente.")),e.submit_disabled=!1,new Error("ERROR_POST_NEW_CADIDATE")}),!1):(e.error_list.push("Os campos de senha devem ser iguais."),!1):(e.accept_terms||e.error_list.push("Voc\xea deve aceitar os termos de uso."),e.transparent_campaign||e.error_list.push("Voc\xea deve aceitar fazer uma campanha transparente."),!1)},e.address_by_zipcode=function(){var r=e.candidate.address_zipcode;return 9==r.length&&t(r).then(function(r){var t=r.data,a=e.candidate;a.address_city=t.cidade,a.address_state=t.estado_info.nome;var o=document.querySelector("form[name=candidateForm] *[name=address_street]");t.bairro&&t.logradouro?(a.address_street=t.logradouro+" - "+t.bairro,o.disabled=!0):(a.address_street="",o.disabled=!1)},function(){throw swal({title:"Problemas ao carregar os dados do CEP!",text:"Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente."}),new Error("ERROR_GET_ZIPCODE")}),!1},e.load_parties=function(){r.get("/api/party").then(function(r){e.party_list=r.data.party},function(){throw e.party_list=[],new Error("ERROR_GET_PARTY_LIST")})},e.load_offices=function(){r.get("/api/office").then(function(r){e.office_list=r.data.office},function(){throw e.office_list=[],new Error("ERROR_GET_OFFICE_LIST")})},e.reset=function(){e.candidate={}},e.load_offices(),e.load_parties()}]),e.votolegal.controller("ContatoController",["$scope","$http","serialize",function(e,r,t){e.message={},e.message_params=function(){return e.message},e.create=function(){var a=e.message_params();return r({method:"POST",url:"/api/contact",data:t.from_object(a),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(e){e.data;return document.location="/contato/success",!1},function(r){var t=r.data.form_error,a=function(e){return document.querySelector("form[name=contactForm] *[name="+e+"]")};e.error_list=[];for(var n in t){var i=a(n).attributes.placeholder.value;e.error_list.push(i+o(t[n]))}throw new Error("ERROR_POST_NEW_CONTACT")}),!1}}]),e.votolegal.controller("FaqController",["$scope","$sce",function(e){e.highlight=!0,e.faq_list=faq_list,e.search_answer=function(r){var t=faq_list.map(function(e){return e.title.match(new RegExp(r,"ig"))||e.content.match(new RegExp(r,"gi"))?e:void 0}),a=function(e){var r=[];for(var t in e)void 0!==e[t]&&r.push(e[t]);return r};return e.faq_list=a(t),!1}}]),e.votolegal.controller("AuthController",["$scope","$http","auth_service","SweetAlert",function(e,t,a,n){e.signin={},e.error_list=[],e.signin.token=r.query("token"),e.signin_params=function(){return e.signin},e.forgot_password=function(){e.error_list=[];var r=e.signin_params();return a.forgot_password(r.email).then(function(e){e.data;document.location="/conta/recuperar-senha/success"},function(r){var t=r.data;if(t.hasOwnProperty("form_error")){var t=t.form_error,a=function(e){return document.querySelector("form[name=forgotForm] *[name="+e+"]")};for(var n in t){var i=a(n).attributes.placeholder.value;e.error_list.push(i+o(t[n]))}}else e.error_list.push(o(t.error));throw new Error("ERROR_FORGOT_PASSWORD")}),!1},e.change_password=function(){e.error_list=[];var r=e.signin_params();return null==r.password&&e.error_list.push("Nova Senha \xe9 um campo obrigat\xf3rio."),r.password!==r.confirm_password&&e.error_list.push("Os campos de senha devem ser iguais."),e.error_list.length>0?!1:(a.change_password(r.password,r.token).then(function(e){e.data;document.location="/conta/trocar-senha/success"},function(r){var t=r.data;if(t.hasOwnProperty("form_error")){var t=t.form_error,a=function(e){return document.querySelector("form[name=changePasswordForm] *[name="+e+"]")};for(var n in t){var i=a(n).attributes.placeholder.value;e.error_list.push(i+o(t[n]))}}else e.error_list.push(o(t.error));throw new Error("ERROR_CHANGE_PASSWORD")}),!1)},e.authenticate=function(){var r=e.signin_params();return a.authenticate(r.email,r.password).then(function(e){var r=e.data,t=r.roles||[];r.candidate_name=r.candidate_name||"";var o=r.candidate_name.split(/\s+/).shift(),n=a.session();if(n.set(a.session_key,{id:r.candidate_id,api_key:r.api_key,name:o,role:t[0]||null}),0==t.length)return document.location="/admin/signin",!1;for(var i in t)"admin"===t[i]&&(document.location="/admin"),"user"===t[i]&&(document.location="/cadastro-completo")},function(){throw n.swal("Erro na aut\xeantica\xe7\xe3o","Usu\xe1rio ou Senha incorretos!"),new Error("ERROR_AUTH_USER")}),!1}}]),e.votolegal.controller("DashboardController",["$scope","$http","auth_service","serialize","SweetAlert",function(e,r,t,a,n){e.list=[],e.approval_list=function(){var a=t.current_user();return r.get("/api/admin/candidate/list?api_key="+a.api_key).then(function(r){var t=r.data;e.list=t},function(e){var r=e.data;"access denied"===r.error&&(document.location=t.sign_page)}),!1},e.allow=function(a){var i=t.current_user();return n.swal({title:"Tem certeza?",text:"Voc\xea tem certeza que deseja autorizar este pr\xe9-candidato?",showCancelButton:!0,confirmButtonText:"Sim",cancelButtonText:"N\xe3o",closeOnConfirm:!1,closeOnCancel:!0},function(t){t&&r({method:"PUT",url:"/api/admin/candidate/"+a.id+"/activate?api_key="+i.api_key}).then(function(){n.swal({title:"Aprovado!",text:"O pr\xe9-candidato foi aprovado para utilizar o sistema!"}),e.approval_list()},function(e){var r=e.data;n.swal(o(r.error))})}),!1},e.deny=function(a){var i=t.current_user();return n.swal({title:"Tem certeza?",text:"Voc\xea tem certeza que deseja rejeitar este pr\xe9-candidato?",showCancelButton:!0,confirmButtonText:"Sim",cancelButtonText:"N\xe3o",closeOnConfirm:!1,closeOnCancel:!0},function(t){t&&r({method:"PUT",url:"/api/admin/candidate/"+a.id+"/deactivate?api_key="+i.api_key}).then(function(){n.swal({title:"Rejeitado!",text:"O pr\xe9-candidato foi rejeitado com sucesso!"}),e.approval_list()},function(e){var r=e.data;n.swal(o(r.error))})}),!1},t.validate_user({role:"admin"}),e.approval_list()}]),e.votolegal.controller("PreCandidateController",["$scope","$http","serialize","auth_service",function(e,t,a,o,n){var i=n.current_user();e.model={},e.params=r.query(),e.load=function(r){try{r=parseInt(r)}catch(a){throw new Error("Parametro id \xe9 inv\xe1lido")}return t({method:"GET",url:"/api/candidate/"+r+"?api_key="+i.api_key}).then(function(r){var t=r.data.candidate;e.model=t},function(){throw new Error("Model is invalid or cannot be found!")}),!1},e.load(e.params.id),n.validate_user({role:"admin"})}]),e.votolegal.controller("DefaultController",["$scope","$http","auth_service","serialize",function(e,r,t){t.validate_user({role:"user"})}]),document.location.href.indexOf("/cadastro-completo")>=0){e.votolegal.config(["$routeProvider",function(e){e.when("/dados-pessoais",{templateUrl:"/javascripts/app/view/cadastro/dados-pessoais.tmpl",controller:"CadastroController",activetab:"pessoal"}).when("/dados-campanha",{templateUrl:"/javascripts/app/view/cadastro/dados-campanha.tmpl",controller:"CadastroController",activetab:"campanha"}).when("/projetos",{templateUrl:"/javascripts/app/view/cadastro/projetos.tmpl",controller:"CadastroController",activetab:"projetos"}).otherwise({redirectTo:"/dados-pessoais",activetab:"pessoal"})}]);window.setInterval(function(){if("undefined"!=typeof Storage){var e=localStorage.progress,r=document.querySelector("div[role=progressbar]");r.innerHTML=e+"%",r.style.width=e+"%"}},500)}e.votolegal.controller("CadastroController",["$scope","$http","$location","$route","$interval","auth_service","serialize","SweetAlert","trouble",function(e,r,a,n,i,s,d,c,l){e.candidate={},e.issue_list=[],e.projects=[{id:0,title:"",scope:"",changed:!0}],e.error_list=[],e.submit_disabled=!1,e.progress=0,e.date_to_profile=function(){var e=0;return e=new Date("08/15/2016 00:00:00")-new Date,Math.round(e/864e5)+1}(),e.change_filename=function(e){var r=document.querySelector("input[name="+e+"]"),t=r.value.split(/\/|\\/g).reverse()[0];if(document.querySelector("."+e+"_filename").value=t,"picture"===e&&r.files.length>0){var a=r.files[0];if(Math.round(100*a.size/1048576)/100>1)throw c.swal("Sua imagem de perfil \xe9 muito grande","A imagem deve ter no m\xe1ximo 1MB de tamanho!"),new Error("IMAGE_MAXSIZE_ERROR")}},e.check_percent=function(){var r=0;if(e.candidate){var t=e.candidate;t.picture&&t.picture.length>0&&(r+=4),t.cnpj&&t.cnpj.length>0&&(r+=4),t.video_url&&t.video_url.length>0&&(r+=4),t.facebook_url&&t.facebook_url.length>0&&(r+=4),t.twitter_url&&t.twitter_url.length>0&&(r+=4),t.instagram_url&&t.instagram_url.length>0&&(r+=4),t.website_url&&t.website_url.length>0&&(r+=4),t.public_email&&t.public_email.length>0&&(r+=4),t.summary&&t.summary.length>0&&(r+=4),t.biography&&t.biography.length>0&&(r+=4),t.responsible_name&&t.responsible_name.length>0&&(r+=4),t.responsible_email&&t.responsible_email.length>0&&(r+=4),t.raising_goal&&t.raising_goal.length>0&&(r+=4),t.merchant_id&&t.merchant_id.length>0&&(r+=4),t.merchant_key&&void 0!==t.merchant_key&&(r+=4),t.receipt_min&&void 0!==t.receipt_min&&(r+=3),t.receipt_max&&void 0!==t.receipt_max&&(r+=3),t.spending_spreadsheet&&t.spending_spreadsheet.length>0&&(r+=4)}if(e.issue_list){var a=e.issue_list;a&&a.length>0&&(r+=10)}e.projects&&e.projects&&e.projects.length>=4&&(r+=20),e.progress=r;var o=s.session();o.set("progress",r)},e.changed_project=function(r){e.projects[r].changed=!0},e.save_candidate=function(){e.error_list=[];var t=e.candidate_params(),a=s.current_user();t.api_key=a.api_key,e.submit_disabled=!0;try{r({method:"PUT",url:"/api/candidate/"+a.id+"?api_key="+a.api_key,data:t,headers:{"Content-Type":void 0},transformRequest:function(r){var t=new FormData;for(var a in r)t.append(a,r[a]);var o=document.querySelector("input[name=picture]");if(o.files.length>0){var n=o.files[0];if(t.append("picture",n,n.name),Math.round(100*n.size/1048576)/100>1)return c.swal("Sua imagem de perfil \xe9 muito grande","A imagem deve ter no m\xe1ximo 1MB de tamanho!"),e.submit_disabled=!1,new FormData}return t}}).then(function(){c.swal("Os dados da campanha foram salvos!"),e.submit_disabled=!1,e.check_percent()},function(r){var t=r;if(l.shoot({route:"/cadastro-completo#/dados-pessoais",error:JSON.stringify(t)}),!t.data)return c.swal("Erro ao salvar os dados!"),!1;t=r.data.form_error;var a=function(e){return document.querySelector("form[name=candidateForm] label[for="+e+"]")};for(var n in t){if("picture"==n&&"invalid image"===t[n])return e.error_list.push("Arquivo de imagem inv\xe1lido!"),!1;var i=a(n).innerText;e.error_list.push(i+o(t[n]))}throw e.submit_disabled=!1,new Error("ERROR_SAVING_CANDIDATE")})}catch(n){e.submit_disabled=!1,console.error(n)}return!1},e.save_campaign=function(){e.error_list=[];var t=e.campaign_params(),a=s.current_user();return t.api_key=a.api_key,e.submit_disabled=!0,r({method:"PUT",url:"/api/candidate/"+a.id+"?api_key="+a.api_key,data:t,headers:{"Content-Type":void 0},transformRequest:function(e){var r=new FormData;for(var t in e)r.append(t,e[t]);var a=document.querySelector("input[name=spending_spreadsheet]");if(a.files.length>0){var o=a.files[0];r.append("spending_spreadsheet",o,o.name)}return r}}).then(function(){c.swal("Os dados da campanha foram salvos!"),e.submit_disabled=!1,e.check_percent()},function(r){var t=r.data.form_error;if(t.hasOwnProperty("spending_spreadsheet")&&"invalid file"==t.form_error.spending_spreadsheet)return c.swal("Formato do arquivo de Planilha de Gastos inv\xe1lido!"),!1;var a=function(e){return document.querySelector("form[name=campaignForm] label[for="+e+"]")};for(var n in t){var i=a(n).innerText;e.error_list.push(i+o(t[n]))}throw e.submit_disabled=!1,new Error("ERROR_SAVING_CAMPAIGN")}),!1},e.save_project=function(t){var a=e.projects[t];if(""==a.title||""==a.scope)return c.swal("Os campos de Titulo e Descri\xe7\xe3o s\xe3o obrigat\xf3rios"),!1;var o={title:a.title,scope:a.scope};a.hasOwnProperty("id")&&a.id>0&&(o.id=a.id);var n=s.current_user();return o.api_key=n.api_key,r({method:a.id&&a.id>0?"PUT":"POST",url:"/api/candidate/"+n.id+"/projects"+(a.id&&a.id>0?"/"+a.id:"")+"?api_key="+n.api_key,data:d.from_object(o),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(){c.swal("O projeto foi salvo!"),e.check_percent()},function(){throw c.swal("Error","O projeto n\xe3o pode ser salvo!"),new Error("ERROR_SAVING_PROJECT")}),!1},e.new_project=function(){return e.projects.push({id:0,title:"",scope:"",changed:!0}),!1},e.remove_project=function(t){var a=e.projects[t];return c.swal({title:"Tem certeza?",text:"Voc\xea tem certeza que deseja remover este projeto?",showCancelButton:!0,confirmButtonText:"Sim",cancelButtonText:"N\xe3o",closeOnConfirm:!0,closeOnCancel:!0},function(o){if(o)if(a.hasOwnProperty("id")&&a.id>0){var n=s.current_user();r["delete"]("/api/candidate/"+n.id+"/projects/"+a.id+"?api_key="+n.api_key).then(function(){e.projects.splice(t,1),swal("O projeto foi removido com sucesso!"),e.check_percent()},function(){throw new Error("ERROR_DELETE_PROJECTS")})}else e.projects.splice(t,1)}),!1},e.count_checked=function(r){var t=e.issue_list.filter(function(e){return e.selected?!0:void 0});return t.length>4&&(r&&(r.i.selected=!1),swal("Selecione apenas 4 assuntos priorit\xe1rios.")),!1},e.candidate_params=function(){return t.require(e.candidate).permit("picture","video_url","facebook_url","twitter_url","instagram_url","website_url","public_email","summary","biography","responsible_name","responsible_email","cnpj")},e.campaign_params=function(){var r=e.issue_list.filter(function(e){return e.selected?!0:void 0}),a=[];for(var o in r)a.push(r[o].id);var n=parseFloat(e.candidate.raising_goal);-1!=n.toString().indexOf(".")&&(n+=".00");var i={raising_goal:n,issue_priorities:a.join(","),payment_gateway_id:e.candidate.payment_gateway_id,merchant_id:e.candidate.merchant_id,merchant_key:e.candidate.merchant_key,receipt_min:e.candidate.receipt_min,receipt_max:e.candidate.receipt_max};return t.require(i).permit("raising_goal","issue_priorities","merchant_key","merchant_id","receipt_min","receipt_max","payment_gateway_id")},e.projects_params=function(){for(var e=[],r=document.querySelectorAll(".project-item"),t=0;t<r.length;t++){var a=r[t],o=a.getAttribute("data-id").replace("item-",""),n=a.querySelector("input[name=project_title]").value,i=a.querySelector("textarea[name=project_content]").value;e.push({id:o,title:n,content:i})}return e},e.get_candidate=function(){var t={},a=s.current_user();return t.api_key=a.api_key,r.get("/api/candidate/"+a.id+"?api_key="+a.api_key).then(function(r){e.candidate=r.data.candidate,function(){var r=document.querySelector("#show-boleto");r&&"activated"===e.candidate.status&&r.classList.remove("hide")}(),e.get_issues_priority()},function(){throw new Error("ERROR_GET_CANDIDATE")}),!1},e.get_projects=function(){var t=s.current_user();r.get("/api/candidate/"+t.id+"/projects",{api_key:t.api_key}).then(function(r){var t=r.data.projects.map(function(e){return e.changed=!1,e});t.length>0&&(e.projects=t),e.check_percent()},function(){throw new Error("ERROR_GET_PROJECTS")})},e.get_issues_priority=function(){r.get("/api/issue_priority").then(function(r){e.issue_list=r.data.issue_priority;for(var t in e.issue_list)e.candidate.hasOwnProperty("candidate_issue_priorities")&&e.candidate.candidate_issue_priorities.map(function(r){e.issue_list[t].id==r.id&&(e.issue_list[t].selected=!0)});e.check_percent()},function(){throw new Error("ERROR_GET_ISSUE_PRIORITY")})},s.validate_user({role:"user"}),e.get_candidate(),e.get_projects(),e.check_percent()}]),e.votolegal.controller("ExploreController",["$scope","$http","auth_service","serialize","SweetAlert","trouble",function(e,t,a,o,n,i){e.list=[],e.redirect_to=function(){if(candidate.website_url.length>0){var e=window.open(candidate.website_url,"_blank");return e.focus(),!1}return n.swal("Website n\xe3o definido","Este candidato n\xe3o configurou nenhum website para acesso."),!1},e.load_list=function(r){return t({method:"post",url:"/api/search",data:o.from_object({name:r}),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(r){e.list=r.data,console.log(e.list)},function(e){e.data;console.log(e),n.swal("Erro inesperado","N\xe3o foi possivel carregar a lista de usu\xe1rios!"),i({route:"/explore",error:JSON.stringify(e)})}),!1};var s=r.query("q")||void 0;console.log(s),e.load_list(s)}]);var n=document.location.href;(!n.match(/^https:\/\/www.votolegal.org.br/)&&n.match(/^https:\/\/([a-z0-9_-]*).votolegal.org.br/)||n.match(/votolegal.org.br\/candidato/))&&(e.votolegal.config(["$routeProvider",function(e){e.when("/",{templateUrl:"/javascripts/app/view/candidato/index.tmpl",controller:"CandidateController"}).when("/doar",{templateUrl:"/javascripts/app/view/candidato/doar.tmpl",controller:"CandidateController"}).when("/doar/success",{templateUrl:"/javascripts/app/view/candidato/success.tmpl",controller:"CandidateController"}).otherwise({redirectTo:"/"})}]),$(document).ready(function(){$("body").on("click","input.opcao_doar_radio",function(e){e.preventDefault,$(this).hasClass("opcao_doar_diff")?$(this).closest(".valor-doa-container").find(".doar-number-diferente").attr("disabled",!1):$(".doar-number-diferente").attr("disabled",!0),$(".valor-doa-container").removeClass("doa-container-active"),$(this).closest(".valor-doa-container").addClass("doa-container-active")}),$("input.opcao_doar_radio:checked").trigger("click")})),e.votolegal.controller("CandidateController",["$scope","$http","$sce","serialize","auth_service","SweetAlert","trouble","postmon",function(e,a,n,i,s,d,c,l){var u=document.querySelector("#loading");e.candidate={},e.doar={},e.payment={},e.error_list=[],e.donations=[],e.name=function(){var e=document.location.href;return e=e.split(/\//)[2].split(".")[0],"localhost"!==e?e:void 0}(),e.month_list=function(){list=[];for(var e=1;12>=e;e++)list.push(e);return list}(),e.year_list=function(){list=[];for(var e=2016;2030>=e;e++)list.push(e);return list}(),e.make_percent=function(e,r){return 0===r?"0%":(e/100/r*100).toFixed(2)+"%"},e.render_video=function(e){return'<iframe id="candidate_video" src="'+n.trustAsResourceUrl(e)+'" width="560" height="315" allowfullscreen></iframe>'},e._issues_priorities_decorator=function(r){return e.candidate.candidate_issue_priorities.map(function(e){return e.name}).join(r||", ")},e.candidate_by_name=function(t){return a({method:"GET",url:"/api/candidate/"+t}).then(function(t){var a=t.data.candidate;e.candidate=a,function(){var r=document.querySelector("title");"VotoLegal - Candidato(a)"===r.innerText&&(r.innerText+=" "+e.candidate.popular_name)}(),function(){var t=e.candidate.video_url;t.match("youtube")&&(e.candidate.video_url="https://www.youtube.com/embed/"+r.init(t).query("v"))}(),e.candidate.issues_decorator=e._issues_priorities_decorator(),e.candidate.total_donated=e.candidate.total_donated||0,e.candidate.raising_goal=parseFloat(e.candidate.raising_goal)||0,function(){var r=document.querySelector("#video-renderer");r&&(r.innerHTML=e.render_video(a.video_url))}(),e.candidate.projects=[],e.candidate_projects(a)},function(e){throw c.shoot({route:document.location.href,error:JSON.stringify(e)}),new Error("Model is invalid or cannot be found!")}),!1},e.billing_by_zipcode=function(){var r=e.doar.billing_address_zipcode;return 9==r.length&&l(r).then(function(r){var t=r.data,a=e.doar;a.billing_address_city=t.cidade,a.billing_address_state=t.estado;var o=document.querySelector("form[name=doarForm] *[name=billing_address_district]");t.bairro?(a.billing_address_district=t.bairro,o.disabled=!0):(a.billing_address_district="",o.disabled=!1);var n=document.querySelector("form[name=doarForm] *[name=billing_address_street]");t.logradouro?(a.billing_address_street=t.logradouro,n.disabled=!0):(a.billing_address_street="",n.disabled=!1)},function(){throw swal({title:"Problemas ao carregar os dados do CEP!",text:"Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente."}),["billing_address_state","billing_address_city","billing_address_district","billing_address_street"].map(function(r){try{e.doar[r]="",document.querySelector("form[name=doarForm] *[name="+r+"]").disabled=!0}catch(t){}}),new Error("ERROR_GET_ZIPCODE")}),!1},e.address_by_zipcode=function(){var r=e.doar.address_zipcode;return 9==r.length&&l(r).then(function(r){var t=r.data,a=e.doar;a.address_city=t.cidade,a.address_state=t.estado;var o=document.querySelector("form[name=doarForm] *[name=address_district]");t.bairro?(a.address_district=t.bairro,o.disabled=!0):(a.address_district="",o.disabled=!1);var n=document.querySelector("form[name=doarForm] *[name=address_street]");t.logradouro?(a.address_street=t.logradouro,n.disabled=!0):(a.address_street="",n.disabled=!1)},function(){throw swal({title:"Problemas ao carregar os dados do CEP!",text:"Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente."}),["address_state","address_city","address_district","address_street"].map(function(r){try{e.doar[r]="",document.querySelector("form[name=doarForm] *[name="+r+"]").disabled=!0}catch(t){}}),new Error("ERROR_GET_ZIPCODE")}),!1},e.candidate_projects=function(r){return a({method:"GET",url:"/api/candidate/"+r.id+"/projects"}).then(function(r){var t=r.data.projects;!function(){var e=0;t.map(function(r){e+=r.votes}),t=t.map(function(r){return r.total=e,r})}(),e.candidate.projects=t},function(e){throw c.shoot({route:document.location.href,error:JSON.stringify(e)}),new Error("Project list is invalid or cannot be found!")}),u.classList.add("hide"),!1},e.candidate_donations=function(r){var t=document.querySelector("#donations-table"),o=document.querySelector("#loading-donations"),n=document.querySelector("#donations-error");n&&n.classList.add("hide"),t&&(t.classList.add("hide"),o&&o.classList.remove("hide"));try{a({method:"GET",url:"/api/candidate/"+r.id+"/donate"}).then(function(r){var a=r.data.donations;e.donations=a,t&&(o&&o.classList.add("hide"),t.classList.remove("hide"))},function(e){throw t&&(o&&o.classList.add("hide"),t.classList.remove("hide")),c.shoot({route:document.location.href,error:JSON.stringify(e)}),d.swal("Falha no carregamento dos dados","N\xe3o foi poss\xedvel carregar os dados de doa\xe7\xf5es."),new Error("Donation list is invalid or cannot be found!")})}catch(i){t&&(o&&o.classList.add("hide"),t.classList.remove("hide"))}},e.doar_continue=function(r){if(!r||10>r)return d.swal("Preencha um valor superior a 10,00 reais."),!1;if(r>1064)return d.swal("Preencha um valor igual ou inferior a 1.064,00 reais."),!1;document.getElementById("amount-review").classList.remove("hide");var t=document.querySelectorAll(".valor-doa-container");for(var a in t)t[a]&&t[a].classList&&t[a].classList.add("hide");document.getElementById("doar-form").classList.remove("hide"),e.doar.amount=parseFloat(r),e.get_session()},e.doar_edit=function(){document.getElementById("amount-review").classList.add("hide");var e=document.querySelectorAll(".valor-doa-container");for(var r in e)e[r]&&e[r].classList&&e[r].classList.remove("hide");document.getElementById("doar-form").classList.add("hide")},e.get_session=function(){var r=e.candidate.id||0;return a({url:"/api/candidate/"+r+"/donate/session"}).then(function(r){e.payment.session=r.data.id,PagSeguroDirectPayment.setSessionId(r.data.id)},function(e){throw c.shoot({route:"/cadastro/boleto",error:JSON.stringify(e)}),new Error("ERROR_GET_SESSION")}),!1},e.get_brand=function(r){r.slice(0,6);return 6==r.length&&e.card_brand({bin:r.slice(0,6),success_cb:function(e){var r=e.brand,t=document.querySelector("#card-image");t&&(t.innerHTML='<img src="//stc.pagseguro.uol.com.br/public/img/payment-methods-flags/42x20/'+r.name+'.png" alt="'+r.name+'" title="'+r.name+'">')},error_cb:function(){var e=document.querySelector("#card-image");e&&(e.classList.add("text-danger"),e.innerText="(bandeira do cart\xe3o n\xe3o encontrada)")}}),!1},e.send_donation=function(){e.error_list=[];var r=PagSeguroDirectPayment.getSenderHash();e.doar.sender_hash=r,function(){var r=document.querySelector("#billing_address"),t="address_zipcode address_state address_city address_street address_district address_house_number address_complement".split(/\s/);if(r.classList.contains("hide"))for(var a in t)e.doar["billing_"+t[a]]=e.doar[t[a]]}();var t=function(e){return document.querySelector("form[name=doarForm] label[for="+e+"]")||void 0},n=e.donation_params(),s=e.card_params(),l={card_number:"N\xfamero do cart\xe3o",card_month:"M\xeas do cart\xe3o",card_year:"Ano do cart\xe3o",card_cvv:"C\xf3digo do cart\xe3o"};for(var u in s)s[u]||0!=s[u].length||e.error_list.push(l[u]+" \xe9 obrigat\xf3rio");return e.error_list.length>0?!1:void e.card_brand({bin:s.card_number.slice(0,6),success_cb:function(r){var l=r.brand?r.brand:void 0;l&&e.card_token({card_number:s.card_number,brand:l.name,cvv:s.card_cvv,month:s.card_month,year:s.card_year,success_cb:function(r){e.error_list=[],n.credit_card_token=r.card.token;var s=n.birthdate;if(s&&s.length>0){var l=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);4===l.length&&(n.birthdate=[l[3],l[2],l[1]].join("-"))}else n.birthdate="";return n.amount=parseInt(100*n.amount),a({method:"POST",url:"/api/candidate/"+e.candidate.id+"/donate",data:i.from_object(n),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(){document.location="#/doar/success"},function(r){if(e.error_list=[],r&&r.data&&r.data.form_error){var a=r.data.form_error;for(var n in a){var i=t(n);if(void 0!==i){var s=i.innerText;n.match(/billing/)&&(s+=" (endere\xe7o de cobran\xe7a) "),e.error_list.push(s+o(a[n]))}}return c.shoot({route:document.location.href,error:JSON.stringify(r)}),!1}throw c.shoot({route:document.location.href,error:JSON.stringify(r)}),d.swal("Erro inesperado com a doa\xe7\xe3o"),new Error("DONATION_POST_ERROR")}),!1},error_cb:function(r){throw e.error_list.push("N\xe3o foi possivel carregar os dados do cart\xe3o!"),c.shoot({route:document.location.href,error:JSON.stringify(r)}),new Error("CARDBRAND_GET_ERROR")}})},error_cb:function(r){throw e.error_list.push("Bandeira do cart\xe3o n\xe3o pode ser id\xeantificada!"),c.shoot({route:document.location.href,error:JSON.stringify(r)}),new Error("CARDBRAND_GET_ERROR")}})},e.payment_method=function(e){PagSeguroDirectPayment.getPaymentMethods({amount:parseFloat(e.amount),success:e.success_cb,error:e.error_cb,complete:e.complete_cb})},e.card_brand=function(e){PagSeguroDirectPayment.getBrand({cardBin:e.bin,success:e.success_cb||function(){},error:e.error_cb||function(){},complete:e.complete_cb||function(){}})},e.card_token=function(e){PagSeguroDirectPayment.createCardToken({cardNumber:e.card_number,
brand:e.brand,cvv:e.cvv,expirationMonth:e.month,expirationYear:e.year,success:e.success_cb||function(){},error:e.error_cb||function(){},complete:e.complete_cb||function(){}})},e.same_billing_addr=function(){var r=document.querySelector("#billing_address"),t="address_zipcode address_state address_city address_street address_district address_house_number address_complement".split(/\s/);if(r.classList.contains("hide")){for(var a in t)e.doar["billing_"+t[a]]="";r.classList.remove("hide")}else{for(var a in t)e.doar["billing_"+t[a]]=e.doar[t[a]];r.classList.add("hide")}return!1},e.donation_params=function(){return e.doar.credit_card_name=e.doar.name,t.require(e.doar).permit("name","cpf","email","phone","birthdate","address_street","address_house_number","address_district","address_zipcode","address_city","address_state","billing_address_street","billing_address_house_number","billing_address_complement","billing_address_district","billing_address_zipcode","billing_address_city","billing_address_state","credit_card_name","amount","sender_hash","credit_card_token","address_complement","billing_address_complement")},e.card_params=function(){return t.require(e.payment).permit("card_number","card_month","card_year","card_cvv")},e.candidate_by_name(e.name)}]),e.votolegal.controller("BoletoController",["$scope","$http","postmon","auth_service","serialize","SweetAlert","trouble",function(e,r,a,n,i,s,d){e.candidate={},e.payment={},e.bank_list=[],e.accept_terms=0,e.submit_disabled=!1,e.address_by_zipcode=function(){var r=e.candidate.address_zipcode;return 9==r.length&&a(r).then(function(r){var t=r.data,a=e.candidate;a.address_city=t.cidade,a.address_state=t.estado_info.nome;var o=document.querySelector("form[name=boletoForm] *[name=address_district]");t.bairro?(a.address_district=t.bairro,o.disabled=!0):(a.address_district="",o.disabled=!1);var n=document.querySelector("form[name=boletoForm] *[name=address_street]");t.logradouro?(a.address_street=t.logradouro,n.disabled=!0):(a.address_street="",n.disabled=!1)},function(){throw swal({title:"Problemas ao carregar os dados do CEP!",text:"Ocorreu um erro ao tentar carregar os dados de sua localidade. Verifique o CEP e tente novamente."}),["address_state","address_city","address_district","address_street"].map(function(r){try{e.candidate[r]="",document.querySelector("form[name=boletoForm] *[name="+r+"]").disabled=!0}catch(t){}}),new Error("ERROR_GET_ZIPCODE")}),!1},e.get_session=function(){var t=n.current_user();return r({method:"GET",url:"/api/candidate/"+t.id+"/payment/session?api_key="+t.api_key}).then(function(r){e.payment.session=r.data.id||0;try{PagSeguroDirectPayment.setSessionId(r.data.id)}catch(t){}},function(e){throw d.shoot({route:"/cadastro/boleto",error:JSON.stringify(e)}),new Error("ERROR_GET_SESSION")}),!1},e.get_banks=function(){return r({method:"GET",url:"/api/bank"}).then(function(r){e.bank_list=r.data.bank},function(e){throw d.shoot({route:"/cadastro/boleto",error:JSON.stringify(e)}),new Error("ERROR_GET_BANK")}),!1},e.load_candidate=function(){var t=n.current_user();return r({method:"GET",url:"/api/candidate/"+t.id+"?api_key="+t.api_key}).then(function(r){var t=r.data.candidate;t.address_district||(document.querySelector("form[name=boletoForm] *[name=address_district]").disabled=!1),function(){var e=t.address_street.split(" - ");2==e.length&&(e[0]?t.address_street=e[0]:document.querySelector("form[name=boletoForm] *[name=address_street]").disabled=!1,console.log(document.querySelector("form[name=boletoForm] *[name=address_street]")),e[1]?t.address_district=e[1]:document.querySelector("form[name=boletoForm] *[name=address_district]").disabled=!1)}(),e.candidate=t},function(e){throw d.shoot({route:document.location.href,error:JSON.stringify(e)}),new Error("Model is invalid or cannot be found!")}),!1},e.generate=function(){var a=PagSeguroDirectPayment.getSenderHash(),c=n.current_user();if(!e.accept_terms||0==e.accept_terms)return s.swal("Error","Voc\xea deve aceitar o termo de contrato!"),!1;var l=t.require(e.candidate).permit("phone","address_zipcode","address_city","address_state","address_street","address_house_number","address_district","bank_code","bank_agency","bank_agency_dv","bank_account_number","bank_agency_dv");return r({method:"PUT",url:"/api/candidate/"+c.id+"?api_key="+c.api_key,data:i.from_object(l),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(){r({method:"POST",url:"/api/candidate/"+c.id+"/payment?api_key="+c.api_key,data:i.from_object({senderHash:a}),headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then(function(e){var r=e.data.url;document.location=r},function(e){throw d.shoot({route:document.location.href,error:JSON.stringify([e,c])}),s.swal("N\xe3o foi possivel emitir o boleto!","Por favor, verifique se voc\xea digitou todos os campos acima corretamente."),new Error("ERROR_GET_BOLETO")})},function(r){var t=r.data.form_error;d.shoot({route:document.location.href,error:JSON.stringify([r,c])});var a=function(e){return document.querySelector("form[name=boletoForm] *[name="+e+"]")};for(var n in t){var i=a(n).attributes["data-name"].value;e.error_list.push(i+o(t[n]))}throw e.submit_disabled=!1,new Error("ERROR_PUT_CADIDATE")}),!1},n.validate_user({role:"user"}),e.load_candidate(),e.get_banks(),e.get_session()}]),e.votolegal.controller("DonationHistoryController",["$scope","$http","$sce","serialize","auth_service","SweetAlert","trouble","postmon",function(e,r,t,a,o,n,i){document.querySelector("#loading");e.user=o.current_user(),e.error_list=[],e.donations=[],e.history_list=function(t){var a=document.querySelector("#donations-table"),o=document.querySelector("#loading-donations"),s=document.querySelector("#donations-error");s&&s.classList.add("hide"),a&&(a.classList.add("hide"),o&&o.classList.remove("hide"));try{r({method:"GET",url:"/api/candidate/"+t.id+"/donate?api_key="+t.api_key}).then(function(r){var t=r.data.donations;e.donations=t,a&&(o&&o.classList.add("hide"),a.classList.remove("hide"))},function(e){throw a&&(o&&o.classList.add("hide"),a.classList.remove("hide")),i.shoot({route:document.location.href,error:JSON.stringify(e)}),n.swal("Falha no carregamento dos dados","N\xe3o foi poss\xedvel carregar os dados de doa\xe7\xf5es."),new Error("Donation list is invalid or cannot be found!")})}catch(d){a&&(o&&o.classList.add("hide"),a.classList.remove("hide"))}},o.validate_user({role:"user"}),e.history_list(e.user)}])}(window.app=window.app||{}),$(document).ready(function(){$("body").on("click",".nav-tabs li a",function(e){e.preventDefault()})});