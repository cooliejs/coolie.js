define(function (require, exports, module) {
    var index = require('./index.js');

    index.fn('error1 start');
    require('./error2.js');
    index.fn('error1 end');

    module.exports = 'error1 exports';
});