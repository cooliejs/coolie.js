coolie.config({
    base: '../',
    version: {
        './sign/index.js': 'abc123'
    },
    debug: false
}).use().callback(function () {
    //alert('模块加载完毕');
});