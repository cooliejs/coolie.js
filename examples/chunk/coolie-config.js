coolie.config({
    mode: 'AMD',
    mainModulesDir: 'examples/chunk/',
    nodeModulesDir: '/node_modules/',
    chunkDir: 'chunk/',
    chunkMap: {
        '0': 'abcdef',
        '3': 'abcdef'
    },
    asyncDir: 'async/',
    asyncVersion: {}
}).use();