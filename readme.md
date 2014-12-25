# Coolie@0.3.1 苦力 [![Build Status][travis-img]][travis-url] [![Test Coverage][coverage-img]][coverage-url]

苦力——一个纯净、易用的模块加载器。

`coolie`遵守AMD规范中的部分条款（[如何开发模块？](https://github.com/cloudcome/coolie/wiki/development)），
[配套的前端构建工具](https://github.com/cloudcome/nodejs-coolie)，
与之对应（[如何构建模块？](https://github.com/cloudcome/coolie/wiki/production)），
[更多内容可以查看WIKI](https://github.com/cloudcome/coolie/wiki)。


# 接口
## `base`
模块的参考路径。该值参考于`coolie.js`。


## `use`
启用模块加载器
```
coolie.config({
	base: './'
}).use();
```

## 帮助
- [前端构建工具](https://github.com/cloudcome/nodejs-coolie)
- [coolie wiki帮助](https://github.com/cloudcome/coolie/wiki)
- [版本更新历史记录](https://github.com/cloudcome/coolie/blob/master/version.md)
- [AMDJS 规范](https://github.com/amdjs/amdjs-api)



[travis-img]: https://travis-ci.org/cloudcome/coolie.svg?branch=master
[travis-url]: https://travis-ci.org/cloudcome/coolie
[coverage-img]: https://img.shields.io/coveralls/cloudcome/coolie.svg?style=flat
[coverage-url]: https://coveralls.io/r/cloudcome/coolie?branch=master