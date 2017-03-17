"use strict";

var path = require("path");

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require("load-grunt-tasks")(grunt);

    // Time how long tasks take
    require("time-grunt")(grunt);

    // Define configuration for all tasks
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        nwjs: {
            options: {
                platforms: ['win','osx64', 'linux'],
                buildDir: './dist/packages/',
                buildType: 'default',
                cacheDir: '.cache'
            },
            src: ['./dist/app/**/*', './package.json', './LICENSE.md']
        },

        browserify: {
          dist: {
            options: {
              transform: ["babelify", "es6-arrow-function"],
              presets: ["es2015"],
              browserifyOptions: {
                  debug:true
              }
            },
            files: {
              "dist/app/libs/bundle.js": "app/app.js"
            }
          }
        },

        htmlmin: {
          dist: {
            options: {
              removeComments: true,
              collapseWhitespace: true
            },
            files: [{
              "expand": true,
              "cwd": "app/",
              "src": ["**/*.html"],
              "dest": "dist/app/",
              "ext": ".html",
              "flatten": true
            }]
          }
        },

        jshint: {
            options: {
                jshintrc: ".jshintrc",
                reporter: require("jshint-stylish")
            },
            all: {
                src: [
                    "app/**/*.js","!app/**/*.spec.js"
                ]
            }
        },

        concat: {
            css: {
                src: "dist/app/style/**/*.css",
                dest: "dist/app/css/style.css"
            }
        },

        connect: {
            server: {
                keepalive: true,
                options: {
                    port: 9000,
                    base: ''
                }
            }
        },

        copy: {
            license: {
                files: [
                    {expand: false, src: ["LICENSE.md"], dest: "dist/app/LICENSE.md"}
                ]
            },
          jquery: {
            files: [
              {expand: false, src: ["node_modules/jquery/dist/jquery.min.js"], dest: "dist/app/libs/jquery.min.js"}
            ]
          },
          angular: {
            files: [
              {expand: false, src: ["node_modules/angular/angular.min.js"], dest: "dist/app/libs/angular.min.js"}
            ]
          },
          hammer: {
            files: [
              {expand: false, src: ["node_modules/hammerjs/hammer.min.js"], dest: "dist/app/libs/hammer.min.js"}
            ]
          },
          materialize: {
            files: [
              {expand: false, src: ["node_modules/materialize-css/dist/js/materialize.min.js"], dest: "dist/app/libs/materialize.min.js"},
              {expand: false, src: ["node_modules/materialize-css/dist/css/materialize.min.css"], dest: "dist/app/css/materialize.min.css"},
              {expand: false, src: ["node_modules/materialize-css/extras/noUiSlider/nouislider.css"], dest: "dist/app/css/nouislider.css"},
              {expand: true, src: ["node_modules/materialize-css/dist/fonts/roboto/*"], dest: "dist/app/fonts/roboto/", flatten: true}
            ]
          },
          fontawesome: {
            files: [
              {expand: false, src: ["node_modules/font-awesome/css/font-awesome.min.css"], dest: "dist/app/css/font-awesome.min.css"},
              {expand: true, src: ["node_modules/font-awesome/fonts/*"], dest: "dist/app/fonts/", flatten: true}
            ]
          },
            images: {
            files: [
              {"expand": true, "cwd": "app/img/", "src": ["*"], "dest": "dist/app/img", "flatten": true}
            ]
          },
            json: {
                files: [
                    {"expand": true, "cwd": "app/", "src": ["**/*.json"], "dest": "dist/app/", "flatten": true}
                ]
            },
            style: {
                files: [
                    {"expand": true, "cwd": "app/", "src": ["**/*.css"], "dest": "dist/app/style", "flatten": true}
                ]
            },
        },

        clean: {
            app: ["dist/app"],
            style: ["dist/app/style/"],
            coverage: ["dist/coverage/", "coverage/"],
            doc: ["dist/doc/"],
            package: ["dist/packages/"]
        },

        exec: {
            test : {
              command: 
				path.resolve("node_modules", ".bin", "istanbul") + 
				" cover " + 
				path.resolve("node_modules", ".bin", "_mocha") + 
				" -- " + 
				path.resolve("test", "helper", "unit-helper.js") +
				" $(find app -name '*.spec.js') --compilers js:babel-core/register" +
				" && mv " +
				path.resolve("coverage") + 
				" " +
				path.resolve("dist", "coverage"),
              stdout: true
            },
            esdoc: {
                command: path.resolve("node_modules", ".bin", "esdoc") + " -c esdoc.json",
                stdout: true
            }
        },

        watch: {
            app: {
                files: ["app/**/*.*"],
                tasks: ["quick"],
                options: {
                    spawn: false,
                },
            },
            unit: {
                files: ["app/**/*.spec.js", "app/**/*.*"],
                tasks: ["test"],
                options: {
                    spawn: false,
                },
            },
        },

        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            app: {
                files: {
                    "dist/app/libs/bundle.js": ["dist/app/libs/bundle.js"]
                },
            }
        },

        compress: {
            linux32: {
                options: {
                    archive: './dist/packages/codecharta-visualization-linux32.zip'
                },
                files: [
                    {expand: true, cwd:"./dist/packages/CodeCharta/linux32/", src: ['**/*'], dest: '.'}
                ]
            },
            linux64: {
                options: {
                    archive: './dist/packages/codecharta-visualization-linux64.zip'
                },
                files: [
                    {expand: true, cwd:"./dist/packages/CodeCharta/linux64/", src: ['**/*'], dest: '.'}
                ]
            },
            osx64: {
                options: {
                    archive: './dist/packages/codecharta-visualization-osx64.zip'
                },
                files: [
                    {expand: true, cwd:"./dist/packages/CodeCharta/osx64/", src: ['**/*'], dest: '.'}
                ]
            },
            win32: {
                options: {
                    archive: './dist/packages/codecharta-visualization-win32.zip'
                },
                files: [
                    {expand: true, cwd:"./dist/packages/CodeCharta/win32/", src: ['**/*'], dest: '.'}
                ]
            },
            win64: {
                options: {
                    archive: './dist/packages/codecharta-visualization-win64.zip'
                },
                files: [
                    {expand: true, cwd:"./dist/packages/CodeCharta/win64/", src: ['**/*'], dest: '.'}
                ]
            }
        }

    });

    // tasks
    grunt.registerTask("default", ["build"]);

    grunt.registerTask("build", ["clean:app", "jshint", "browserify", "ngAnnotate:app", "htmlmin", "copy:style", "concat:css", "clean:style", "copy:materialize", "copy:json", "copy:hammer", "copy:fontawesome", "copy:angular", "copy:images", "copy:jquery", "copy:license"]);
    grunt.registerTask("test", ["clean:coverage", "exec:test"]);
    grunt.registerTask("doc", ["clean:doc", "exec:esdoc"]);
    grunt.registerTask("package", ["clean:package", "nwjs", "compress"]);
    grunt.registerTask("quick", ["jshint", "browserify", "ngAnnotate:app", "htmlmin", "copy:style", "concat:css","copy:json", "clean:style", "copy:images"]);


};
