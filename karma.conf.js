module.exports = function (config) {
    'use strict';

    config.set({
        frameworks: ['qunit'],

        files: [
            // Libraries
            'lib/jquery/jquery.js',
            'lib/underscore/underscore.js',
            'lib/backbone/backbone.js',
            'lib/globalize/globalize.js',

            // Sources
            'src/backbone/schema.js',

            // Tests
            'test/backbone/schema_test.js'
        ],

        preprocessors: {
            'src/**/*.js': ['coverage']
        },

        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: 'coverage_reports'
        },

        browsers: ['Firefox'],

        reportSlowerThan: 75
    });
};
