define(function (require,exports, module) {
    'use strict';

    var err1 = require('./error1.js');
    var err2 = require('./error2.js');
    var a = 1;
    var o = {
        fn: function (prefix) {
          console.log(prefix, a++, err1.err, err2.err);
        }
    };

    module.exports = o;

    o.fn('index');
});