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

        webpack: {
            options: {
                stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
            },
            prod: require("./conf/webpack.config.js"),
            dev: Object.assign({ watch: true }, require("./conf/webpack.config.js"))
        },

        mocha_istanbul: {
            coverage: {
                src: ["test/unit-helper.js", "app/**/*.spec.js"],
                options: {
                    mask: '**/*.js',
                    require: ['test/mocha-babel'],
                    coverageFolder: 'dist/coverage',
                    mochaOptions: ['--compilers', 'js:babel-core/register'],
                    istanbulOptions: ['--handle-sigint']
                }
            }
        },

        nwjs: {
            options: {
                platforms: ['win','osx64', 'linux'],
                buildDir: './dist/packages/',
                buildType: 'default',
                cacheDir: '.cache'
            },
            src: ['./dist/webpack/**/*', './package.json', './LICENSE.md']
        },

        clean: {
            dist: ["dist"],
            webpack: ["dist/webpack"],
            coverage: ["dist/coverage/"],
            reports: ["dist/test-reports/"],
            doc: ["dist/doc/"],
            packageTmp: ["dist/packages/CodeCharta"],
            package: ["dist/packages/"]
        },

        exec: {
            doc: {
                command: path.resolve("node_modules", ".bin", "esdoc") + " -c conf/esdoc.json",
                stdout: true
            },
            karmaSingle: {
                command: path.resolve("node_modules", ".bin", "karma") + " start ./conf/karma.config.js",
                stdout: true
            },
            karmaTs: {
                command: path.resolve("node_modules", ".bin", "karma") + " start ./conf/karma.ts.config.js",
                stdout: true
            },
            karmaAuto: {
                command: path.resolve("node_modules", ".bin", "karma") + " start ./conf/karma.auto.config.js",
                stdout: true
            }
        },

        compress: {
            web: {
                options: {
                    archive: './dist/packages/codecharta-web.zip'
                },
                files: [
                    {expand: true, cwd:"./dist/webpack/", src: ['**/*'], dest: '.'}
                ]
            },
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
    grunt.registerTask("build", ["clean:webpack", "webpack:prod"]);
    grunt.registerTask("serve", ["clean:webpack", "webpack:dev"]);
    grunt.registerTask("package", ["clean:package", "nwjs", "force:compress", "clean:packageTmp"]);
    grunt.registerTask("doc", ["clean:doc", "exec:doc"]);
    grunt.registerTask("test", ["clean:coverage", "clean:reports", "exec:karmaSingle"]);
    grunt.registerTask("testts", ["exec:karmaTs"]);
    grunt.registerTask("test:auto", ["clean:coverage", "clean:reports", "exec:karmaAuto"]);

};
