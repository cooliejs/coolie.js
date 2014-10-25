# 开发环境下模块书写方式

```js
define(function(require, exports, module){
	require('./some/module.js');
	module.exports = 123;
});
```

## 一个文件一个模块
开发环境下，一个文件必须是一个模块，管理方便，颗粒化，文件路径就是模块ID。

## 不写模块ID
开发环境下，不需要写模块的ID，模块加载器会自动以模块文件所在的地址为模块ID，这也是为什么一个
文件里只能写一个模块的原因了。

## 不显式模块依赖
开发环境下，不需要显示书写模块的依赖，直接使用`require`即可。

## `requie`关键字不能更换
在加载模块的时候，会以`require`关键字作为提取模块依赖的匹配，因此不能修改它。`exports`和
`module`可以修改。

## 模块依赖必须是显式
模块依赖中不能包含变量，也不能重写`require`关键字。

## 依赖模块必须为本地相对地址
模块依赖必须为本地相对地址，并且模块地址不能省略文件后缀。

## 模块出口必须在`module.exports`上
模块的出口地址是`exports`，它是一个空对象，因此可以直接在上面添加属性和方法，如：
```js
exports.name = 'cloudcome';
exports.sayName = function(){
    alert(this.name):
};
```
如果模块的出口是一个函数，那么就必须覆盖`exports`：
```js
module.exports = function(name){
	alert(name);
};
```





