/*!
 * porter
 * @author ydr.me
 * @create 2014-10-21 14:52
 */

(function () {
    'use strict';

    var regUpPath = /\.\.\//g;
    var regComment = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
    var regRequire = /require\(["'](.*?)["']\)/g;
    var noop = function () {
        // ignore
    };
    var meNode = _getMeNode();
    var main = _getData(meNode, 'main');
    var base = _getData(meNode, 'base') || _getPathname(meNode.getAttribute('src'));
    var containerNode = document.body || document.documentElement || meNode.parentNode;
    var HOST = location.protocol + '//' + location.host;
    var CWF = _pathJoin(location.pathname, base);
    var modules = {};

    if (!main) {
        throw new Error('can not found javascript main file');
    }

    window.define = function (factory) {
        var the = {
            dirname: CWF
        };
        var require = function (path) {
//            _loadScript(this.dirname, path);
        };
        var requires;

        if (_isFunction(factory)) {
            requires = _parseRequires(factory.toString());
            console.log(requires);
        }
    };

    _loadScript(main);


    /**
     * 模块递归加载
     * @param file
     * @private
     */
    function _loadModules(file) {
        _ajaxScript(file, function (err, data) {
            if (err) {
                return !1;
            }

            var requires = _parseRequires(data);

            if(requires.length){
                requires.forEach(function (require) {
                    _loadModules(require);
                });
            }else{
                _runModules();
            }
        });
    }


    /**
     * 执行模块
     * @private
     */
    function _runModules() {
        for(var i in modules){
            modules[i]();
        }
    }


    /**
     * 获取自身节点
     * @returns {Node}
     * @private
     */
    function _getMeNode() {
        var scripts = document.getElementsByTagName('script');

        return scripts[scripts.length - 1];
    }


    /**
     * 异步加载脚本
     * @param src {String} 加载路径
     * @param [callback] {Function} 回调
     * @private
     */
    function _ajaxScript(src, callback) {
        var xhr = new XMLHttpRequest();
        var url = CWF = _pathJoin(_getPathname(CWF), src);
        var time = Date.now();
        var done = function (err, text) {
            if (!err) {
                console.log(HOST + url, (Date.now() - time) + 'ms');
                modules[url] = text;
            }

            (callback || noop)(err, text);
        };

        xhr.onload = function () {
            if (xhr.status === 200 || xhr.status === 304) {
                done(null, xhr.responseText);
            } else {
                done(new Error(xhr.responseType));
            }
        };
        xhr.onerror = done;
        xhr.open('GET', url);
        xhr.send(null);
    }


    /**
     * 异步加载并执行脚本
     * @param src {String} 加载路径
     * @param [callback] {Function} 回调
     * @private
     */
    function _loadScript(src, callback) {
        base = _getPathname(base);

        var script = document.createElement('script');
        var url = CWF =_pathJoin(_getPathname(CWF), src);
        var time = Date.now();
        var done = function (err) {
            if (!err) {
                console.log(HOST + url, (Date.now() - time) + 'ms');
            }

            (callback || noop)(err);
        };

        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = done;
        script.onerror = done;
        containerNode.appendChild(script);
    }


    /**
     * 判断对象是否为 Function 实例
     * @param obj
     * @returns {boolean}
     * @private
     */
    function _isFunction(obj) {
        return typeof obj === 'function';
    }


    /**
     * 获取文件所在的路径
     * @param file
     * @private
     */
    function _getPathname(file) {
        return file.replace(/\/[^\/]+$/, '/');
    }


    /**
     * 切换路径，必须是路径
     * @param {String} from 文件夹起始路径，路径结尾是文件夹名
     * @param {String} to 文件终点路径
     * @private
     *
     * @example
     * from /ab/cd.js
     * to   ../de.js
     * =>   /de.js
     */

    function _pathJoin(from, to) {
        var fromPath;
        var toDepth = 0;

        // 修复起点
        if (from.slice(-1) !== '/') {
            from += '/';
        }

        // 修复终点
        if (!/^\.|\//.test(to)) {
            to = './' + to;
        }

        // 当前以下
        if (to.indexOf('./') === 0) {
            return from + to.slice(2);
        }
        // 绝对路径
        if (to.indexOf('/') === 0) {
            return to;
        }
        // 向上查找
        else if (to.indexOf('../') === 0) {
            fromPath = from.slice(1, -1).split('/');
            toDepth = to.match(regUpPath).length;

            if (toDepth > fromPath.length) {
                throw new Error('can not change path from `' + from + '` to `' + to + '`');
            }

            while (toDepth-- > 0) {
                fromPath.pop();
            }

            fromPath = fromPath.join('/');

            return (fromPath ? '/' : '') +
                (fromPath ? fromPath : '/') +
                (fromPath ? '/' : '') +
                to.replace(regUpPath, '');
        } else {
            throw new Error('can not change path from `' + from + '` to `' + to + '`');
        }
    }


    /**
     * 获取节点的 data 值
     * @param node
     * @param name
     * @returns {*}
     * @private
     */
    function _getData(node, name) {
        return node.dataset[name];
    }


    /**
     * 解析出当前文本中的依赖信息，返回依赖数组
     * @param data
     * @returns {Array}
     * @private
     */
    function _parseRequires(data) {
        data = data.replace(regComment, '');
        var requires = [];
        var matches;
        var require;

        while ((matches = regRequire.exec(data)) !== null) {
            require = matches[1];
            if (requires.indexOf(require) === -1) {
                requires.push(require);
            }
        }

        return requires;
    }
})();

