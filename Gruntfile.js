module.exports = function (grunt) {
    'use strict';

    ///////////////////////////
    // PROJECT CONFIGURATION //
    ///////////////////////////

    grunt.initConfig({

        //////////////
        // METADATA //
        //////////////

        pkg: grunt.file.readJSON('package.json'),
        banner: grunt.file.read('BANNER'),

        ////////////////////////
        // TASK CONFIGURATION //
        ////////////////////////

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },

            src: 'src/**/*.js',
            test: 'test/**/*.js'
        },

        qunit: {
            all: 'test/**/*.html'
        },

        concat: {
            options: {
                banner: '<%= banner %>'
            },

            dist: {
                src: 'src/**/*.js',
                dest: 'dist/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },

            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        }
    });

    /////////////
    // PLUGINS //
    /////////////

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    ///////////
    // TASKS //
    ///////////

    grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
};
