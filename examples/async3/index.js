define('0', ['x'], function (r, e, m) {
    alert('main: ' + r('x').b);

    setTimeout(function () {
        r.async('0', function (async) {
            alert('async: ' + async);
        });
    }, 100);
});
define('x', [], function (r, e, m) {
    m.exports = {
        a: 'main',
        b: 'main'
    };
});
