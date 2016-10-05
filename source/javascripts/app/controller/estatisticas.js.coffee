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
    $loading = $('#loading').css {display:'block'}

    try
      $.ajax { method: 'GET', url: "#{BASE_API}/stats/depth", dataType: 'json' }
      #$.ajax { method: 'GET', url: "/javascripts/mock/depth.json", dataType: 'json' }
      .then (response) =>
        data = response
        @_makeCharts data
        @_populateModels data
      , (response) =>
        swal 'Não foi possível carregar os dados dos graficos!'

    catch e
      console.error e
    finally
      $loading.fadeOut('slow')

      
  # private methods
  _makeCharts: (data) ->
    @_chartDonators(data.graph)
    @_chartAmounts(data.graph)

  # populate view models
  _populateModels: (data) ->
    $list = $('h3')

    $list.each (i, item) ->
      model = data[$(item).data('model')]
      formatter = $(item).data('formatter') || ''
      switch formatter
        when 'currency' then model = new BrazilianCurrency(model).format {simbol: true}
        else model

      item.innerHTML = model || 0 if item && model
    



  # chart for donators
  _chartDonators: (data) ->
    chartData = []
    for item in data 
      chartData.push item.count || 0

    new VotoLegal.Components.DoadoresChart {
      el: 'canvas-doadores', data: chartData, color: "#662e91", label: 'Doadores'
    }
  

  # chart for amount
  _chartAmounts: (data) ->
    chartData = []
    for item in data 
      chartData.push parseFloat(item.amount/100).toFixed(2) || 0

    new VotoLegal.Components.DoadoresChart {
      el: 'canvas-valor', data: chartData, color: '#fece6a', label: 'R$'
    }
  

# @namespace VotoLegal
@VotoLegal = @VotoLegal || {}
@VotoLegal.Components = @VotoLegal.Components || {}

class VotoLegal.Components.DoadoresChart
  constructor: (@options = {}) -> 
    @process()
  
  process: ->
    # chart data
    chartData = {
      labels: ["Agosto", "Setembro", "Outubro"]
      datasets: [{
        label: @options.label || 'No'
        backgroundColor: @options.color || "#fece6a"
        data: @options.data || []
      }]
    }

    # chart options
    chartOptions =
      scales:
        xAxes: [{gridLines: {display:false}}]
        yAxes: [{display:false, gridLines: {display:false}}]
      title:
        display: false
      responsive: true
      legend:
        display: false

    chartOptions.showTooltips = false
    chartOptions.onAnimationComplete = ->
        ctx = this.chart.ctx
        ctx.font = this.scale.font
        ctx.fillStyle = this.scale.textColor
        ctx.textAlign = "center"
        ctx.textBaseline = "bottom"

        this.datasets.forEach (dataset) ->
          dataset.bars.forEach (bar) ->
            val = bar.value
            val = new BrazilianCurrency(bar.value*100).format() if @options.label is 'R$'
            ctx.fillText val, bar.x, bar.y - 5

    try
      ctx = document.getElementById(@options.el || '').getContext "2d"
    
      myBarChart = new Chart ctx, {
        type: 'bar'
        data: chartData
        options: chartOptions
      }
    catch e
      console.error e



# entry point
$ ->
  domain = document.location.href
  if domain.match /votolegal.org.br\/estatistica/i
    $html       = $('body')
    controller  = $html.data 'controller'
    action      = $html.data 'action'

    test = new VotoLegal[controller]

