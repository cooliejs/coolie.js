# Coolie 苦力

A coolie for JavaScript module management and module transportation.

一个为 JavaScript 模块管理和模块运输的苦力工。

它只加载脚本文件，如果你的文件是样式、文本，那么请手动用脚本包裹一层。


# Module
## 开发环境（注意看注释说明）
模块入口：`./index.js`
```
// 开发环境不能写模块ID
define(function (require){
	// 模块依赖，不能省略文件后缀
	var num = require('./abc.js');

	alert(num);
});
```
依赖模块：`./abc.js`
```
// 开发环境不能写模块ID
define(function (require, exports, module){
	// 模块依赖
	module.exports = 123;
});
```

## 生产环境（无须关心，一切自动化）
打包之后（这里为了演示，没有压缩），只要入口文件名和模块名一直，就是入口模块

模块入口：`./index.js?v=abc123`
```
define('index.js', ['1'], function (a){
	var b = a('1');

	alert(b);
});
define('1', [], function (a, b, c){
	c.exports = 123;
});
```



# Config

- 方法1：使用配置 JS 文件【推荐】，易于构建
- 方法2：直接内联在 HTML 里，优先级最高，无法被正常构建

## 方法1：文件配置
```
coolie.config({
    // 这里的base是相对于配置文件的
	base: './',
	// 入口文件版本，用于清除文件缓存，常用于发布到生产环境上，具体细节查看`coolie`发布工具
	// 比如入口文件是`index.js`，那么实际请求的路径为`/path/to/index.js?v=abc123`
	version: 'abc123'
	// 这里没有配置`main`，入口文件直接写在内联属性上
});
```

## 方法2：属性配置

```
<script src="./path/to/coolie.js" data-base="./" data-main="./index.js"></script>
```
- `base`
  模块入口的基准路径，相对于当前页面，默认为`coolie.js`所在的路径
- `main`（必须）
  模块入口的路径，相对于`base`


# Builder
[配套的打包工具即将上线](https://github.com/cloudcome/nodejs-coolie)。

打包工具会将路径压缩成1个字符，因此`coolie`不会配置路径别名。


# Version

## 0.0.1
* 完成模块化管理和加载