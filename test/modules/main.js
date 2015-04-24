define(function (require, exports, module) {
    var module1 = require('./module1.js');
    var module2 = require('./module2');
    var module3 = require('text!./module3.txt');
    var module4 = require('./Module4/');

    module.exports = module1 + module2;
});