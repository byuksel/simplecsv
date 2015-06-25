/**
 * CSV library for csv manipulations.
 */
// Expose dict
exports = module.exports = csv;
var csvdata = require('./csvdata.js'),
    private = require ('./private.js');

var private = new private();

function csv() {}

// Produces the JSON of the csvdata.
// Uses JSON table schema: http://dataprotocols.org/json-table-schema/
// Ex. Given csvdata of:
// { column_names: { "magician", "born"},
//   rows: { { "houdini", 1874 },
//           { "copperfield", 1956} }
// }
//
// toJSON() will produce:
//
//   {
//      "magician":"houdini",
//      "born": 1874
//   },
//   {
//       "magician":"copperfield",
//       "born":1956
//   }
csv.prototype.csvdataToJSON = function(csvdata) {
  var jsondata = '';
  var columnnames = csvdata.columnNames;
  var rows = csvdata.rows;
  var output = [];

  for (var i = 0; i < rows.length; i++) {
    var entry = {};
    for (var j = 0; j < rows[i].length; j++) {
      entry[columnnames[j]] = rows[i][j];
    }
    output.push(entry);
  }
  return JSON.stringify(output);
};

// Produces the csvdata of table formatted JSON
// Uses JSON table schema: http://dataprotocols.org/json-table-schema/
// Ex. Given JSON of:
//
//   {
//      "magician":"houdini",
//      "born": 1874
//   },
//   {
//       "magician":"copperfield",
//       "born":1956
//   }
//
//
// { column_names: { "magician", "born"},
//   rows: { { "houdini", 1874 },
//           { "copperfield", 1956} }
// }
//
csv.prototype.JSONToCsvdata = function(jsonStr) {
  var obj = JSON.parse(jsonStr);
  var rows = [];
  for (var i = 0; i < obj.length; i++) {
    var line = [];
    for (var cell in obj[i]) {
      if (obj[i].hasOwnProperty(cell)) {
        line.push(obj[i][cell]);
      }
    }
    rows.push(line);
  }
  var columnnames = [];
  for (var attr in obj[0]) {
    if (obj[0].hasOwnProperty(attr)) {
      columnnames.push(attr);
    }
  }
  var output = { rows: rows,
                 columnNames: columnnames,
                 rowCount: rows.length,
                 columnCount: columnnames.length
               };
  return this.makeCsvdataFromObj(output);
};

csv.prototype.parseString= function(str, argdic) {
  var parsed = private.parseStringToArray(str, argdic);
  var retValue = new csvdata();
  var hasHeaders = private.getArg(argdic, 'hasHeaders', false);

  if (hasHeaders) {
    retValue.columnNames = parsed.shift();
    if (typeof retValue.columnNames !== 'undefined') {
      retValue.columnCount = retValue.columnNames.length;
    }
  }

  retValue.rows = parsed;
  retValue.rowCount = parsed.length;
  if (retValue.columnCount === 0 && retValue.rowCount > 0) {
    retValue.columnCount = retValue.rows[0].length;
  }
  return retValue;
};

// Can take an object and if the object has the same properties
// as csvdata, it creates a csvdata from those properties.
csv.prototype.makeCsvdataFromObj= function(obj) {
  if (typeof obj === 'undefined') return;
  retVal = new csvdata();
  if (typeof obj.columnCount !== 'undefined') {
    retVal.columnCount = obj.columnCount;
  }
  if (typeof obj.columnNames !== 'undefined') {
    retVal.columnNames = obj.columnNames;
  }
  if (typeof obj.rows !== 'undefined') {
    retVal.rows = obj.rows;
  }
  if (typeof obj.columnCount !== 'undefined') {
    retVal.rowCount = obj.rowCount;
  }
  return retVal;
};

// Find errors
csv.prototype.findErrors= function(csvdata) {
  // Check length of rows
  var errors = [];
  var rows = csvdata.rows;
  var columncount = rows[0].length;
  var types = [];
  for (var j = 0; j < rows[0].length; j++) {
    types.push(typeof rows[0][j]);
  }
  for (var r_index = 0; r_index < rows.length; r_index++) {
    for (var c_index = 0; c_index < rows[r_index].length; c_index++) {
      var actualtype =  typeof rows[r_index][c_index];
      if ( actualtype !== types[c_index]) {
        errors.push('Type mismatch at row:' + r_index + ' col:' + c_index +
                      ' expected:' + types[c_index] + ' actual:' +  actualtype);
      }
    }
  }
  if (csvdata.columnCount !== columncount) {
    errors.push('Column count is ' + csvdata.columnCount +
                  ' but Row 0 has ' + columncount + ' cols');
  }
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].length !== columncount) {
      errors.push('Row ' + i + ' has ' + rows[i].length +
                    ' cols, Row 0 has ' + columncount);
    }
  }
  return errors;
};
