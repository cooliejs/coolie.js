define('3', ['4', '5'], function (r) {
    alert(r('4') + r('5'));
});

define('4', [], function (r, e, m) {
    m.exports = '4';
});

define('5', [], function (r, e, m) {
    m.exports = '5';
});

