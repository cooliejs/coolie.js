coolie.config({
    base: '../',
    version: {
        './text/some.txt': '123',
        'libs/c.js': 'abc123',
        'libs/path1/path2/b.js': 'def456'
    },
    global: {
        CLASSICAL: true
    }
}).use().callback(function () {
    console.log('全部模块加载完毕');
});