# coolie.js@1.3.3 苦力 
[![Build Status][travis-img]][travis-url] 
[![Coverage Status][coveralls-img]][coveralls-url]

[travis-img]: https://travis-ci.org/cooliejs/coolie.js.svg?branch=master
[travis-url]: https://travis-ci.org/cooliejs/coolie.js
[coveralls-img]: https://coveralls.io/repos/cooliejs/coolie.js/badge.svg
[coveralls-url]: https://coveralls.io/r/cooliejs/coolie.js


苦力——基于 C/AMD 的纯净、易用、智能的模块加载器。

## 语法
```
require("path/to/module"[, "moduleType|outputType"]);
```

## 示例
```
require('some.js');
require.async('some.js');

require('some.css', 'css');
require('some.css', 'css|url');
require('some.css', 'css|base64');
require('some.css', 'css|text');
require('some.css', 'css|style');

require('some.txt', 'text');
require('some.txt', 'text|url');
require('some.txt', 'text|base64');
require('some.txt', 'text|text');

require('some.html', 'html');
require('some.html', 'html|url');
require('some.html', 'html|base64');
require('some.html', 'html|text');

require('some.jpg', 'file');
require('some.jpg', 'file|url');
require('some.jpg', 'file|base64');

require('some.json', 'json');
require('some.json', 'json|url');
require('some.json', 'json|base64');
require('some.json', 'json|text');
```


- coolie 官方指南：<http://coolie.ydr.me/>
- 构建工具：<https://www.npmjs.com/package/coolie>
- 社区：<http://FrontEndDev.org/>
- 内核：<http://seajs.org/>


# Version
[coolie 版本日志](http://coolie.ydr.me/version/)


# 接口
## `coolie.config.base`
模块的参考路径。该值参考于`coolie-config.js`。


## `coolie.config.version`
- `String` 全部模块的版本号，不建议手动写。
- `Object` 模块细粒度版本号，构建之后会自动生成。


## `coolie.config.cache`
是否缓存已下载的模块，默认为true。


## `coolie.config.debug`
是否为调试模式，默认为 true，构建之后为 false。当为 true 时，会注入全局变量`DEBUG`。


## `coolie.use`
启用模块加载器
```
coolie.config({
	base: './'
}).use([main]);
```

## `coolie.version`
返回当前模块加载的版本


## `coolie.callback`
模块全部加载完毕后回调。常用于单元测试。


## `coolie.url`
返回当前模块加载器所在的 url。常用于单元测试。


## `coolie.dirname`
返回当前模块加载器所在的目录。常用于单元测试。


## `coolie.modules`
返回当前模块加载器加载的所有模块。常用于单元测试。


