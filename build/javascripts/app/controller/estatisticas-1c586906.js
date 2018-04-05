(function() {
  this.VotoLegal = this.VotoLegal || {};

  VotoLegal.Estatisticas = (function() {
    function Estatisticas(options1) {
      this.options = options1 != null ? options1 : {};
      this.make();
      this.load();
    }

    Estatisticas.prototype.make = function() {
      this.elementClass = 'section#estatistica';
      return this.$element = $(this.elementClass);
    };

    Estatisticas.prototype.load = function(options) {
      var $loading, e;
      if (options == null) {
        options = {};
      }
      $loading = $('#loading').css({
        display: 'block'
      });
      try {
        return $.ajax({
          method: 'GET',
          url: BASE_API + "/stats/depth",
          dataType: 'json'
        }).then((function(_this) {
          return function(response) {
            var data;
            data = response;
            _this._makeCharts(data);
            return _this._populateModels(data);
          };
        })(this), (function(_this) {
          return function(response) {
            return swal('Não foi possível carregar os dados dos graficos!');
          };
        })(this));
      } catch (error) {
        e = error;
        return console.error(e);
      } finally {
        $loading.fadeOut('slow');
      }
    };

    Estatisticas.prototype._makeCharts = function(data) {
      this._chartDonators(data.graph);
      return this._chartAmounts(data.graph);
    };

    Estatisticas.prototype._populateModels = function(data) {
      var $list;
      $list = $('h3');
      return $list.each(function(i, item) {
        var formatter, model;
        model = data[$(item).data('model')];
        formatter = $(item).data('formatter') || '';
        switch (formatter) {
          case 'currency':
            model = new BrazilianCurrency(model).format({
              simbol: true
            });
            break;
          default:
            model;
        }
        if (item && model) {
          return item.innerHTML = model || 0;
        }
      });
    };

    Estatisticas.prototype._chartDonators = function(data) {
      var chartData, item, j, len;
      chartData = [];
      for (j = 0, len = data.length; j < len; j++) {
        item = data[j];
        chartData.push(item.count || 0);
      }
      return new VotoLegal.Components.DoadoresChart({
        el: 'canvas-doadores',
        data: chartData,
        color: "#662e91",
        label: 'Doadores'
      });
    };

    Estatisticas.prototype._chartAmounts = function(data) {
      var chartData, item, j, len;
      chartData = [];
      for (j = 0, len = data.length; j < len; j++) {
        item = data[j];
        chartData.push(parseFloat(item.amount / 100).toFixed(2) || 0);
      }
      return new VotoLegal.Components.DoadoresChart({
        el: 'canvas-valor',
        data: chartData,
        color: '#fece6a',
        label: 'R$'
      });
    };

    return Estatisticas;

  })();

  this.VotoLegal = this.VotoLegal || {};

  this.VotoLegal.Components = this.VotoLegal.Components || {};

  VotoLegal.Components.DoadoresChart = (function() {
    function DoadoresChart(options1) {
      this.options = options1 != null ? options1 : {};
      this.process();
    }

    DoadoresChart.prototype.process = function() {
      var chartData, chartOptions, ctx, e, myBarChart;
      chartData = {
        labels: ["Agosto", "Setembro", "Outubro"],
        datasets: [
          {
            label: this.options.label || 'No',
            backgroundColor: this.options.color || "#fece6a",
            data: this.options.data || []
          }
        ]
      };
      chartOptions = {
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              display: false,
              gridLines: {
                display: false
              }
            }
          ]
        },
        title: {
          display: false
        },
        responsive: true,
        legend: {
          display: false
        }
      };
      chartOptions.showTooltips = false;
      chartOptions.onAnimationComplete = function() {
        var ctx;
        ctx = this.chart.ctx;
        ctx.font = this.scale.font;
        ctx.fillStyle = this.scale.textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        return this.datasets.forEach(function(dataset) {
          return dataset.bars.forEach(function(bar) {
            var val;
            val = bar.value;
            if (this.options.label === 'R$') {
              val = new BrazilianCurrency(bar.value * 100).format();
            }
            return ctx.fillText(val, bar.x, bar.y - 5);
          });
        });
      };
      try {
        ctx = document.getElementById(this.options.el || '').getContext("2d");
        return myBarChart = new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: chartOptions
        });
      } catch (error) {
        e = error;
        return console.error(e);
      }
    };

    return DoadoresChart;

  })();

  $(function() {
    var $html, action, controller, domain, test;
    domain = document.location.href;
    if (domain.match(/votolegal.com.br\/estatistica/i)) {
      $html = $('body');
      controller = $html.data('controller');
      action = $html.data('action');
      return test = new VotoLegal[controller];
    }
  });

}).call(this);
