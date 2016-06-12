coolie.config({
    mainModulesDir: './',
    nodeModulesDir: '/node_modules/',
    mode: 'AMD',
    asyncModulesMap: {
        2: 'async'
    },
    chunkModulesMap: {
        3: 'chunk',
        4: 'chunk'
    }
}).use();