define('0', ['1', '2'], function (r, e, m) {
    document.getElementById('demo').innerHTML =
        'succcess: 2 lines' +
        r('1') +
        r('2');
});


define('1', [], function (r, e, m) {
    Object.defineProperty(e, "__esModule", {
        value: true
    });
    e.default = void 0;
    e.default = '<br>exports.default';
});


define('2', [], function (r, e, m) {

    m.exports = '<br>module.exports';
});
