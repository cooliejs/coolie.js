coolie.config({
    mode: 'amd',
    mainModulesDir: './',
    nodeModulesDir: '../../node_modules/'
}).use([
    'main-a.js',
    'main-b.js'
]).callback(function (a, b) {
    console.log(a);
    console.log(b);
});