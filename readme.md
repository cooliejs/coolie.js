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
	// 模块导出
	module.exports = 123;
});
```

## 生产环境（无须关心，一切自动化）
打包之后（这里为了演示，没有压缩），只要入口文件名和模块名一致，就是入口模块

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



# API
## `config` 配置（chainable）
```
coolie.config({
	// * 入口模块的基准路径，也可以写绝对路径
    // `base`是相对于`coolie.js`所在的路径的，因此只要`coolie.js`路径不变，配置文件无论被哪个文件引用都没关系
	// 可选，默认为`coolie.js`所在的路径
	base: './',

	// * 模块文件版本，用于清除文件缓存，常用于发布到生产环境上，具体细节查看`coolie`发布工具
	// 比如入口文件是`index.js`，那么实际请求的路径为`/path/to/index.js?_=abc123`
	// 可选，默认为空
	version: 'abc123'
});
```
**注意点**

1. `base`参数配置，与`sea.js`有些出入，请注意。
2. `base`参数是相对于`coolie.js`所在路径的。
3. `base`参数也是入口模块的相对路径。
4. `version`版本号在开发环境下可以为空，构建时会自动更新版本号以便清除生产环境下的缓存。



## `use` 入口模块（chainable）
```
// 运行入口模块路径，注意这里没有回调
// 模块路径相对于`config.base`
coolie.use('./index.js');
```

**注意点**

1. 必须手动调用`.use()`方法。
2. 参数是入口模块路径，不是入口模块名称。
3. 为了配置文件的重用性，当`coolie.js`所在的`script`指定了`data-main`属性，内联属性优先级最高，因此`.use`参数此时可以为空。
   如：`<script src="./coolie.js" data-main="./index2.js"></script>`，此时入口模块就为相对于`config.base`的`./index2.js`文件。
   此种情况会在控制台输出提示。



# Builder
[配套的打包工具已经上线](https://github.com/cloudcome/nodejs-coolie)。

打包工具会将路径压缩成1个字符，因此`coolie`不会配置路径别名。


# Version

## 0.0.2
* 完成模块化管理和加载