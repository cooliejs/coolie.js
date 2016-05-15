define('0', [], function (r, e, m) {
    alert('main');
    r.async('0', function (async) {
        alert('1' + async);
    });
    r.async('0', function (async) {
        alert('2' + async);
    });
});
