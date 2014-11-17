define(function (require, exports, module) {
    var module1 = require('./module1.js');
    var module2 = require('./module2.js');

    module.exports = module1 + module2;
});