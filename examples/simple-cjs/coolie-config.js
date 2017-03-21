coolie.config({
    mode: 'cjs',
    mainModulesDir: './',
    nodeModulesDir: '../../node_modules/'
}).use([
    'main-c.js',
    'main-d.js'
]).callback(function (c, d) {
    console.log(c);
    console.log(d);
});