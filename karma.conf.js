module.exports = function (config) {
    'use strict';

    config.set({
        frameworks: ['qunit'],

        files: [
            // Libraries
            { pattern: 'lib/jquery/jquery.js' },
            { pattern: 'lib/underscore/underscore.js' },
            { pattern: 'lib/backbone/backbone.js' },
            { pattern: 'lib/globalize/globalize.js' },

            // Sources
            { pattern: 'src/backbone/schema.js' },

            // Tests
            { pattern: 'test/backbone/schema_test.js' }
        ],

        preprocessors: {
            'src/**/*.js': ['coverage']
        },

        reporters: ['progress', 'coverage'],

        reportSlowerThan: 50,

        coverageReporter: {
            type: 'html',
            dir: 'coverage_reports'
        },

        browsers: ['Firefox']
    });
};
