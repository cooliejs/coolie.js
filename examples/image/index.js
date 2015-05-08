/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-08 10:39
 */


define(function (require, exports, module) {
    'use strict';

    var arrow1 = require('./arrow1.png', 'image');
    var arrow2 = require('image!./arrow2.png');
    var img1 = '<img src="'+arrow1+'">';
    var img2 = '<img src="'+arrow2+'">';

    document.getElementById('body').innerHTML = img1 + img2;
});