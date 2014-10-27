# 推荐开发脚手架
按照以下步骤来搭建开发脚手架，能够非常平稳有序的开发和发布。

## 推荐的文件结构
<pre>
- src 开发环境文件夹
   - coolie.json 构建配置
   - coolie.js 苦力加载器
   - coolie-config.js 苦力加载配置
   - libs 脚本库
   - widget 组件库
   - ui UI库
   - page 页面出口脚本
       - signin.js
       - signup.js
       - home
           - page1.js
           - page2.js
       - user
           - page1.js
           - page2.js
- dest 生产环境文件夹
   - ... 省略，与开发环境一一对应
</pre>

- Q：为什么是这样的结构？
- A：开发环境与生产环境的脚本完全隔离，利于维护和构建操作。在开发模式下，脚本的根目录指向`src`，在生产环境下脚本
的根目录，切换到`dest`。
例如，在`nodejs`中使用`express`可以这样：
```js
if(app.get('env') === 'development'){
    app.use('/js', express.static(__dirname + '/src'));
}else{
    app.use('/js', express.static(__dirname + '/dest'));
}
```


## 推荐的构建配置
```
{
    "dest": "../dest/",
    "main": "./page/**/*.js",
    "coolie-config.js": "./coolie-config.js",
    "copyFiles": "./coolie.js"
}
```
- `dest` 构建结果目录。
- `main` 构建入口模块，可以使用通配符，也可以是数组。
- `coolie-config.js` 加载器的配置文件，构建操作会修改版本号，因此需要它。
- `copyFiles` 原样复制的文件，比如加载器脚本。
- 这些配置都可以使用`coolie json [path]`命令生成。


## 推荐的加载器配置
```
coolie.config({
   base: './page/',
   version: ''
}).use();
```
- `base` 入口模块的相对路径，该值相对于`coolie.js`。
- `version` URL后面的版本号，构建操作会重写该值。


