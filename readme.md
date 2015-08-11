# coolie.js@1.0.0 苦力 
[![Build Status][travis-img]][travis-url] 
[![Coverage Status][coveralls-img]][coveralls-url]


苦力——一个纯净、易用、智能的模块加载器。

```
require('some.js');
require('some.css', 'css');
require('some.html', 'html');
require('some.jpg', 'image');
require('some.json', 'json');
```


- coolie book：<http://coolie.ydr.me/>
- 构建工具：<https://www.npmjs.com/package/coolie>
- 社区：<http://FrontEndDev.org/>
- 内核：<http://seajs.org/>


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


[travis-img]: https://travis-ci.org/cloudcome/coolie.svg?branch=master
[travis-url]: https://travis-ci.org/cloudcome/coolie
[coveralls-img]: https://coveralls.io/repos/cloudcome/coolie/badge.svg
[coveralls-url]: https://coveralls.io/r/cloudcome/coolie