/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-08 10:39
 */


define(function (require, exports, module) {
    'use strict';

    var arrow1 = require('./arrow1.png', 'image');
    var arrow2 = require('image!./arrow2.png');

    console.log(arrow1);
    console.log(arrow2);
});