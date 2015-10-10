define(function (require) {
    'use strict';

    require('./a/hh.js');

    setTimeout(function () {
        require.async('./b/async.js');
    }, 1000);

    //var a = require('../a');
    //console.log('before b');
    //var b = require('./b/index.js');
    //console.log('after b');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');
    //var c = require('../libs/c.js?a=312');

    // html
    //var html = require('../text/some.html', 'html');
    //var html = require('../text/some.html', 'html|url');
    //var html = require('../text/some.html', 'html|base64');
    //var html = require('../text/some.html', 'html|text');

    // text
    //var text = require('../text/some.txt', 'text');
    //var text = require('../text/some.txt', 'text|url');
    //var text = require('../text/some.txt', 'text|base64');
    //var text = require('../text/some.txt', 'text|text');

    // image
    //var image = require('../image/arrow1.png', 'image');
    //var image = require('../image/arrow1.png', 'image|url');
    //var image = require('../image/arrow1.png', 'image|base64');
    //var image = require('../image/arrow1.png', 'image');

    // css
    //var css = require('../text/some.css', 'css');
    //var css = require('../text/some.css', 'css|url');
    //var css = require('../text/some.css', 'css|base64');
    //var css = require('../text/some.css', 'css|text');

    // json
    var json = require('../image/coolie.json', 'json');
    //var json = require('../image/coolie.json', 'json|url');
    //var json = require('../image/coolie.json', 'json|base64');
    //var json = require('../image/coolie.json', 'json|text');


    //var wx = require('../libs/wx.js');
    //var jquery = require('../libs/path1/jquery.min.js');
    //
    //console.log(html);
    //console.log(text);
    //console.log(image);
    //console.log(css);
    console.log(json);
    //jquery('body').css('background', '#000');
    //a();
    //var json = require('./b/1.json', 'json');
    //console.log(json);
});