# Coolie@0.3.0 苦力 [![Build Status][travis-img]][travis-url] [![Test Coverage][coverage-img]][coverage-url]

A coolie for JavaScript module management and module transportation.

`coolie`遵守AMD规范中的部分约定，配套的构建工具，与之对应，更多内容可以查看帮助。


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