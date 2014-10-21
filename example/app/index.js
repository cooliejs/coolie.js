define('index.js', ['1'], function (r) {
    var name = r('1');

    alert(name);
});

define('1', function (r, e, m) {
    m.exports = '1';
});

