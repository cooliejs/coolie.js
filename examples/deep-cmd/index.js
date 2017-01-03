define(function (require, exports, module) {
    var $ = require('jquery');
    var text = require('./a');
    var d = require('./d');

    $('body').append('<h1>' + text + d + '</h1>');
});
