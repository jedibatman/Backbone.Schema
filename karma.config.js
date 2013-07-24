files = [
    QUNIT,
    QUNIT_ADAPTER,

    { pattern: 'lib/jquery/jquery.js' },
    { pattern: 'lib/underscore/underscore.js' },
    { pattern: 'lib/backbone/backbone.js' },
    { pattern: 'lib/globalize/globalize.js' },

    { pattern: 'src/backbone/schema.js' },

    { pattern: 'test/backbone/schema_test.js' }
];

preprocessors = {
    'src/**/*.js': 'coverage'
};

reporters = ['progress', 'coverage'];

coverageReporter = {
    type: 'text',
    dir: 'log'
};

browsers = ['Chrome', 'Firefox'];

singleRun = true;
