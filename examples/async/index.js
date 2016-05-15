alert('main');
require.async('async.js', function (async) {
    alert(async);
});