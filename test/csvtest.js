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
      for (var k = 0; k < toBeParsed.length; k++) {
        var output = csv.parseString(toBeParsed[k]);
        var msg = 'Testname(' + myObj.testname + ') ' +
              ' Instance(' + JSON.stringify(toBeParsed[k]) + ') ' +
              ' Real_Output( ' + JSON.stringify(output) + ') ' +
              ' Expected( ' + JSON.stringify(expected[k]) + ') ';
        expect(output).to.eql(expected[k], msg);
      }
    }
  });
     
  it('should parse \\n at the end correctly', function() {
    
    var toBeParsed = [
      'yoga,\ntramendous,',
      'yoga,\ntramendous,\n', 
      'yoga,\ntramendous,"\n',
      'yoga,\ntramendous,"yoga\n',
      'yoga,\ntramendous,"\n"',
      'yoga,\ntramendous,"\n"\n'
    ];
    var expected = [
      [ [ 'yoga', '' ], [ 'tramendous', '' ] ],
      [ [ 'yoga', '' ], [ 'tramendous', '' ] ],
      [ [ 'yoga', '' ], [ 'tramendous', '' ] ],
      [ [ 'yoga', '' ], [ 'tramendous', 'yoga' ] ],
      [ [ 'yoga', '' ], [ 'tramendous', '\n' ] ],
      [ [ 'yoga', '' ], [ 'tramendous', '\n' ] ]
    ];
    for (var i = 0; i < toBeParsed.length; i++) {
      expect(csv.parseString(toBeParsed[i])).to.deep.equal(
        expected[i]);
    }
  });
     
  it('should parse \\n and , as terminators', function() {
    var toBeParsed = [
      '\n\n\n\n\n\n\n',
      ',,\n,,',
    ];
    var expected = [
      [ [ '' ], [ '' ], [ '' ], [ '' ], [ '' ], [ '' ], [ '' ] ],
      [ [ '', '', '' ], [ '', '', '' ] ],
     ];
    for (var i = 0; i < toBeParsed.length; i++) {
      expect(csv.parseString(toBeParsed[i])).to.deep.equal(
        expected[i]);
    }
  });

  it('should parse # as comment line', function() {
    var toBeParsed = [
      '# This is a comment, you should not see this\n#"This is also a comment',
      'This, is, not, a, comment,\n  # This is not a comment, even though it has #,\n',
    ];
    var expected = [
      [ ],
      [ [ 'This', ' is', ' not', ' a', ' comment','' ],
        [ ' # This is not a comment', 'even though it has #', '' ] ],
    ];
    var argdic = { 'hasComments': true };
    for (var i = 0; i < toBeParsed.length; i++) {
      console.log(csv.parseString(toBeParsed[i]));
      expect(csv.parseString(toBeParsed[i], argdic)).to.deep.equal(
        expected[i]);
    }
  });

  it('should parse " correctly', function() {
       var toBeParsed = [
         'yoga\'s,"yoga""s",""",""",314,""""'
       ];
       var expected = [
         [ [ 'yoga\'s', 'yoga"s', '","', '314', '"' ] ]
       ];
       for (var i = 0; i < toBeParsed.length; i++) {
         expect(csv.parseString(toBeParsed[i])).to.deep.equal(
           expected[i]);
       }
  });

  it('can work with delim param', function() {
    var toBeParsed = [
      '\n\n\n\n\n\n\n',
      '..\n..',
    ];
    var expected = [
      [ [ '' ], [ '' ], [ '' ], [ '' ], [ '' ], [ '' ], [ '' ] ],
      [ [ '', '', '' ], [ '', '', '' ] ],
     ];
    for (var i = 0; i < toBeParsed.length; i++) {
      expect(csv.parseString(toBeParsed[i], { 'delim' : '.' })).to.deep.equal(
        expected[i]);
    }
  });
  
  it('should parse " correctly', function() {
    var toBeParsed = [
      'FirstName,LastName,Title,ReportsTo.Email,Birthdate,Description',
      'Tom,Jones,Senior Director,buyer@salesforcesample.com,1940-06-07Z,"Self-described as ""the top"" branding guru on the West Coast"',
      'Ian,Dury,Chief Imagineer,cto@salesforcesample.com,,"World-renowned expert in fuzzy logic design.\nInfluential in technology purchases."'
       ];
    var expected = [
      [ [ 'FirstName', 'LastName','Title', 'ReportsTo.Email', 'Birthdate', 'Description' ] ],
      [ [ 'Tom',
          'Jones',
          'Senior Director',
          'buyer@salesforcesample.com',
          '1940-06-07Z',
          'Self-described as "the top" branding guru on the West Coast' ] ],
      [ [ 'Ian',
           'Dury',
           'Chief Imagineer',
           'cto@salesforcesample.com',
           '',
          'World-renowned expert in fuzzy logic design.\nInfluential in technology purchases.' ] ],
        ];
    for (var i = 0; i < toBeParsed.length; i++) {
      expect(csv.parseString(toBeParsed[i])).to.deep.equal(
        expected[i]);
    }
  });
});
