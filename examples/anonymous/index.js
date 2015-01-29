define(function (require) {
    console.log('123');
    var a = require('../a');
    var c = require('../libs/c.js');
    var text = require('text!../text/some.txt');
    console.log('456');
    console.log(text);
    a();
});