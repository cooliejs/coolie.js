define('index.js', function (require) {
    var name = require('1');

    alert(name);
});

define('1', function (require, exports, module) {
    module.exports = '1';
});

