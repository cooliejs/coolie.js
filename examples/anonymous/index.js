define(function (require) {
    console.log('123');
    var a = require('../a');
    var c = require('../libs/c.js');
    var text = require('text!../text/some.txt');
    var wx = require('../libs/wx.js');
    
    console.log('456');
    console.log(text);
    a();
});