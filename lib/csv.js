/**
 * CSV library for csv manipulations.
 */
// Expose dict
exports = module.exports = csv;

function csv() {}

// Produces the JSON of the csvdata.
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
csv.prototype.toJSON = function(csvdata) {
  var jsondata = '';
  var columnames = csvdata.getColumnNames();
  var rows = csvdata.getRows();
  var output = '';
  for (var i = 0; i < rows.length; i++) {
    output += '{';
    for (var j = 0; j < rows[i].length; j++) {
      output += '\n';
      var entry = columnnames[i] + ':' + rows[i][j];
      output += '  ' + entry + ',';
    }
    if (rows[i].length > 0) {
      // remove the last ","
      output = output.slice(0, -1);
    }
    output += '\n},';
  } 
  if (rows.length > 0) {
    // remove the last ","
    output = output.slice(0, -1);
  }
  return output;
};

// Get the argument from the argument dictionary, with a default value.
// Default value (defval) is returned if the argument is not in the argument:value
// dictionary, or, if the argument's type is not the same as default value.
function getArg(argDic, argName, defVal) {
  return (typeof argDic !== 'undefined' &&
          typeof argDic[argName] !== 'undefined' &&
          typeof argDic[argName] === typeof defVal) ? argDic[argName] : defVal;
}

// Given a str, it parses it into a csvdata.
// Seperator is always ,
// Follows http://tools.ietf.org/html/rfc4180
// as in: "Fields containing line breaks (CRLF), double quotes, and commas
// should be enclosed in double-quotes."
// params is a dictionary of possible parameters. The tuples in the dictionary
// should be string pairs.
// hasHeaders: true/false
// delim: , 
csv.prototype.parseString = function(str, argdic) {
  var hasHeaders = getArg(argdic, 'hasHeaders', true);
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
};
