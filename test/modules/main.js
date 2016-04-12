define(function (require, exports, module) {
    'use strict';

    module.exports = {
        module0: require('./module0.js'),
        module1: require('./module1.js'),
        module2: require('./module2.js'),
        module3: require('./module3.txt', 'text'),
        module4: require('./sub-modules/module4.json', 'json'),
        async: function (callback) {
            require.async('./async-modules/module5.js', callback);
        },
        module6: require('./sub-modules/module6.css', 'css|style')
    };
});