/**
 * A datastructure for csv data.
 */
// Expose dict
exports = module.exports = csvdata;

function csvdata() {}

csvdata.prototype = {
  columnCount: 0, // number of columns
  rowCount: 0, // number of rows
  errors: [], // errors
  columnNames: [], // column names
  rows : [] // all the rows, each row is an Array object too
};
