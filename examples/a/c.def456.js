define('0', ['40', '41', '10'], function (r, e, m) {
    m.exports = r('40') + r('41') + r('10');
});

define('40', [], function (r, e, m) {
    m.exports = '40';
});

define('41', [], function (r, e, m) {
    m.exports = '41';
});

coolie.chunk(['0']);
