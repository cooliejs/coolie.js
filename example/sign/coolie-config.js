if(window.seajs){
    seajs.use('./index.js');
}

if(window.coolie){
    coolie.config({
        base: './example/sign/',
        version: 'def123'
    }).use('./index.js');
}