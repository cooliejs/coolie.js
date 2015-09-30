/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-09-30 11:04
 */

define('0', ['3', '4'], function (r) {
    debugger;
    alert(r('3') + r('4'));
});

define('3', [], function (r, e, m) {
    m.exports = '3';
});

define('4', [], function (r, e, m) {
    m.exports = '4';
});

