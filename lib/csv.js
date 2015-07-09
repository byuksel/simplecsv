// Copyright (c) 2015 All Rights Reserved.
// Author: Baris Yuksel <baris@onehundredyearsofcode.com>
//
//  Simple CSV library
//
exports = module.exports = csv;
var csvdata = require('./csvdata.js'),
    private = require ('./private.js');

var private = new private();

function csv() {}

// Convert CSV string to JSON.
// Ex. CSVToJSON("magician, born\r\nhoudini, 1874\ncopperfield, 1956\r\n",
//               {hasHeaders: true});
// outputs:
//   [ { "magician":"houdini",
//       "born": 1874 },
//     { "magician":"copperfield",
//       "born":1956 } ]
csv.prototype.CSVToJSON = function(input, argdic) {
  return  this.csvdataToJSON(this.parseString(input, argdic));
};

// Convert JSON to CSV string.
// Ex. JSONToCSV( [ { "magician":"houdini", "born": 1874 },
//                  { "magician":"copperfield", "born":1956 } ]);
// outputs:
// "magician, born\r\nhoudini, 1874\ncopperfield, 1956\r\n",
csv.prototype.JSONToCSV = function(input) {
  return this.csvdataToString(this.JSONToCsvdata(input));
};

// Produces simple string output of csvdata.
// Ex. Given csvdata of:
// { column_names: { "magician", "born"},
//   rows: { { "houdini", 1874 },
//           { "copperfield", 1956} }
// }
// csvdataToString() will produce
// "magician, born\r\nhoudini, 1874\ncopperfield, 1956\r\n"
csv.prototype.csvdataToString = function(input, argdic) {
  var delim = private.getArg(argdic, 'delim', ',');
  var str = '';
  var columnnames = input.columnNames;
  if (typeof columnnames !== 'undefined') {
    for (var i = 0; i < columnnames.length; i++) {
      str += private.doubleQuoteIfNecessary(columnnames[i]) + delim;
    }
    if (str.length > 0) {
      str = str.slice(0, - 1) + '\r\n';
    }
  }

  var rows = input.rows;
  if (typeof rows === 'undefined') return str;

  for (var k = 0; k < rows.length; k++) {
    var temp = '';
    for (var m = 0; m < rows[k].length; m++) {
      temp += private.doubleQuoteIfNecessary(rows[k][m]) + delim;
    }
    if (temp.length > 0) {
      temp = temp.slice(0, - 1);
    }
    str += temp + '\r\n';
  }
  return str;
};


// Produces the JSON of the csvdata.
// Uses JSON table schema: http://dataprotocols.org/json-table-schema/
// Ex. Given csvdata of:
// { column_names: { "magician", "born"},
//   rows: { { "houdini", 1874 },
//           { "copperfield", 1956} }
// }
//
// csvdataToJSON() will produce:
//   [ { "magician":"houdini",
//       "born": 1874 },
//     { "magician":"copperfield",
//       "born":1956 } ]
csv.prototype.csvdataToJSON = function(input) {
  var columnnames = input.columnNames;

  // No columnnames, let's fill it up with generated names
  if ((typeof columnnames === 'undefined' || columnnames.length === 0) &&
      input.columnCount !== 0) {
    var digitCount = input.columnCount.toString().length;
    columnnames = [];  // Don't modify input's columnnames, assign a new array

    for (var m = 0; m < input.columnCount; m++) {
      var neededZeroCount = digitCount - m.toString().length;
      var fullname = 'Col ' + Array(neededZeroCount + 1).join('0') + m.toString();
      columnnames.push(fullname);
    }
  }

  var rows = input.rows;
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
  var retVal = new csvdata();

  if (typeof obj.columnCount !== 'undefined') {
    retVal.columnCount = obj.columnCount;
  }
  if (typeof obj.columnNames !== 'undefined') {
    retVal.columnNames = obj.columnNames.slice();
  }
  if (typeof obj.rows !== 'undefined') {
    retVal.rows = [];
    for (var i = 0; i < obj.rows.length; i++) {
      retVal.rows.push(obj.rows[i].slice());
    }
  }
  if (typeof obj.columnCount !== 'undefined') {
    retVal.rowCount = obj.rowCount;
  }
  return retVal;
};

// Find errors
csv.prototype.findErrors= function(input) {
  // Check length of rows
  var errors = [];
  var rows = input.rows;
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
  if (input.columnCount !== columncount) {
    errors.push('Column count is ' + input.columnCount +
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
