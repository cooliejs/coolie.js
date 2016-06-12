define('0', ['1', '3', '4'], function (r, e, m) {
    alert('将分别弹出 134、1234');

    alert(r('1') + r('3') + r('4'));

    r.async('2', function (e) {
        alert(e);
    });
});
define('1', ['11', '12'], function (r) {
    return r('11') + '1' + r('12');
});
define('11', [], function () {
    return '[';
});
define('12', [], function () {
    return ']';
});
coolie.chunk(['3', '4']);