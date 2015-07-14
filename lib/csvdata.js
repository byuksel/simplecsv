/**
 * @copyright Copyright (c) 2015 All Rights Reserved.
 * @author Baris Yuksel <baris@onehundredyearsofcode.com>
 *
 * @file A datastructure for csv data.
 */
exports = module.exports = csvdata;

/**
 * Represents csv data with some columns and rows.
 * May have column names.
 * @constructor
 * @struct
 */
function csvdata() {
  this.columnCount = 0; // number of columns
  this.rowCount = 0; // number of rows
  this.errors = []; // errors
  this.columnNames = []; // column names
  this.rows = []; // all the rows, each row is an Array object too
}
