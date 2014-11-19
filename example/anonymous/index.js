define(function (require) {
    console.log('123');
    var a = require('../a.js');
    console.log('456');
    a();
});