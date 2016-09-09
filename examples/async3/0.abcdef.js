define('0', ['x'], function (r, e, m) {
    m.exports = r('x').a;
});
define('x', [], function (r, e, m) {
    m.exports = {
        a: 'async',
        b: 'async'
    };
});
