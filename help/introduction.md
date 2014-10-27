# 什么是 coolie
`coolie`中文意思是“苦力”，在此它指的是为前端脚本模块化服务的一个苦力。它整合了你需要的所有模块，并且按顺序给你运行完毕。
因此，为了减轻`coolie`的工作量，请按照约定、规范、标准来书写模块（[如何书写模块？](https://github.com/cloudcome/coolie/blob/master/help/development.md)）。

# 为什么要用 coolie
服务于脚本模块化的加载器，眼花缭乱，相信你看到这里也有这样的感觉，是不是觉得都没有一款适合你的？我也和你一样，所以`coolie`就诞生了。
`coolie`和其他模块加载器有什么区别，为什么要用它，而不是选择其他。

- 纯净：它只是模块加载器，并且它支持本地模块，它的功能单一，如果你仅仅需要一个模块加载器，那么它很适合你。
- 轻量：正因为它的功能单一，因此它保持着最苗条的身材，不让模块加载器影响了模块的加载。
- 易用：它没有复杂的API，只有配置`config`和`use`两个方法，配置也只有2个选项。
- 安全：只会占用2个全局变量，`define`与`coolie`。
- 方便：开发环境按照模块化书写约定即可，生产环境下有[配套的构建工具](https://github.com/cloudcome/nodejs-coolie)，几乎零配置。
- 先进：它只对现代浏览器服务，这也是它保持好身材的一个原因。

# 怎么用 coolie
```js
<script src="/path/to/coolie.js" data-main="./index.js"></script>
<script src="/path/to/coolie-config.js"></script>
```

- [推荐开发脚手架](https://github.com/cloudcome/coolie/blob/master/help/recommend.md)
- [开发环境下模块书写方式](https://github.com/cloudcome/coolie/blob/master/help/development.md)
- [如何从开发环境构建到生产环境](https://github.com/cloudcome/coolie/blob/master/help/production.md)
