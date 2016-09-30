# @namespace VotoLegal
@VotoLegal = @VotoLegal || {}


# @class VotoLegal.Estatisticas
# @author dvinciguerra
class VotoLegal.Estatisticas

  # constructor
  constructor: (@options = {}) ->
    @make()
    @load()
      
  # make method
  make: () ->
    @elementClass = 'section#estatistica'
    @$element = $(@elementClass)
    

  # load method
  load: (options = {}) ->
    $loading = $('#loading')
    try
      #$.ajax { method: 'GET', url: "#{BASE_API}/stats/depth", dataType: 'json' }
      $.ajax { method: 'GET', url: "/javascripts/mock/depth.json", dataType: 'json' }
      .then (response) =>
        @_makeCharts(response.donators)
      , (response) =>
        swal 'Não foi possível carregar os dados dos graficos!'

    catch e
      console.error e
    finally
      $loading.fadeOut('slow')

      
  # private methods
  _makeCharts: (data) =>
    console.log data

    chartData1 = {
      labels: ["Agosto", "Setembro"]
      datasets: [{
        label: 'Doadores'
        backgroundColor: "#662e91"
        data: []
      }]
    }

    for item in data then chartData1.datasets[0].data.push item.count
    new VotoLegal.Components.DoadoresChart {
      el: 'canvas-doadores', data: chartData1, type: 'donators'
    }
  
    chartData2 = {
      labels: ["Agosto", "Setembro"]
      datasets: [{
        label: 'R$'
        backgroundColor: "#fece6a"
        data: []
      }]
    }

    for item in data 
      chartData2.datasets[0].data.push parseFloat(item.amount/100).toFixed(2) || 0

    new VotoLegal.Components.DoadoresChart {
      el: 'canvas-valor', data: chartData2, type: 'amounts'
    }
  

# @namespace VotoLegal
@VotoLegal = @VotoLegal || {}
@VotoLegal.Components = @VotoLegal.Components || {}

class VotoLegal.Components.DoadoresChart
  constructor: (@options = {}) -> 
    @process()
  
  process: ->
    try
      ctx = document.getElementById(@options.el || '').getContext "2d"
    
      myBarChart = new Chart ctx, {
        type: 'bar'
        data: @options.data || {}
        options: {
          scales: 
            xAxes: [{gridLines: {display:false}}]
            yAxes: [{display:false, gridLines: {display:false}}]
          title:
            display: false
          responsive: true
          legend:
            display: false
        }
      }
    catch e
      console.error e



# entry point
$ ->
  domain = document.location.href
  unless domain.match /votolegal.org.br\/estatistica/i
    $html       = $('body')
    controller  = $html.data 'controller'
    action      = $html.data 'action'

    console.log controller
    test = new VotoLegal[controller]

    #data = {
    #  labels: ["Agosto", "Setembro"],
    #  datasets: [{
    #    label: 'Doadores'
    #    backgroundColor: "#662e91"
    #    data: [100, 200]
    #  }]
    #}

    #new VotoLegal.Components.DoadoresChart {
    #  el: 'canvas-doadores', data: data, type: 'donators'
    #}
  
    #new VotoLegal.Components.DoadoresChart {
    #  el: 'canvas-valor', data: data, type: 'donators'
    #}
  
