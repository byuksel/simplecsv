# simplecsv
Simple CSV . JS


----


# Contributing to the project

All contributers are welcome. More hands, better code! 

# Development

In order to develop SimpleCSV.js, you need to install [Node.js](https://nodejs.org/). You also need [NPM](https://www.npmjs.com/), but it comes bundled with Node.js installation.

In order install all the dev dependecies (i.e. all the packages you need to develop)

~~~
npm install --dev
~~~

## Building SimpleCSV.js

We use [Grunt.js](http://gruntjs.com/) for building the package and managing test jobs. The default task will lint, build, unit test, browserify, browser unittest, and produce the uglified code. Just run:

~~~
grunt
~~~

If you only want to unit test, and browser unit test, you can use:

~~~
grunt test
~~~

This will do everything the default command does sans uglify. 

# Unittesting

All features are unit tested.

## Parser ##

The parser is exhaustively tested against the output of [Python CSV parser](https://docs.python.org/2/library/csv.html). The test cases are written in a JSON file called `testcases_as_csv.json`, along with the expected results in another JSON file called `parsed_test_cases_as_arrays.json`. The unittest for the parser will go through each test instance in `testcases_as_csv.json` and compare them to the parsed output in `parsed_test_cases_as_arrays.json`. 

You can feed this file (`testcases_as_csv.json`) to the python program `parsetestcases.py` to produce `parsed_test_cases_as_arrays.json`. **Beware:** the names of the test cases should be unique.





