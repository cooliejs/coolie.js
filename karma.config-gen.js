var httpServer = function (req, res, next) {
    if (req.url.indexOf('/delay.js') > -1) {
        return setTimeout(function () {
            res.end('module.exports="delay 500ms";');
        }, 500);
    }

    next();
};

module.exports = function (coverage) {
    var reporters = ['progress'];

    if (coverage) {
        reporters.push('coveralls');
        reporters.push('coverage');
    }

    return function (config) {
        config.set({

            // base path that will be used to resolve all patterns (eg. files, exclude)
            basePath: '',


            // frameworks to use
            // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
            frameworks: ['jasmine'],


            client: {},


            // list of files / patterns to load in the browser
            files: [
                './coolie.js',
                {
                    pattern: './test/cjs-modules/**',
                    included: false
                },
                {
                    pattern: './test/amd-modules/**',
                    included: false
                },
                './test/unit/*.js'
            ],


            // list of files to exclude
            exclude: [],


            // preprocess matching files before serving them to the browser
            // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
            preprocessors: {
                './coolie.js': [coverage ? 'coverage' : '']
            },


            // optionally, configure the reporter
            coverageReporter: {
                type: 'lcov',
                dir: './coverage/'
            },


            // test results reporter to use
            // possible values: 'dots', 'progress'
            // available reporters: https://npmjs.org/browse/keyword/karma-reporter
            reporters: reporters,


            // web server port
            port: 9876,


            // enable / disable colors in the output (reporters and logs)
            colors: true,


            // level of logging
            // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
            logLevel: config.LOG_INFO,


            // enable / disable watching file and executing tests whenever any file changes
            autoWatch: false,


            // start these browsers
            // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
            browsers: [],


            // Continuous Integration mode
            // if true, Karma captures browsers, runs the tests and exits
            singleRun: true,
            
            middleware: ['custom'],


            // plugins
            plugins: ['karma-*', {
                'middleware:custom': [
                    'factory', function () {
                        return httpServer;
                    }
                ]
            }]
        });
    };
};
