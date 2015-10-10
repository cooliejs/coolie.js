coolie.config({
    base: './',
    async: '../a/',
    version: {
        '0.js': 'abc123',
        '1.js': 'abc123',
        'main.js': 'def456',
        '../a/a.js': 'def456'
    }
}).use();