define('0', ['1', '2'], function (r) {
    alert(r('1') + r('2'));
    r.async('3');
});

define('1', [], function (r, e, m) {
    m.exports = '1';
});

define('2', [], function (r, e, m) {
    m.exports = '2';
});

