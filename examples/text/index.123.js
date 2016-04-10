define(function (require) {
    'use strict';

    var text1 = require('./some.123.txt?abc', 'text');
    var text2 = require('./some.123.js?abc');

    console.log('支持加载文本模块了：', text1, text2);
});