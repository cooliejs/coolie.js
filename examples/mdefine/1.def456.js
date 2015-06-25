define('0', ['1'], function (require, exports, module) {
    alert(require('1'));
});

define('1', ['2', '3'], function (require, exports, module) {
    module.exports = require('2') + require('3');
});

coolie.chunk('0');
