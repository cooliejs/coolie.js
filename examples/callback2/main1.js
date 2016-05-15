define('0', ['1', '2'], function (r, e, m) {
    m.exports = 'main1:' + r('1') + r('2');
});
define('1', [], function (r, e, m) {
    m.exports = '1';
});
coolie.chunk([0]);
