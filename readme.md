# coolie.js 苦力，模块加载器
[![Build Status][travis-img]][travis-url] 
[![Coverage Status][coveralls-img]][coveralls-url]

[travis-img]: https://travis-ci.org/cooliejs/coolie.js.svg?branch=2.x
[travis-url]: https://travis-ci.org/cooliejs/coolie.js
[coveralls-img]: https://coveralls.io/repos/cooliejs/coolie.js/badge.svg
[coveralls-url]: https://coveralls.io/r/cooliejs/coolie.js


苦力——基于 CommonJS 规范，任意资源类型的模块加载器。


## 语法
```
require("path/to/module"[, "moduleType|outputType"]);
require.async("path/to/module", callback);
```

## 用法
```
<script src="coolie.js" data-config="coolie-config.js" data-main="main.js">
```

```
// coolie-config.js
coolie.config({
    baseDir: "./",
    nodeModulesDir: "/node_modules/"
}).use();
```

```
// main.js
module.exports = "Hello coolie 2.x";
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

- coolie 官方指南：<https://coolie.ydr.me/>
- 构建工具：<https://www.npmjs.com/package/coolie>
- 社区：<http://FrontEndDev.org/>


# Version
[coolie 版本日志](https://coolie.ydr.me/version/)




