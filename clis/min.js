/**
 * 文件描述
 * @author ydr.me
 * @created 2016-12-19 16:46
 */


'use strict';

var uglifyJS = require('uglify-js');
var path = require('path');
var fs = require('fs');
var number = require('blear.utils.number');
var string = require('blear.utils.string');
var random = require('blear.utils.random');

var originalFile = path.join(__dirname, '../coolie.js');
var miniFile = path.join(__dirname, '../coolie.min.js');
var body = fs.readFileSync(originalFile, 'utf8');
var compressorOptions = {
    // 连续单语句，逗号分开
    // 如： alert(1);alert(2); => alert(1),alert(2)
    sequences: false,

    // 重写属性
    // 如：foo['bar'] => foo.bar
    properties: false,

    // 删除无意义代码
    dead_code: false,

    // 移除`debugger;`
    drop_debugger: true,

    // 使用不安全的压缩
    unsafe: false,

    // 不安全压缩
    unsafe_comps: false,

    // 压缩if表达式
    // if(abc) { dosth. } => abc&&dosth.
    conditionals: true,

    // 压缩比较表达式，unsafe === true
    // !(a <= b) => a > b
    // a = !b && !c && !d && !e => a=!(b||c||d||e)
    comparisons: false,

    // 压缩常数表达式，移除无用的常量判断
    // if(DEBUG){return 1}else{return 2} => return 2
    // if(!1 == false){..} => EMPTY
    evaluate: true,

    // 压缩布尔值
    booleans: true,

    // 压缩循环
    loops: true,

    // 移除未使用变量
    // function(){ var a = 1; return 1;} => function(){return 1;}
    unused: true,

    // 函数声明提前
    hoist_funs: true,

    // 变量声明提前
    hoist_vars: true,

    // 压缩 if return if continue
    if_return: true,

    // 合并连续变量省略
    join_vars: true,

    // 小范围连续变量压缩
    cascade: true,

    // 显示警告语句
    warnings: false,

    // 全局常量
    global_defs: {}
};
var reComments = /^\/\*\*$[\s\S]*?^\s\*\/$/mg;
var commentsId = '/*' + random.guid() + '*/';
var commentsBody = '';

body = body.replace(reComments, function (source) {
    commentsBody = source;
    return commentsId;
});

// // 转换变量
// var convertVarible = function () {
//     var reGlobalVarible = /^\s{4}\bvar\s+([a-zA-Z][a-zA-Z\d_$]+)\s+=/mg;
//     var reInlineVarible = /^\s{4}\bvar\s+([a-zA-Z][a-zA-Z\d_$]+)\s+=/;
//     var gid = 0;
// // /**
// // */
//
//     var matches = [].slice.call(body.match(reGlobalVarible));
//
//     matches.forEach(function (match, index) {
//         var varible = match.match(reInlineVarible)[1];
//         var reVarible = new RegExp('([\\s\\(!\\[])\\b(' + string.escapeRegExp(varible) + ')([\\[\\(\\)\\.\\s;,+])', 'g');
//         var replaceTo = '$1_' + number.to62(gid++) + '$3';
//
//         body = body.replace(reVarible, replaceTo);
//     });
// };


var replaceVersion = function () {
    var pkg = require('../package.json');
    return body.replace(/\{\{VERSION}}/g, pkg.version);
};


var minify = function () {
    var minBody = uglifyJS.minify(body, {
        fromString: true,
        // 是否警告提示
        warnings: false,
        // 变量管理
        mangle: true,
        // 是否压缩
        compress: compressorOptions
    }).code;

    return commentsBody + '\n' + minBody;
};

fs.writeFileSync(miniFile, minify(replaceVersion()), 'utf8');
console.log('minify coolie.js to coolie.min.js success');

