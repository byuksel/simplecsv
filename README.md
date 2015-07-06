![SimpleCSV.js Logo](http://simplecsvjs.com/simplecsv.png)

SimpleCSV.js is a fast and compact JavaScript csv library for parsing csv strings, and parsing JSON table objects.

## Features ##

* **In-the-Browser, For-The-Browser:** Only 3 lines of code to parse csv strings. 
* **Python csv compatible:** Guaranteed to produce the same results as Python 2.7's csv parser. 
* **JSON parser included:** Convert CSV -> JSON, or JSON -> CSV.
* **No dependancies:** Small standalone .js file. 

## Downloads ##

* [Version 0.0.3 (Minimized, 4.2K) : http://simplecsvjs.com/dist/simplecsv.0.0.3.standalone.min.js](http://simplecsvjs.com/dist/simplecsv.0.0.3.standalone.min.js)
* [Version 0.0.3 (Un-Minimized), 12K : http://simplecsvjs.com/dist/simplecsv.0.0.3.standalone.js](http://simplecsvjs.com/dist/simplecsv.0.0.3.standalone.js)

## Examples ##

### Browser ###

In any web page:
```html
<script src="http://simplecsvjs.com/dist/simplecsv.0.0.1.standalone.min.js"></script>
<script>
  var simplecsv = require('simplecsv');
  var csv = new simplecsv.csv();

  var parsedCsvdata = csv.parseString('Turing, 35, chess\nSamuel, 21, checkers');
</script>
```

### Node.js ###

```js
var simplecsv = require('simplecsv');
var csv = new simplecsv.csv();

var parsedCsvdata = csv.parseString('Turing, 35, chess\nSamuel, 21, checkers');
```

## More Examples ##


### CSV to JSON ###

```js
var simplecsv = require('simplecsv');
var csv = new simplecsv.csv();

var planetCsv  = csv.parseString('Planet Name, Color\nMars,red-orange\nUranus,light-blue',
                                 { hasHeaders: true} );
var str = csv.csvdataToJSON(planetCsv);

console.log(str);
```

output is:
```json
[{"Planet Name":"Mars"," Color":"red-orange"},{"Planet Name":"Uranus"," Color":"light-blue"}]
```

### JSON -> CSV ###
```js
var simplecsv = require('simplecsv');
var csv = new simplecsv.csv();

var planetCsv  = csv.JSONToCsvdata('[{"Planet Name":"Mars"," Color":"red-orange"},' +
                                    '{"Planet Name":"Uranus"," Color":"light-blue"}]');


var str = csv.csvdataToString(planetCsv);
console.log(str);
```

output is:
```
Planet Name, Color
Mars,red-orange
Uranus,light-blue
```

### console.log() every cell ###

```js
var simplecsv = require('simplecsv');
var csv = new simplecsv.csv();

var cdata = csv.parseString('Planet Name, Color\nMars,red-orange\nUranus,light-blue', { hasHeaders: true });
for (var i = 0; i < cdata.rowCount; i++) {
  for (var j = 0; j < cdata.columnCount; j++) {
    console.log(cdata.rows[i][j]);
  }
}
```

### find errors ###

```js
var simplecsv = require('simplecsv');
var csv = new simplecsv.csv();

var cdata = csv.parseString('Planet Name, Color\nMars\nred-orange, Uranus,light-blue', { hasHeaders: true });
console.log(csv.findErrors(cdata));
```

# Quick Start #

# Install #

Install with [npm](https://www.npmjs.com/).

~~~
$ npm install simplecsv
~~~

# Newline #

SimpleCSV.js uses `\n` and `\r\n` for newline when parsing. Currently there is no support for Mac's `\r` for newline (i.e. universal mode in Python csv). 

# Support #

For bug reports, feature requests and general questions, please feel free to email baris@onehundredyearsofcode.com.

# Development #
[Refer to development notes](/CONTRIBUTING.md)
