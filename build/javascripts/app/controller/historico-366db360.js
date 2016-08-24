app.votolegal.controller("DonationHistoryController",["$scope","$http","$sce","serialize","auth_service","SweetAlert","trouble","postmon",function(o,e,t,a,s,r,i){document.querySelector("#loading");o.user=s.current_user(),o.error_list=[],o.donations=[],o.history_list=function(t){var a=document.querySelector("#donations-table"),s=document.querySelector("#loading-donations"),d=document.querySelector("#donations-error");d&&d.classList.add("hide"),a&&(a.classList.add("hide"),s&&s.classList.remove("hide"));try{e({method:"GET",url:"/api/candidate/"+t.id+"/donate?api_key="+t.api_key}).then(function(e){var t=e.data.donations;o.donations=t;for(var r in o.donations){o.donations[r].captured_at=Date.parse(o.donations[r].captured_at);var i=o.donations[r].birthday.match(/^(\d{4})-(\d{2})-(\d{2})$/);o.donations[r].birthday=i[3]+"."+i[2]+"."+i[1]}a&&(s&&s.classList.add("hide"),a.classList.remove("hide"))},function(o){throw a&&(s&&s.classList.add("hide"),a.classList.remove("hide")),i.shoot({route:document.location.href,error:JSON.stringify(o)}),r.swal("Falha no carregamento dos dados","N\xe3o foi poss\xedvel carregar os dados de doa\xe7\xf5es."),new Error("Donation list is invalid or cannot be found!")})}catch(n){a&&(s&&s.classList.add("hide"),a.classList.remove("hide"))}},s.validate_user({role:"user"}),o.history_list(o.user)}]);