coolie.config({
    base: './coolie/examples/',
    host: 'http://192.168.1.100:19093',
    version: {
        './text/some.txt': '123',
        'libs/c.js': 'abc123',
        'libs/path1/path2/b.js': 'def456'
    }
}).use().callback(function () {
    alert('全部模块加载完毕');
});