define(function (require) {
    'use strict';

    var text1 = require('text!./some.txt?abc');
    var text2 = require('./some.js?abc');

    console.log('支持加载文本模块了：', text1, text2);
});