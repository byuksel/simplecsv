/**
 * A datastructure for csv data.
 */
// Expose dict
exports = module.exports = csvdata;

function csvdata() {}

csvdata.prototype = {
  column_names: [], // column names
  rows : [], // all the rows, each row is an Array object too
  getColumnNames: function() {
    return this.column_names;
  },
  setColumnNames: function(x) {
    this.column_names = x;
  },
  getRows: function() {
    return this.rows;
  },
  setRows: function(x) {
    this.rows = x;
  }
};
