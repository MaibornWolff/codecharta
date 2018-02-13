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

        typedoc: {
            build: {
                options: {
                    module: 'es2015',
                    exclude: '**/*.spec.ts',
                    target: 'es2016',
                    out: 'dist/docs/',
                    name: 'CodeCharta'
                },
                src: 'app/**/*.ts'
            }
        },

        exec: {
            nwjs_package: "build --concurrent --tasks win-x86,win-x64,mac-x64 --mirror https://dl.nwjs.io/ ."
        },

        clean: {
            dist: [paths.dist],
            webpack: [paths.bundlePath],
            doc: [paths.docPath],
            package: [paths.packagePath]
        },

        compress: {
            web: {
                options: {
                    archive: paths.packagePath + '/CodeCharta-' + grunt.file.readJSON('package.json').version + '-web.zip'
                },
                files: [
                    {expand: true, cwd:"./dist/webpack/", src: ['**/*'], dest: '.'}
                ]
            }
        }

    });

    // tasks
    grunt.registerTask("default", ["build"]);
    grunt.registerTask("build", ["clean:webpack", "webpack:prod"]);
    grunt.registerTask("serve", ["clean:webpack", "webpack:dev"]);
    grunt.registerTask("package", ["clean:package", "exec:nwjs_package", "compress"]);
    grunt.registerTask("doc", ["clean:doc", "typedoc"]);

};
