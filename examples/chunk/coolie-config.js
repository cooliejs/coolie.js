coolie.config({
    mode: 'AMD',
    mainModulesDir: './',
    nodeModulesDir: '/node_modules/',
    chunkModulesDir: 'chunk/',
    chunkModulesMap: {
        '0': 'abcdef',
        '3': 'abcdef'
    },
    asyncDir: 'async/',
    asyncVersion: {}
}).use();