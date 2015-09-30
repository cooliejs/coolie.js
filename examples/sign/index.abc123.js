define('0', ['1', '2'], function (r) {
    alert(r('1') + r('2'));

    setTimeout(function () {
        r.async('0');
    }, 2000);
});

define('1', [], function (r, e, m) {
    m.exports = '1';
});

define('2', [], function (r, e, m) {
    m.exports = '2';
});

