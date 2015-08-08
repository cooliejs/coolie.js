define('8', [], function (require, exports, module) {
    module.exports = 'module 8';
});

define('9', ['10'], function (require, exports, module) {
    module.exports = 'module 9' + require('10');
});

define('10', [], function (require, exports, module) {
    module.exports = 'module 10';
});

define('11', [], function (require, exports, module) {
    module.exports = 'module 11';
});

define('12', [], function (require, exports, module) {
    module.exports = 'module 12';
});

define('7', [], function (require, exports, module) {
    module.exports = 'module 7';
});

