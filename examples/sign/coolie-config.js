coolie.config({
    base: '../',
    async: './a/',
    chunk: './c/',
    version: {
        './sign/index.js': 'abc123',
        './a/a.js': 'def456',
        './a/b.js': 'def456',
        './a/c.js': 'def456',
        './c/0.js': 'abc123',
    },
    debug: false
}).use().callback(function () {
    console.log('模块加载完毕');
});