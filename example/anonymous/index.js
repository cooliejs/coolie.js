define(function (require) {
    console.log('123');
    var a = require('../a');
    console.log('456');
    a();
});