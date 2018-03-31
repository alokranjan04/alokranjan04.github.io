

function drawPieChart(value, graphNo, heading ) {
 
      var ele = document.createElement("div");
            ele.setAttribute("class","col-md-6");
            ele.setAttribute("id","ocontainer"+graphNo);
            document.getElementById("graph").appendChild(ele);
     Highcharts.chart('ocontainer'+graphNo, {
            chart: {
                backgroundColor: '#C9EDF4',
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Decision Pie Chart for '+heading
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y}',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: 'Brands',
                colorByPoint: true,
                data: value
            }]
        });
        
}