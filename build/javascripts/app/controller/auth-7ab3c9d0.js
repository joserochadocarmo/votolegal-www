app.votolegal.controller("AuthController",["$scope","$http","auth_service",function(r,o,e){r.signin={},r.error_list=[],r.signin.token=URI.query("token"),r.signin_params=function(){return r.signin},r.forgot_password=function(){r.error_list=[];var o=r.signin_params();return e.forgot_password(o.email).then(function(r){r.data;document.location="/conta/recuperar-senha/success"},function(o){var e=o.data;if(e.hasOwnProperty("form_error")){var e=e.form_error,n=function(r){return document.querySelector("form[name=forgotForm] *[name="+r+"]")};for(var a in e){var t=n(a).attributes.placeholder.value;r.error_list.push(t+error_msg(e[a]))}}else r.error_list.push(error_msg(e.error));throw new Error("ERROR_FORGOT_PASSWORD")}),!1},r.change_password=function(){r.error_list=[];var o=r.signin_params();return null==o.password&&r.error_list.push("Nova Senha \xe9 um campo obrigat\xf3rio."),o.password!==o.confirm_password&&r.error_list.push("Os campos de senha devem ser iguais."),r.error_list.length>0?!1:(e.change_password(o.password,o.token).then(function(r){r.data;document.location="/conta/trocar-senha/success"},function(o){var e=o.data;if(e.hasOwnProperty("form_error")){var e=e.form_error,n=function(r){return document.querySelector("form[name=changePasswordForm] *[name="+r+"]")};for(var a in e){var t=n(a).attributes.placeholder.value;r.error_list.push(t+error_msg(e[a]))}}else r.error_list.push(error_msg(e.error));throw new Error("ERROR_CHANGE_PASSWORD")}),!1)},r.authenticate=function(){var o=r.signin_params();return e.authenticate(o.email,o.password).then(function(r){var o=r.data,n=o.roles||[],a=e.session();if(a.set(e.session_key,{id:o.user_id,api_key:o.api_key,role:n[0]||null}),0==n.length)return document.location="/admin/signin",!1;for(var t in n)"admin"===n[t]&&(document.location="/admin"),"user"===n[t]&&(document.location="/pre-cadastro/aprovado")},function(o){r.error_list=[];var e=o.data;if(e.form_error){var e=e.form_error,n=function(r){return document.querySelector("form[name=signinForm] *[name="+r+"]")};for(var a in e){var t=n(a).attributes.placeholder.value;r.error_list.push(t+error_msg(e[a]))}}else r.error_list.push(error_msg(e.error));throw new Error("ERROR_AUTH_USER")}),!1}}]);