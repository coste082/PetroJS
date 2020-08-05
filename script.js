//Calculate fake log
var depth = [];
var density = [];
var gammaRay = [];
for (var i = 0; i < 2500; i++) {
  depth.push(i);
  density.push(Math.random() / 2 + 2.4);
  gammaRay.push(Math.random() * 100);
}

//set up tracks
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

//Adjust log width based on number of tracks
document.getElementById('myDiv').style.width = data.length * 150;
console.log('test12')
//track layout
var layout = {
  grid: {
    rows: 1,
    columns: 2,
  },
  width: data.length * 150,
  dragmode: 'pan',
  showlegend: false,
  yaxis: {
    range: [50, 0],
    title: {
      text: 'Depth',
    },
  },
  xaxis: {
    side: 'top',
    fixedrange: true,
    title: {
      text: 'GR',
      x: -20,
    },
  },
  xaxis2: {
    side: 'top',
    fixedrange: true,
    title: {
      text: 'Density',
    },
  },
  margin: {
    l: 30,
    r: 50,
    t: 50,
    b: 30,
  },
  shapes: [
    {
      type: 'line',
      xref: 'paper',
      yref: 'y',
      x0: 0,
      y0: 10,
      x1: 1,
      y1: 10,
      line: {
        color: 'rgb(50,171,96)',
        width: 3,
      },
    },
  ],
  annotations: [
    {
      xref: 'paper',
      yref: 'y',
      x: 1.12,
      xanchor: 'right',
      y: 10,
      //yanchor: 'bottom',
      text: 'Top1',
      showarrow: false,
    },
  ],
  plot_bgcolor: '#eeeeee',
  paper_bgcolor: '#eeeeee',
};
Plotly.newPlot('myDiv', data, layout);

function refreshView() {
  var viewSettings = document.getElementById('ViewSettings');
  var newStart = parseInt(viewSettings.elements[0].value);
  var newZoom = parseInt(viewSettings.elements[1].value);
  if (isNaN(newStart) || isNaN(newZoom) || newStart < 0 || newZoom < 0) {
    alert('Input values need to be positive numbers.');
    return;
  }
  var update = {
    'yaxis.range': [newStart + newZoom, newStart],
  };
  Plotly.relayout('myDiv', update);
}
