alert('main');
require.async('async.js', function (async) {
    alert('1:' + async);
});
require.async('async.js', function (async) {
    alert('2:' + async);
});