'use strict';

module.exports = function(grunt) {

  // measures the time each task takes
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),  // Parse package.json info
    replace: {  // Replace distribution related variables to produce README.md
      dist: {
        options: {
          patterns: [
            {
              json: {
                '_un_minimized_file_': '<%= browserify.standalone.output_file %>',
                '_minimized_file_': '<%= uglify.all.output_file %>',
                '_pkg_version_': '<%= pkg.version %>'
              }
            }
          ]
        },
        files: [
          { src: 'README.template.md', dest: 'README.md'}
        ]
      }
    },
    jsdoc: {
      all: {
        src: ['lib/*.js', 'test/*.js'],
        jsdoc: '/Users/barisyuksel/data/npm-global/bin/jsdoc',
        options: {
          destination: 'docs'
        }
      }
    },
    // jshint all the src files.
    jshint: {
      options: {
	eqeqeq: true,
	trailing: true
      },
      target: {
	src : ['lib/**/*.js',
               'test/**/*.js',
               '!lib/garbage/**/*',]
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'test/output/output.txt'
        },

        src: ['test/**/*.js']
      }
    },
    // remove all previous browserified builds
    clean: {
      dist: ['./browser/dist/**/*', './README.md'],
      tests: ['./browser/test/browserified_tests.js',
              './test/output/**/*',
              './README.md']
    },
    // Parse AST for require() and build the browser code.
    browserify: {
      standalone: {
        src: '<%= pkg.name %>.js',
        output_file: 'dist/<%= pkg.name %>.<%= pkg.version %>.standalone.js',
        dest: 'browser/<%= browserify.standalone.output_file %>',
        options: {
          standalone: '<%= pkg.name %>',
          alias: {
            'simplecsv': './<%= pkg.name %>.js'
          }
        }
      },
      tests: {
        src: 'browser/test/suite.js',
        dest: 'browser/test/browserified_tests.js',
        options: {
          external: [ './index.js' ],
          // Embed source map for tests
          debug: true
        }
      }
    },
    // Start the basic web server from connect.
    connect: {
      server: {},
      keepalive: {
        options: {
          keepalive: true
        }
      }
    },
    // run the mocha tests in the browser via PhantomJS
    mocha_phantomjs: {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:8000/browser/test/index.html'
          ]
        }
      }
    },
    // uglify our one simplecsv.js file.
    uglify: {
      all: {
        output_file: 'dist/<%= pkg.name %>.<%= pkg.version %>.standalone.min.js',
        files: {
          // Uglify browserified library
          'browser/<%= uglify.all.output_file %>':
          ['<%= browserify.standalone.dest %>']
        },
        options: {
          banner: '/*! <%= pkg.name %>.<%= pkg.version %>.<%= grunt.template.today("yyyy-mm-dd") %> */\n'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('docs', ['replace', 'jsdoc']);
  grunt.registerTask('dist', ['clean:dist', 'browserify', 'uglify']);
  grunt.registerTask('localtest', ['clean:tests', 'jshint', 'mochaTest']);
  grunt.registerTask('browsertest', ['clean:tests', 'jshint', 'browserify', 'connect:server', 'mocha_phantomjs']);
  grunt.registerTask('test', ['localtest', 'browsertest', 'docs']);
  grunt.registerTask('default', ['test', 'dist', 'docs']);
};
