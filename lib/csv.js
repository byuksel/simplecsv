/**
 * CSV library for csv manipulations.
 */
// Expose dict
exports = module.exports = csv;
var csvdata = require('./csvdata.js');

var testExports = {};  // Used for exporting un-exported functions while testing

if ((typeof process.env.NODE_TEST !== 'undefined' &&
     process.env.NODE_TEST === 'test')  ||  // True for mochaTest
    (typeof window !== 'undefined' &&
     typeof window.mochaPhantomJS !== 'undefined')) {  // True for mocha_phantomjs
  testExports = exports;
}

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

// Get the argument from the argument dictionary, with a default value.
// Default value (defval) is returned if the argument is not in the argument:value
// dictionary, or, if the argument's type is not the same as default value.
function getArg(argDic, argName, defVal) {
  return (typeof argDic !== 'undefined' &&
          typeof argDic[argName] !== 'undefined' &&
          typeof argDic[argName] === typeof defVal) ? argDic[argName] : defVal;
}
testExports.prototype.getArg = getArg;

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
function parseStringToArray(str, argdic) {

  var delim = getArg(argdic, 'delim', ',');
  var hasComments = getArg(argdic, 'hasComments', false);

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
}

testExports.prototype.parseStringToArray = parseStringToArray;

// YOGA
csv.prototype.parseString= function(str, argdic) {
  var parsed = this.parseStringToArray(str, argdic);
  var retValue = new csvdata();
  var hasHeaders = this.getArg(argdic, 'hasHeaders', false);

  if (hasHeaders) {
    retValue.columnNames = parsed.shift();
    retValue.columnCount = retValue.columnNames.length;
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
