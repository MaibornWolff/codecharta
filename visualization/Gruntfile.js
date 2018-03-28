module.exports = function (grunt) {

    require("load-grunt-tasks")(grunt);
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
            nwjs_package: "build --concurrent --tasks win-x86,win-x64,linux-x86,linux-x64,mac-x64 --mirror https://dl.nwjs.io/ ."
        },

        clean: {
            dist: ["./dist"],
            webpack: ["./dist/webpack"],
            doc: ["./dist/doc"],
            package: ["./dist/packages"]
        },

        compress: {
            web: {
                options: {
                    archive: "./dist/packages" + '/CodeCharta-' + grunt.file.readJSON('package.json').version + '-web.zip'
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
