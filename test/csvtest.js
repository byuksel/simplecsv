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
describe('SimpleCsv.js Unit Test', function() {

  it('(csvdataToJSON and JSONToCsvdata) should return a true representation of csv in JSON', function(){
    var test  = csv.makeCsvdataFromObj({ columnNames : [ '1', '2' ],
                                         rows : [ [ '4', 0 ], [ '5', 0 ] ],
                                         rowCount : 2 ,
                                         columnCount: 2 });
    var actualOutput = csv.csvdataToJSON(test);
    var expectedOutput = '[{"1":"4","2":0},{"1":"5","2":0}]';
    expect(actualOutput).eql(expectedOutput);
    var actualConvertedCsvdata = csv.JSONToCsvdata(actualOutput);
    expect(actualConvertedCsvdata).eql(test);
  });

  it('(findErrors) should find errors', function() {
    var test  = csv.makeCsvdataFromObj({ columnNames : [ '1', '2' ],
                                         rows : [ [ 3, '4' ], [ '5' ] ],
                                         rowCount : 10 ,
                                         columnCount: 22 });
    var actualOutput = csv.findErrors(test);
    var expectedOutput = [
      "Type mismatch at row:1 col:0 expected:number actual:string",
      "Column count is 22 but Row 0 has 2 cols",
      "Row 1 has 1 cols, Row 0 has 2"];
    expect(actualOutput).eql(expectedOutput);
  });

  it('(getArg) should work', function() {
    var argdic = { hasHeaders: true , movement: 'yes' };
    expect(csv.getArg(argdic, 'hasHeaders', false)).to.be.true;
    expect(csv.getArg(argdic, 'myflag', false)).to.be.false;
    expect(csv.getArg(argdic, 'movement', 'no')).equal('yes');
    expect(csv.getArg(argdic, 'movement', 1)).equal(1);
  });

  it('(parseString) should handle hasHeaders correctly', sinon.test(function() {
    // Create a stub for csv.parseStringToArray
    var mystub = this.stub(csv, 'parseStringToArray').returns([['1', '2'], ['3', '4']]);
    var argdic = { hasHeaders: true };
    var realOutput = csv.parseString('', argdic);
    var expectedOutput = csv.makeCsvdataFromObj({ columnNames : [ '1', '2' ],
                                                  rows : [ [ '3', '4' ] ],
                                                  rowCount : 1 ,
                                                  columnCount: 2 });
    expect(realOutput).to.eql(expectedOutput);

    mystub.returns([['1', '2'], ['3', '4']]);
    argdic = { hasHeaders: false };
    realOutput = csv.parseString('', argdic);
    expectedOutput = csv.makeCsvdataFromObj({ rows : [ [ '1', '2' ], [ '3', '4' ] ],
                                              rowCount : 2 ,
                                              columnCount: 2 });
    expect(realOutput).to.eql(expectedOutput);
   }));

  it('(parseStringToArray) should parse csv cases in testcases_as_csv.json', function() {
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
        var output = csv.parseStringToArray(toBeParsed[k], argdic);
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
