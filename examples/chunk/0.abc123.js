define('2', [], function (require, exports, module) {
    module.exports = 'module 2';
});

define('3', ['4'], function (require, exports, module) {
    module.exports = 'module 3' + require('4');
});

define('4', [], function (require, exports, module) {
    module.exports = 'module 4';
});

define('5', [], function (require, exports, module) {
    module.exports = 'module 5';
});

define('6', [], function (require, exports, module) {
    module.exports = 'module 6';
});

define('7', [], function (require, exports, module) {
    module.exports = 'module 7';
});

