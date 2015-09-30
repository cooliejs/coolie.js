coolie.config({
    base: './',
    async: '../a/',
    version: {
        '0.js': 'abc123',
        '1.js': 'abc123',
        'main.js': 'def456',
        '../a/0.js': 'def456'
    }
}).use();