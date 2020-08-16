//GENERATE FAKE LOG
var syntheticLog = (function () {
  var depth = [];
  var density = [];
  var gammaRay = [];
  for (var i = 0; i < 2500; i++) {
    depth.push(i);
    density.push(Math.random() / 2 + 2.4);
    gammaRay.push(Math.random() * 100);
  }
  return {
    Log: function () {
      return {
        depth: depth,
        density: density,
        gammaRay: gammaRay,
      };
    },
  };
})();

//PLOTLY GENERATION
var logPlot = document.getElementById('myDiv'),
  //set up tracks
  trace1 = {
    x: syntheticLog.Log().density,
    y: syntheticLog.Log().depth,
    xaxis: 'x2',
    type: 'line',
  };

trace2 = {
  x: syntheticLog.Log().gammaRay,
  y: syntheticLog.Log().depth,
  type: 'line',
};
data = [trace1, trace2];

//track layout
layout = {
  grid: {
    rows: 1,
    columns: data.length,
  },
  width: data.length * 250,
  dragmode: 'pan',
  showlegend: false,
  yaxis: {
    domain: [0, 0.9],
    range: [50, 0],
    title: {
      text: 'Depth',
    },
  },
  xaxis: {
    side: 'top',
    domain: [0, 0.33],
    range: [0, 150],
    fixedrange: true,
    title: {
      text: 'GR',
    },
  },
  xaxis2: {
    side: 'top',
    range: [0.6, -0.15],
    domain: [0.66, 1],
    fixedrange: true,
    title: {
      text: 'Density',
      standoff: 0,
    },
  },
  xaxis4: {
    side: 'top',
    type: 'log',
    autorange: true, //can't define range for log scales??
    domain: [0.33, 0.66],
    fixedrange: true,
    title: {
      text: 'Reistivity',
      standoff: 0,
    },
  },
  xaxis3: {
    side: 'top',
    range: [0.7, 0.3],
    domain: [0.66, 1],
    automargin: true,
    titlefont: { color: '#d62728' },
    tickfont: { color: '#d62728' },
    anchor: 'free',
    fixedrange: true,
    title: {
      text: 'Neutron',
      standoff: 0,
    },
    overlaying: 'x2',
    position: 1,
  },
  margin: {
    l: 70,
    r: 30,
    t: 30,
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
  hovermode: 'y',
};

Plotly.newPlot('myDiv', data, layout, {
  displayModeBar: false,
  responsive: true,
});

logPlot.on('plotly_click', function (data) {
  for (var i = 0; i < data.points.length; i++) {
    var top_name = window.prompt('Please enter top name.');
    shapes = self.layout.shapes || [];
    annotations = self.layout.annotations || [];
    shapes.push({
      type: 'line',
      xref: 'paper',
      yref: 'y',
      x0: 0,
      y0: data.points[i].y,
      x1: 1,
      y1: data.points[i].y,
      line: {
        color: 'rgb(50,171,96)',
        width: 3,
      },
    });
    annotations.push({
      xref: 'paper',
      yref: 'y',
      x: 0.1,
      xanchor: 'right',
      y: data.points[i].y-1.5,
      //yanchor: 'bottom',
      text: top_name,
      showarrow: false,
    });
    Plotly.relayout('myDiv', { annotations: annotations, shapes: shapes });
  }
});

//UI CONTROLLER
var UIController = (function () {
  //Adjust log width based on number of tracks
  document.getElementById('myDiv').style.width = logPlot.data.length * 250;

  function refreshView() {
    var viewSettings = document.getElementById('ViewSettings');
    var newStart = parseInt(viewSettings.elements[1].value);
    var newZoom = parseInt(viewSettings.elements[2].value);
    if (isNaN(newStart) || isNaN(newZoom) || newStart < 0 || newZoom < 0) {
      alert('Input values need to be positive numbers.');
      return;
    }
    var update = {
      'yaxis.range': [newStart + newZoom, newStart],
    };
    Plotly.relayout('myDiv', update);
  }

  return {
    refreshView,
  };
})();

//LOAD LAS
document.querySelector('#file-input').addEventListener('change', function () {
  //files that user has chosen
  var all_files = this.files;
  if (all_files.length == 0) {
    alert('Error: no file selected');
    return;
  }

  //get first file
  var file = all_files[0];

  //verify user selected a LAS file
  if (file.name.slice(-4) !== '.LAS') {
    alert('Please select an LAS file.');
    return;
  }

  //open file
  var reader = new FileReader();

  reader.addEventListener('load', function (e) {
    var text = e.target.result;
    var jsonLog = las2json(text);

    //download
    var dl_json = (function () {
      var element = document.createElement('a');

      //DOWNLOAD LAS
      //element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
      //element.setAttribute('download', "log.las")

      //DOWNLOAD JSON
      //element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonLog)))
      //element.setAttribute('download', "log.json")

      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    })();

    var newStart = Math.min(...jsonLog.CURVES['DEPTH']);
    document.getElementById('startDepth').value = newStart;
    console.log(jsonLog);

    var densityPhi = {
      x: jsonLog.CURVES['PHID'],
      y: jsonLog.CURVES['DEPTH'],
      xaxis: 'x2',
      type: 'line',
    };
    var neutronPhi = {
      x: jsonLog.CURVES['PHIN'],
      y: jsonLog.CURVES['DEPTH'],
      xaxis: 'x3',
      line: {
        color: '#d62728',
      },
      type: 'line',
    };
    var resistivity = {
      x: jsonLog.CURVES['RESD'],
      y: jsonLog.CURVES['DEPTH'],
      xaxis: 'x4',
      line: {
        color: '#000001',
      },
      type: 'line',
    };

    var gammaRay = {
      x: jsonLog.CURVES['GR'],
      y: jsonLog.CURVES['DEPTH'],
      type: 'line',
    };
    var data = [gammaRay, neutronPhi, densityPhi, resistivity];
    Plotly.newPlot('myDiv', data, logPlot.layout, {
      displayModeBar: false,
      responsive: true,
    });
    UIController.refreshView();
  });

  reader.readAsText(file);
});

////  Function that takes a single LAS text file representing a single well and returns an object variable in JSON format for that well.
function las2json(onelas) {
  //// var lasjson establishes a blank json for holding las 2.0 data. It will look like the example below:
  var lasjson = {
    'VERSION INFORMATION': {
      VERS: {
        MNEM: '',
        UNIT: '',
        DATA: '',
        'DESCRIPTION OF MNEMONIC 1': '',
        'DESCRIPTION OF MNEMONIC 2': '',
      },
      WRAP: {
        MNEM: '',
        UNIT: '',
        DATA: '',
        'DESCRIPTION OF MNEMONIC 1': '',
        'DESCRIPTION OF MNEMONIC 2': '',
      },
    },
    'WELL INFORMATION BLOCK': {
      GENERATED: '',
      MNEM_0: {
        MNEM: '',
        UNIT: '',
        DATA: '',
        'DESCRIPTION OF MNEMONIC 1': '',
        'DESCRIPTION OF MNEMONIC 2': '',
      },
      MNEM_1: {
        MNEM: '',
        UNIT: '',
        DATA: '',
        'DESCRIPTION OF MNEMONIC 1': '',
        'DESCRIPTION OF MNEMONIC 2': '',
      },
      MNEM_2: {
        MNEM: '',
        UNIT: '',
        DATA: '',
        'DESCRIPTION OF MNEMONIC 1': '',
        'DESCRIPTION OF MNEMONIC 2': '',
      },
    },
    'CURVE INFORMATION BLOCK': {
      MNEM_0: {
        MNEM: '',
        UNIT: '',
        'ERCB CURVE CODE': '',
        'CURVE DESCRIPTION 1': '',
        'CURVE DESCRIPTION 2': '',
      },
      MNEM_0: {
        MNEM: '',
        UNIT: '',
        'ERCB CURVE CODE': '',
        'CURVE DESCRIPTION 1': '',
        'CURVE DESCRIPTION 2': '',
      },
    },
    'PARAMETER INFORMATION': {
      MNEM_0: {
        MNEM: '',
        UNIT: '',
        DATA: '',
        'DESCRIPTION OF MNEMONIC 1': '',
        'DESCRIPTION OF MNEMONIC 2': '',
      },
      MNEM_1: {
        MNEM: '',
        UNIT: '',
        DATA: '',
        'DESCRIPTION OF MNEMONIC 1': '',
        'DESCRIPTION OF MNEMONIC 2': '',
      },
    },
    CURVES: {
      Curve_NAME_ONE: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      Curve_NAME_ONE: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
  };
  //// Some objects in the json were partially populated in the example above to make understanding the format easier.
  //// We'll empty them as a first step
  lasjson['VERSION INFORMATION'] = {};
  lasjson['WELL INFORMATION BLOCK'] = {};
  lasjson['CURVE INFORMATION BLOCK'] = {};
  lasjson['PARAMETER INFORMATION'] = {};
  lasjson['CURVES'] = {};
  //// Within the "blocks" ["CURVE INFORMATION BLOCK","PARAMETER INFORMATION", etc.] there are other objects with repeating keys.
  //// The variables below will be the building blocks for each of those objects {}. They are initially populated with empty strings as the values.
  var ver_info_obj = {
    MNEM: '',
    UNIT: '',
    DATA: '',
    'DESCRIPTION OF MNEMONIC 1': '',
    'DESCRIPTION OF MNEMONIC 2': '',
  };
  var well_info_obj = {
    MNEM: '',
    UNIT: '',
    DATA: '',
    'DESCRIPTION OF MNEMONIC 1': '',
    'DESCRIPTION OF MNEMONIC 2': '',
  };
  var curve_info_obj = {
    MNEM: '',
    UNIT: '',
    'ERCB CURVE CODE': '',
    'CURVE DESCRIPTION 1': '',
    'CURVE DESCRIPTION 2': '',
  };
  var param_info_obj = {
    MNEM: '',
    UNIT: '',
    DATA: '',
    'DESCRIPTION OF MNEMONIC 1': '',
    'DESCRIPTION OF MNEMONIC 2': '',
  };
  //// The las file is read as a txt file. It will first be split into seperate strings based on "~" character which occurs at the top of each "block"
  //console.log('onelas = ', onelas);
  var split1 = onelas.split('~');
  //console.log('split1 = ', split1);
  //console.log(split1.length);
  var vers_str = '';
  var well_info_str = '';
  var curve_info_str = '';
  var param_info_str = '';
  var other = '';
  var curve_str = '';

  //// As the 'OTHER' block may or may not be present, we have to split by '~' and then look for a substring to make sure we have the right block before we put each into a variable.
  for (i = 0; i < split1.length; i++) {
    if (split1[i].includes('VERSION')) {
      var vers_str = split1[i];
    } else if (split1[i].includes('WELL INFORMATION')) {
      well_info_str = split1[i];
    } else if (split1[i].includes('CURVE INFORMATION')) {
      curve_info_str = split1[i];
    } else if (split1[i].includes('PARAMETER')) {
      param_info_str = split1[i];
    } else if (split1[i].includes('OTHER')) {
      other = split1[i];
    } else if (split1[i].includes('A  DEPTH')) {
      curve_str = split1[i];
    } else {
      console.log(
        "there is a problem, in wellio.js the las2json() function has to many item in the string array created by splitting on '~'. "
      );
    }
  }

  //// Working with version block first by splitting it by newline and places each item into an array
  //// and taking items of array 1 and 2 for vers and wrap
  var vers_line = vers_str.split('\n')[1];
  var wrap_line = vers_str.split('\n')[2];
  //// As version information, well information, and parameter information blocks contain objects with the same keys, we can process them using a loop.
  //// function to process objects for ver_info_obj, well_inf_obj, and param_info_obj
  //// The splitLineofType1() function takes as argument the prototypical object building block and the array of strings for that block
  function splitLineofType1(ver_info_obj, arrayString) {
    //// splits string (should be a single line from the LAS text) by ":", takes the first item of the resulting array, and then replaces any " " with "".
    var vers_line_1half = arrayString.split(':')[0].replace(' ', '');
    //// splits the previous string variable by "." into an array of strings.
    var vers_line_1half_array = vers_line_1half.split('.');
    //// trimming this so I get "UWI" instead of "UWI    "
    ver_info_obj['MNEM'] = vers_line_1half_array[0].trim();
    var unit_and_data = vers_line_1half_array.slice(
      1,
      vers_line_1half_array.length
    );
    var unit_and_data_str = '                        ';
    if (unit_and_data.length > 1) {
      unit_and_data_str =
        unit_and_data[0].toString() + '.' + unit_and_data[1].toString();
    } else {
      unit_and_data_str = unit_and_data.toString();
    }
    var unit = unit_and_data_str[(0, 5)].trim();
    var data = unit_and_data_str.substring(5, unit_and_data_str.length).trim();
    ver_info_obj['DATA'] = data;
    ver_info_obj['UNIT'] = unit;
    ////
    if (arrayString.split(':')[1].indexOf('-') !== -1) {
      ver_info_obj['DESCRIPTION OF MNEMONIC 1'] = arrayString
        .split(':')[1]
        .split('-')[0]
        .trim();
      ver_info_obj['DESCRIPTION OF MNEMONIC 2'] = arrayString
        .split(':')[1]
        .split('-')[1]
        .replace('\r', '')
        .trim();
    } else {
      ver_info_obj['DESCRIPTION OF MNEMONIC 1'] = arrayString
        .split(':')[1]
        .replace('\r', '')
        .trim();
      ver_info_obj['DESCRIPTION OF MNEMONIC 2'] = '';
    }
    return ver_info_obj;
  }
  lasjson['VERSION INFORMATION']['WRAP'] = splitLineofType1(
    Object.assign({}, ver_info_obj),
    wrap_line
  );
  lasjson['VERSION INFORMATION']['VERS'] = splitLineofType1(
    Object.assign({}, ver_info_obj),
    vers_line
  );
  //// Working with PARAMETER INFORMATION block second by splitting it by newline into an array and taking items after 0,1,2 or [3:]
  //// This basically just skips some lines with titles and such
  var param_line_array = param_info_str.split('\n').slice(3);
  for (i = 0; i < param_line_array.length; i++) {
    //// create one object for parameter line
    if (param_line_array[i] != '') {
      var param_obj_inst = splitLineofType1(
        Object.assign({}, param_info_obj),
        param_line_array[i]
      );
      lasjson['PARAMETER INFORMATION'][param_obj_inst['MNEM']] = param_obj_inst;
    }
  }
  //// Working with CURVE INFORMATION BLOCK second by splitting it by newline into an array and taking items after 0,1,2 or [3:]
  var curve_line_array = curve_info_str.split('\n').slice(3);
  for (i = 0; i < curve_line_array.length; i++) {
    //// create one object for parameter line
    if (curve_line_array[i] != '') {
      var curve_obj_inst = splitLineofType1(
        Object.assign({}, curve_info_obj),
        curve_line_array[i]
      );
      lasjson['CURVE INFORMATION BLOCK'][
        curve_obj_inst['MNEM']
      ] = curve_obj_inst;
    }
  }
  //// Working with WELL INFORMATION BLOCK second by splitting it by newline into an array and taking items after 0,1,2 or [3:]
  var well_line_array = well_info_str.split('\n').slice(3);
  for (i = 0; i < well_line_array.length; i++) {
    if (well_line_array[i].includes('Generated')) {
      lasjson['WELL INFORMATION BLOCK']['GENERATED'] = well_line_array[i]
        .replace('\r', '')
        .replace('\t', ' ')
        .replace('#', '');
    }
    //// create one object for parameter line
    else if (well_line_array[i] != '') {
      var well_obj_inst = splitLineofType1(
        Object.assign({}, well_info_obj),
        well_line_array[i]
      );
      lasjson['WELL INFORMATION BLOCK'][well_obj_inst['MNEM']] = well_obj_inst;
    } else {
      console.log(' got else ');
    }
  }
  //// Working with CURVES second by splitting it by newline into an array,
  //// then using the first line item of that array to find the curve names
  //// using those curves names to establish object keys and then interating through the other array items
  //// and populating arrays for each key
  var curve_str_array = curve_str.split('\n');
  var curve_names_array = [];
  var curve_names_array_holder = [];
  if (curve_str_array[0][0] === 'A') {
    curve_names_array = curve_str_array[0].split(' ');
    var last_curv_name_position = curve_names_array.length - 1;
    curve_names_array[last_curv_name_position] = curve_names_array[
      last_curv_name_position
    ].replace('\r', '');
    //console.log('0 curve_names_array = ', curve_names_array);
    curve_names_array = curve_names_array.slice(1, curve_names_array.length);
    for (i = 0; i < curve_names_array.length; i++) {
      if (curve_names_array[i] !== '') {
        //onsole.log('0.5 curve_names_array[i] = ', curve_names_array[i]);
        curve_names_array_holder.push(curve_names_array[i]);
        lasjson['CURVES'][curve_names_array[i]] = [];
      }
    }
  } else {
    console.log(
      "Couldn't find curve names above curves in LAS, check formatting!"
    );
  }
  //// start at position 1 instead of 0 is to avoid the curve names
  for (j = 1; j < curve_str_array.length; j++) {
    var curve_data_line_array = curve_str_array[j].split(' ');
    var counter_of_curve_names = 0;
    //console.log(
    //  'curve_data_line_array.length = ',
    // curve_data_line_array.length
    //);
    //console.log('curve_data_line_array = ', curve_data_line_array);
    var last_curv_data_line_position = curve_data_line_array.length - 1;
    //console.log(
    //  'curve_data_line_array[last_curv_data_line_position] = ',
    // curve_data_line_array[last_curv_data_line_position]
    //);
    curve_data_line_array[last_curv_data_line_position] = curve_data_line_array[
      last_curv_data_line_position
    ].replace('\r', '');
    //console.log(
    //  'curve_data_line_array[last_curv_data_line_position] = ',
    // curve_data_line_array[last_curv_data_line_position]
    //);
    for (k = 0; k < curve_data_line_array.length; k++) {
      if (curve_data_line_array[k] !== '') {
        lasjson['CURVES'][
          curve_names_array_holder[counter_of_curve_names]
        ].push(curve_data_line_array[k]);
        counter_of_curve_names += 1;
      }
    }
  }
  //console.log(' test: lasjson', lasjson);
  return lasjson;
}
