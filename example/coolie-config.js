if(window.seajs){
    seajs.use('./index.js');
}

if(window.coolie){
    coolie.config({
        base: './example/',
        version: 'def123'
    }).use('./index.js');
}