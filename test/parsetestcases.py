# This file parses testcsv.json in Python and saves its results
# to expectedcsv.json. SimpleCSV.js is tested against Pyton's
# csv parser. It is aimed at producing the same results.
import argparse
import csv
import json
import StringIO

def main():
  parser = argparse.ArgumentParser(
    description='Reads csv test cases from a JSON file, parses them, and'
    ' writes the output to a JSON file. These files are then used by the'
    ' unittests of SimpleCSV.js.')
  parser.add_argument('--infile', '-i',
                      default='testcases_as_csv.json', 
                      help='Input JSON file. default:testcases_as_csv.json')
  parser.add_argument('--outfile', '-o',
                      default='parsed_testcases_as_arrays.json', 
                      help='Output JSON file. default:parsed_testcases_as_arrays.json')
  args = parser.parse_args()
  with open(args.infile, 'r') as infile, open(args.outfile, 'w') as outfile:
    indata = json.load(infile)
    outTestcases = []
    for inTest in indata['testcases']:
      outInstances = []
      outInstancesAsString = []
      # Let's see if we have a delim char set in JSON
      delimChar = ','
      if inTest.has_key('delim'):
        delimChar = str(inTest['delim'])
      # Let's see if we have a hasComments field set in JSON
      hasComments = False
      if inTest.has_key('hasComments'):
        hasComments = inTest['hasComments']
      for inInstance in inTest['instances']:
        # Parse each instance into rows
        # and stuff them into an array
        csvAsString = StringIO.StringIO()
        writer = csv.writer(csvAsString, delimiter=delimChar)
        reader = csv.reader(StringIO.StringIO(inInstance), delimiter=delimChar)
        rows = []
        for row in reader:
          if hasComments and row[0].startswith('#'): continue
          rows.append(row)
          writer.writerow(row)
        outInstances.append(rows)
        outInstancesAsString.append(csvAsString.getvalue())
      outParsed = {}
      # Read the test
      outParsed['testname'] = inTest['testname']
      outParsed['instances'] = outInstances
      outParsed['instancesAsString'] = outInstancesAsString 
      outTestcases.append(outParsed)
    outdata = { 'parsedcases': outTestcases }
    json.dump(outdata, outfile, indent=2)

if __name__ == "__main__":
  main()
