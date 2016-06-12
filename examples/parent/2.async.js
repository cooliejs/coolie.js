define('0', ['20'], function (r, e, m) {
    m.exports = r('20');
});
define('20', ['1', '3', '4', '41'], function (r, e, m) {
    m.exports = r('1') + '2' + r('3') + r('4') + r('41');
});
define('21', [], function () {
    return '{}';
});
coolie.chunk(['3', '4']);