define(function (require, exports, module) {
    'use strict';

    var index = require('./index.js');
    index.fn('error2 start');
    require('./error1.js');
    index.fn('error2 end');

    module.exports = 'error2 exports';
});