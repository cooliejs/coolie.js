define('0', ['1', '2'], function (r, e, m) {
    alert(r('1') + r('2'));
});
define('1', [], function (r, e, m) {
    m.exports = '1';
});
define('2', ['3'], function (r, e, m) {
    m.exports = '2' + r('3');
});
define('3', [], function (r, e, m) {
    m.exports = '3';
});
