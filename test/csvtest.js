/*jshint expr: true*/
var simplecsv = require('../simplecsv'),
    csvdata = simplecsv.csvdata,
    csv = simplecsv.csv,
    inputtestJSON = require('./testcases_as_csv.json'),
    parsedtestJSON = require('./parsed_testcases_as_arrays.json');

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var csv = new csv();
describe('fish.csv browserified tests', function() {

  it('Should pass test.csv', function() {
    // Read the expected values from parsedtestJSON
    var expectedResults = {};
    var parsedcases = parsedtestJSON.parsedcases;
    for (var j = 0; j < parsedcases.length; j++) {
      var testObj = parsedcases[j];
      expectedResults[testObj.testname] = testObj.instances;
    }

    var testcases = inputtestJSON.testcases;
    for (var i = 0; i < testcases.length; i++) {
      var myObj = testcases[i];
      var expected = expectedResults[myObj.testname];
      var toBeParsed = myObj.instances;
      var argdic = {};
      if (typeof myObj.hasComments !== 'undefined') {
        argdic.hasComments = myObj.hasComments;
      }
      if (typeof myObj.delim !== 'undefined') {
        argdic.delim = myObj.delim;
      }
      for (var k = 0; k < toBeParsed.length; k++) {
        var output = csv.parseString(toBeParsed[k], argdic);
        var msg = 'Testname(' + myObj.testname + ') ' +
              ' argdic(' + JSON.stringify(argdic) + ') ' +
              ' index(' + k + ') ' +
              ' Instance(' + JSON.stringify(toBeParsed[k]) + ') ' +
              ' Real_Output( ' + JSON.stringify(output) + ') ' +
              ' Expected( ' + JSON.stringify(expected[k]) + ') ';
        expect(output).to.eql(expected[k], msg);
      }
    }
  });
});
