/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-30 11:04
 */

define('0', ['1', '2'], function (r) {
    debugger;
    alert(r('1') + r('2'));
});

define('1', [], function (r, e, m) {
    m.exports = 'a1';
});

define('2', [], function (r, e, m) {
    m.exports = 'a2';
});

