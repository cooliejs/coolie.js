define('0', ['1'], function (r) {
    var name = r('1');

    alert(name);
});

define('1', ['2'], function (r, e, m) {
    m.exports = '1';
});

define('2', [], function (r, e, m) {
    m.exports = '2';
});

