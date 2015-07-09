require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  return this.csvdataToJSON(this.parseString(input, argdic));
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

},{"./csvdata.js":2,"./private.js":3}],2:[function(require,module,exports){
// Copyright (c) 2015 All Rights Reserved.
// Baris Yuksel <baris@onehundredyearsofcode.com>
//
// A datastructure for csv data.
//
exports = module.exports = csvdata;

function csvdata() {
  this.columnCount = 0; // number of columns
  this.rowCount = 0; // number of rows
  this.errors = []; // errors
  this.columnNames = []; // column names
  this.rows = []; // all the rows, each row is an Array object too
}

},{}],3:[function(require,module,exports){
// Copyright (c) 2015 All Rights Reserved.
// Baris Yuksel <baris@onehundredyearsofcode.com>
exports = module.exports = private;

function private() {}

// Double-quotes the fields according the rules on Wikipedia as of 6/2015.
// (https://en.wikipedia.org/wiki/Comma-separated_values)
//
// * Fields with embedded commas or double-quote characters must be quoted.
// * Each of the embedded double-quote characters must be represented by a pair of double-quote characters.
// * Fields with embedded line breaks must be quoted.
// * (Python addition) Python quotes \r always.
private.prototype.doubleQuoteIfNecessary = function(input) {
  var shouldDoubleQuote = false;
  for (var i = 0; i < input.length; i++) {
    if (input[i] === ',' ||   // comma
        input[i] === '"' ||   // double-quote
        input[i] === '\n' ||  // newline
        input[i] === '\r') {
      shouldDoubleQuote = true;
      break;   // optimize the cats!
    }
  }
  var output = '';
  for (var j = 0; j < input.length; j++) {
    output += input[j];
    if (input[j] === '"') output += '"';
  }
  if (shouldDoubleQuote) {
    output = '"' + output + '"';
  }
  return output;
};


// Get the argument from the argument dictionary, with a default value.
// Default value (defval) is returned if the argument is not in the argument:value
// dictionary, or, if the argument's type is not the same as default value.
private.prototype.getArg = function(argDic, argName, defVal) {
  return (typeof argDic !== 'undefined' &&
          typeof argDic[argName] !== 'undefined' &&
          typeof argDic[argName] === typeof defVal) ? argDic[argName] : defVal;
};

// Given a str, it parses it into array.
// Seperator is always ,
// Follows http://tools.ietf.org/html/rfc4180
// as in: "Fields containing line breaks (CRLF), double quotes, and commas
// should be enclosed in double-quotes."
// params is a dictionary of possible parameters. The tuples in the dictionary
// should be string pairs.
// hasHeaders: true/false
//             if true,
// delim: one char [default:',']
// hasComments: true/false [default:false]
//              if true, any row which starts with '#' will be skipped.
private.prototype.parseStringToArray = function(str, argdic) {

  var delim = this.getArg(argdic, 'delim', ',');
  var hasComments = this.getArg(argdic, 'hasComments', false);

  // Define a function that returns true if the char is a terminator
  // Terminator chars are: delim char, \n
  function isTerminator(myChar) {
    if ( '\n' === myChar ||
        delim === myChar) {
      return true;
    }
    return false;
  }

  var noCharSinceRowPush = true;
  var allRows = [];
  var currentRow = [];
  var currentCell = '';
  var j = 0;
  while (j < str.length) {
    if (hasComments && noCharSinceRowPush && str[j] === '#') {
      // The first char of the row is comment char
      while (j < str.length && str[j] !== '\n') {
        j++;
      }
    } else {
      // Special situation: skip \r, if it is part of \r\n
      if (str[j] === '\r' &&
          j + 1 < str.length &&
          str[j+1] === '\n' ) {
            j++;
          }
      // Look at double-quotes
      if (str[j] === '"') {
        noCharSinceRowPush = false;
        // This is a double-quoted cell, let's retrieve the whole cell.
        var quoteCount = 0;
        var endOfWord = j + 1;
        while (endOfWord < str.length) {
          if (str[endOfWord] === '"') {
            // Found quote. Are we at the end of a cell?
            if ((endOfWord + 1) === str.length ||
                (isTerminator(str[endOfWord + 1]) && (quoteCount % 2) === 0))  {
              // Yes, this is the end of the cell.
              break;
            } else {
              // No, this is just another quote.
              quoteCount++;
            }
          } else if ((endOfWord + 1) === str.length) {
            // This should never happen, it means the cell was not quoted correctly.
            // But still, let's save the situation by moving endOfWord by one so that
            // we include the last character in the cell's value.
            endOfWord++;
            break;
          }
          endOfWord++;
        }

        currentCell = str.substring(j + 1, endOfWord);
        currentCell = currentCell.replace(/""/g, '"');
        j = endOfWord ;
      } else if (isTerminator(str[j])) {
        if (str[j] !== '\n') {
          // Special case for empty rows which start with \n
          // essentially, if the terminator is not \n, then
          // we assume we had chars since row push.
          noCharSinceRowPush = false;
        }
        currentRow.push(currentCell);
        currentCell = '';
        if (str[j] === '\n') {
          // Special case for empty rows which start with \n.
          // Python csv parser parses them as empty rows instead of
          // rows having one empty string.
          if (noCharSinceRowPush) {
            currentRow = [];
          }
          // End of row
          allRows.push(currentRow);
          currentRow = [];
          noCharSinceRowPush = true;
        }
      } else {
        noCharSinceRowPush = false;
        currentCell += str[j];
      }
    }
    j++;
  }
  if (!noCharSinceRowPush) {
    // If we have seen some chars after last row push
    // Then, push this cell again
    currentRow.push(currentCell);
    allRows.push(currentRow);
  }
  return allRows;
};

},{}],"simplecsv":[function(require,module,exports){
/**
 * Export all sub-modules
 *
 */
exports = module.exports = {
  csvdata : require ('./lib/csvdata.js'),
  csv : require('./lib/csv.js')
};

},{"./lib/csv.js":1,"./lib/csvdata.js":2}]},{},["simplecsv"]);
