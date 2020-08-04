var depth = [];
var density = [];
var gammaRay = [];
for (var i = 0; i < 2500; i++) {
  depth.push(i);
  density.push(Math.random() / 2 + 2.4);
  gammaRay.push(Math.random() * 100);
}

var trace1 = {
  x: gammaRay,
  y: depth,
  xaxis: 'x2',
  type: 'scatter',
};

var trace2 = {
  x: density,
  y: depth,
  type: 'line',
};
var data = [trace1, trace2];

var layout = {
  grid: {
    rows: 1,
    columns: 2,
  },
  width: 400,
  dragmode: 'pan',
  showlegend: false,
  yaxis: {
    //autorange: 'reversed',
    range: [50, 0],
    //autorange: 'reversed'
  },
  xaxis: {
    side: 'top',
    fixedrange: true,
    title: {
      text: 'GR',
      x: -20
    },
  },
  xaxis2: {
    side: 'top',
    fixedrange: true,
    title: {
        text: 'Density'
    }
  },
};

Plotly.newPlot('myDiv', data, layout);
