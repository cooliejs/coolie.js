define(function (require, exports, module) {
    'use strict';

    require.async('./a.js', function (a) {
        alert(a);
    });

    require('./b.js');
});