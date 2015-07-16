/**
 * @copyright Copyright (c) 2015 All Rights Reserved.
 * @author Baris Yuksel <baris@onehundredyearsofcode.com>
 *
 * Fast and compact CSV parser for parsing CSV with CSV to JSON support.
 *
 * @module
 */
exports = module.exports = {
  /** A class for keeping csv data after it is parsed.
   * @function
   */
  csvdata : require ('./lib/csvdata.js'),
  /** The csv parser class.
   * @function
   */
  csv : require('./lib/csv.js')
};
