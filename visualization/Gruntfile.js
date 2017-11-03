"use strict";

var path = require("path");
const paths = require("./conf/paths.js");

module.exports = function (grunt) {

    require("load-grunt-tasks")(grunt);
    require("time-grunt")(grunt);

    // Define configuration for all tasks
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        webpack: require("./conf/grunt.webpack.config.js"),

        nwjs: require("./conf/grunt.nwjs.config.js"),

        clean: {
            dist: [paths.dist],
            webpack: [paths.bundlePath],
            doc: [paths.docPath],
            packageTmp: [paths.packagePath + "/CodeCharta"],
            package: [paths.packagePath]
        },

        exec: {
            doc: {
                command: path.resolve("node_modules", ".bin", "esdoc") + " -c conf/esdoc.json",
                stdout: true
            }
        },

        compress: {
            web: {
                options: {
                    archive: paths.packagePath + '/codecharta-web.zip'
                },
                files: [
                    {expand: true, cwd:"./dist/webpack/", src: ['**/*'], dest: '.'}
                ]
            },
            linux32: {
                options: {
                    archive: paths.packagePath + '/codecharta-visualization-linux32.zip'
                },
                files: [
                    {expand: true, cwd: paths.packagePath + '/CodeCharta/linux32/', src: ['**/*'], dest: '.'}
                ]
            },
            linux64: {
                options: {
                    archive: paths.packagePath + '/codecharta-visualization-linux64.zip'
                },
                files: [
                    {expand: true, cwd: paths.packagePath + '/CodeCharta/linux64/', src: ['**/*'], dest: '.'}
                ]
            },

            win32: {
                options: {
                    archive: paths.packagePath + '/codecharta-visualization-win32.zip'
                },
                files: [
                    {expand: true, cwd:paths.packagePath + '/CodeCharta/win32/', src: ['**/*'], dest: '.'}
                ]
            },
            win64: {
                options: {
                    archive: paths.packagePath + '/codecharta-visualization-win64.zip'
                },
                files: [
                    {expand: true, cwd: paths.packagePath + '/CodeCharta/win64/', src: ['**/*'], dest: '.'}
                ]
            }

        }

    });

    // tasks
    grunt.registerTask("default", ["build"]);
    grunt.registerTask("build", ["clean:webpack", "webpack:prod"]);
    grunt.registerTask("serve", ["clean:webpack", "webpack:dev"]);
    grunt.registerTask("package", ["clean:package", /* "nwjs" */, "compress", "clean:packageTmp"]);
    grunt.registerTask("doc", ["clean:doc", /* "exec:doc" */]);

};
