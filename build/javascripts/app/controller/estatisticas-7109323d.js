(function(){this.VotoLegal=this.VotoLegal||{},VotoLegal.Estatisticas=function(){function t(t){this.options=null!=t?t:{},this.make(),this.load()}return t.prototype.make=function(){return this.elementClass="section#estatistica",this.$element=$(this.elementClass)},t.prototype.load=function(t){var o,e,a;null==t&&(t={}),o=$("#loading").css({display:"block"});try{return $.ajax({method:"GET",url:"/javascripts/mock/depth.json",dataType:"json"}).then(function(t){return function(o){return t._makeCharts(o.donators)}}(this),function(){return function(){return swal("N\xe3o foi poss\xedvel carregar os dados dos graficos!")}}(this))}catch(a){return e=a,console.error(e)}finally{o.fadeOut("slow")}},t.prototype._makeCharts=function(t){return this._chartDonators(t),this._chartAmounts(t)},t.prototype._chartDonators=function(t){var o,e,a,n;for(o=[],e=0,n=t.length;n>e;e++)a=t[e],o.push(a.count||0);return new VotoLegal.Components.DoadoresChart({el:"canvas-doadores",data:o,color:"#662e91",label:"Doadores"})},t.prototype._chartAmounts=function(t){var o,e,a,n;for(o=[],e=0,n=t.length;n>e;e++)a=t[e],o.push(parseFloat(a.amount/100).toFixed(2)||0);return new VotoLegal.Components.DoadoresChart({el:"canvas-valor",data:o,color:"#fece6a",label:"R$"})},t}(),this.VotoLegal=this.VotoLegal||{},this.VotoLegal.Components=this.VotoLegal.Components||{},VotoLegal.Components.DoadoresChart=function(){function t(t){this.options=null!=t?t:{},this.process()}return t.prototype.process=function(){var t,o,e,a,n;t={labels:["Agosto","Setembro"],datasets:[{label:this.options.label||"No",backgroundColor:this.options.color||"#fece6a",data:this.options.data||[]}]};try{return o=document.getElementById(this.options.el||"").getContext("2d"),n=new Chart(o,{type:"bar",data:t,options:{scales:{xAxes:[{gridLines:{display:!1}}],yAxes:[{display:!1,gridLines:{display:!1}}]},title:{display:!1},responsive:!0,legend:{display:!1}}})}catch(a){return e=a,console.error(e)}},t}(),$(function(){var t,o,e,a,n;return a=document.location.href,a.match(/votolegal.org.br\/estatistica/i)?void 0:(t=$("body"),e=t.data("controller"),o=t.data("action"),n=new VotoLegal[e])})}).call(this);