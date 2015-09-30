coolie.config({
    base: '../',
    async: 'a',
    chunk: 'c',
    version: {
        './sign/index.js': 'abc123',
        './async/0.js': 'def456'
    },
    debug: false
}).use().callback(function () {
    alert('模块加载完毕');
});