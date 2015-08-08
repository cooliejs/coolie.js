define(function (require) {
    //console.log('123');
    var a = require('../a');
    console.log('before b');
    var b = require('./b/index.js');
    console.log('after b');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');
    var text = require('../text/some.txt', 'text');
    //var wx = require('../libs/wx.js');
    //var jquery = require('../libs/path1/jquery.min.js');

    //console.log('456');
    //console.log(text);
    //a();
    //var json = require('./b/1.json', 'json');
    //console.log(json);
});