define(function(require, exports, module){
    require('./libs/path1/path2/b.js');
    module.exports = function(){
        alert('load ' + this.dirname);
    };
});