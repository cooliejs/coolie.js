define('0', ['1', '2'], function (r) {
    console.log(r('1') + r('2'));

    setTimeout(function () {
        r.async('a', function (ret) {
            console.log(ret);
        });
    }, 1000);

    setTimeout(function () {
        r.async('b', function (ret) {
            console.log(ret);
        });
    }, 2000);

    setTimeout(function () {
        r.async('c', function (ret) {
            console.log(ret);
        });
    }, 3000);

    setTimeout(function () {
        r.async('c', function (ret) {
            console.log(ret);
        });
    }, 4000);
});

define('1', [], function (r, e, m) {
    m.exports = '1';
});

define('2', [], function (r, e, m) {
    m.exports = '2';
});

