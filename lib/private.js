/**
 * @copyright Copyright (c) 2015 All Rights Reserved.
 * @author Baris Yuksel <baris@onehundredyearsofcode.com>
 *
 * @file Module which exports private object with static methods.
 */
exports = module.exports = private;

/**
 * Constructs a new private class.
 * @constructor
 */
function private() {}

/**
 * Double-quotes the fields according the rules on Wikipedia as of 6/2015.
 * ({@link https://en.wikipedia.org/wiki/Comma-separated_values})
 *
 * *  Fields with embedded commas or double-quote characters must be quoted.
 * *  Each of the embedded double-quote characters must be represented by a pair of double-quote characters.
 * *  Fields with embedded line breaks must be quoted.
 * *  (Python addition) Python csv parser double-quotes `\r` always.
 * @param {string} input - Input to double quote if necessary.
 */
private.doubleQuoteIfNecessary = function(input) {
  var shouldDoubleQuote = false;
  var output = '';
  for (var i = 0; i < input.length; i++) {
    if (input[i] === ',' ||   // comma
        input[i] === '"' ||   // double-quote
        input[i] === '\n' ||  // newline
        input[i] === '\r') {
      shouldDoubleQuote = true;
    }
    output += input[i];
    if (input[i] === '"') output += '"';  // double-quote double-quote
  }
  if (shouldDoubleQuote) {
    output = '"' + output + '"';
  }
  return output;
};

/**
 * Get the argument from the argument dictionary, with a default value.
 * Default value (defval) is returned if the argument is not in the argument:value
 * dictionary, or, if the argument's type is not the same as default value.
 * @param {dictionary} argDic A dictionary of the type argName: value
 * @param {string} argName The name of the argument to be found in dictionary
 * @param {*} defVal If it cannot find this argName in argDic, it returns defVal.
 */
private.getArg = function(argDic, argName, defVal) {
  return (typeof argDic !== 'undefined' &&
          typeof argDic[argName] !== 'undefined' &&
          typeof argDic[argName] === typeof defVal) ? argDic[argName] : defVal;
};

/**
 * Given a csv string, it parses it into double array.
 * Delimiter can be changed with argdic's delim parameter.
 *
 * Follows the csv format described in {@link http://tools.ietf.org/html/rfc4180}
 * as in: *"Fields containing line breaks (CRLF), double quotes, and commas
 * should be enclosed in double-quotes."*
 * @param {dictionary} argdic - A dictionary of possible parameters.
 * @param {string} str - csv string to be parsed.
 * Recognized values are:
 * * `hasHeaders`: boolean - Whether str has header column. *[default: false]*
 * * `delim`: char - Single delimiter char *[default: ',']*
 * * `hasComments`: boolean - Whether str has comments. If true, any row which
 *    starts with `#` will be skipped. *[default: false]*
 */
private.parseStringToArray = function(str, argdic) {

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
