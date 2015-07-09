[![SimpleCSV.js Logo](http://simplecsvjs.com/simplecsv.png)](/)

SimpleCSV.js is a fast and compact JavaScript CSV library for parsing csv strings, and parsing JSON table objects.

## Features ##

* **In-the-Browser, For-The-Browser:** Only 3 lines of code to parse CSV strings, and JSON tables.
* **Python csv compatible:** Guaranteed to produce the same results as Python 2.7 csv parser.
* **JSON parser:** Convert CSV to JSON, or JSON to CSV.
* **No dependancies:** Tiny standalone .js file.

## Downloads ##

* [Version @@_pkg_version_, minimized, 4.4K : http://simplecsvjs.com/@@_minimized_file_](http://simplecsvjs.com/@@_minimized_file_)
* [Version @@_pkg_version_, un-minimized, 13K : http://simplecsvjs.com/@@_un_minimized_file_](http://simplecsvjs.com/@@_un_minimized_file_)

## Examples ##

### Browser ###

In any web page:
```html
<script src="http://simplecsvjs.com/@@_minimized_file_"></script>
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

var jsonObj = csv.CSVToJSON('Planet Name, Color\nMars,red-orange\nUranus,light-blue',
                            { hasHeaders: true });
console.log(jsonObj);
```

output is:
```json
[{"Planet Name":"Mars"," Color":"red-orange"},{"Planet Name":"Uranus"," Color":"light-blue"}]
```

### JSON -> CSV ###
```js
var simplecsv = require('simplecsv');
var csv = new simplecsv.csv();

var str  = csv.JSONToCSV('[{"Planet Name":"Mars"," Color":"red-orange"},' +
                         '{"Planet Name":"Uranus"," Color":"light-blue"}]');
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

# Documentation #
[Library manual](/MANUAL.md)
