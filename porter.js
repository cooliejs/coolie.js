/*!
 * porter
 * @author ydr.me
 * @create 2014-10-21 14:52
 */

(function () {
    'use strict';

    // 该正则取自 seajs
    var REG_REQUIRE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
    var REG_SLASH = /\\\\/g
    var REG_UP_PATH = /\.\.\//g;
    var REG_READY_STATE_CHANGE = /loaded|complete/;
    var HOST = location.protocol + '//' + location.host;
    var meNode = _getMeNode();
    var main = _getNodeData(meNode, 'main');
    var base = _getNodeData(meNode, 'base') || _getPathname(meNode.getAttribute('src'));
    var containerNode = document.body || document.documentElement || meNode.parentNode;
    // 当前解析文件
    var cwf = _pathJoin(location.pathname, base);
    var mainMoule = _pathJoin(_getPathname(cwf), main);
    var modules = {};
    var inParse = !0;
    // 依赖长度
    var requireLength = 0;
    // 完成加载长度
    var doneLength = 0;

    if (!main) {
        throw new Error('can not found javascript main file');
    }

    window.define = function (factory) {
        var requires;

        requireLength++;
        if (_isFunction(factory)) {
            requires = _parseRequires(factory.toString());
            factory.filename = cwf;
            _pushModule(cwf, requires, factory);

            if (requires.length) {
                requires.forEach(function (dep) {
                    var id = _pathJoin(_getPathname(cwf), dep);

                    _loadScript(id);
                });
            }else{
                inParse = !1;
            }
        }
    };


    _loadScript(mainMoule);


    function _pushModule(id, deps, factory) {
        modules[id] = (function () {
            var require = function (module) {
                var path = _getPathname(factory.filename);

                module = _pathJoin(path, module);

                if (!modules[module]) {
                    throw new Error('can not found module `' + module + '`, require in `' + id + '`');
                }

                return modules[module]();
            };

            var module = {
                id: id,
                dependencies: deps,
                uri: HOST + factory.filename,
                exports: {}
            };

            modules[id] = module;

            return function () {
                factory.call(window, require, module.exports, module);
                return module.exports;
            };
        })();
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
     * 异步加载并执行脚本
     * @param src {String} 脚本完整路径
     * @private
     */
    function _loadScript(src) {
        var script = document.createElement('script');
        var time = Date.now();
        var done = function (err) {
            if (!err) {
                console.log(HOST + src, (Date.now() - time) + 'ms');
            }

            script.onload = script.onerror = null;
            containerNode.removeChild(script);

            // 依赖全部加载完成 && 解析完成
            if(requireLength === ++doneLength && !inParse){
                modules[mainMoule]();
            }
        };

        cwf = script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = function () {
            done();
        };
        script.onerror = function (err) {
            done(err);
        };
        script.onreadystatechange = function () {
            if(REG_READY_STATE_CHANGE.test(script.readyState)){
                done();
            }
        };
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
            toDepth = to.match(REG_UP_PATH).length;

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
                to.replace(REG_UP_PATH, '');
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
    function _getNodeData(node, name) {
        return node.dataset[name];
    }


    /**
     * 解析出当前文本中的依赖信息，返回依赖数组
     * @param data
     * @returns {Array}
     * @private
     */
    function _parseRequires(code) {
        var requires = [];

        code.replace(REG_SLASH, '').replace(REG_REQUIRE, function (m, m1, m2) {
            if (m2) {
                requires.push(m2)
            }
        });

        return requires;
    }
})();

