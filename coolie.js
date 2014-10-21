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
    var REG_FILE_BASENAME = /\/([^\/]+)$/;
    var HOST = location.protocol + '//' + location.host;
    var meNode = _getMeNode();
    var main = _getNodeData(meNode, 'main');
    var base = _getNodeData(meNode, 'base') || _getPathname(meNode.getAttribute('src'));
    var containerNode = document.body || document.documentElement || meNode.parentNode;
    // 当前解析文件
    var cwf = _pathJoin(location.pathname, base);
    var mainMoule = _pathJoin(_getPathname(cwf), main);
    var modules = {};
    // 是否为同步加载机制，异步：开发环境（默认），一个模块一个文件；同步：生产环境，多个模块合并成一个文件
    var isSync = !1;
    // 是否正在解析
    var inParse = !0;
    // 依赖长度
    var requireLength = 0;
    // 完成加载长度
    var doneLength = 0;

    if (!main) {
        throw new Error('can not found javascript main file');
    }

    /**
     * 定义一个模块
     * @param {String} [id] 模块id
     * @param {Array} [deps] 模块依赖
     * @param {Function} factory 模块方法
     */
    window.define = function (id, deps, factory) {
        var args = arguments;

        isSync = args.length === 3;
        requireLength++;

        if (isSync) {
            if (typeof id !== 'string') {
                throw new Error('module id must be a string');
            }

            if (!Array.isArray(deps)) {
                throw new Error('module dependencies must be an array');
            }

            if (typeof factory !== 'function') {
                throw new Error('module factory must be a function');
            }
        } else {
            factory = args[0];
            id = '';
        }

        if (typeof factory === 'function') {
            deps = isSync ? deps : _parseRequires(factory.toString());
            factory.id = isSync ? id : cwf;
            _pushModule(deps, factory);

            // 同步加载 && 无依赖可解析
            if (isSync) {
                if (!deps.length) {
                    inParse = !1;
                }
            }
            // 异步加载
            else {
                if (deps.length) {
                    deps.forEach(function (dep) {
                        id = _pathJoin(_getPathname(cwf), dep);
                        _loadScript(id);
                    });
                } else {
                    inParse = !1;
                }
            }
        } else {
            throw new Error('module factory must be a function');
        }
    };


    _loadScript(mainMoule);


    /**
     * 模块入栈
     * @param deps
     * @param factory
     * @private
     */
    function _pushModule(deps, factory) {
        var id = factory.id;

        modules[id] = (function () {
            var require = function (module) {
                if (!isSync) {
                    module = _pathJoin(_getPathname(id), module);
                }

                if (!modules[module]) {
                    throw new Error('can not found module `' + module + '`, require in `' + id + '`');
                }

                return modules[module]();
            };

            var module = {
                id: id,
                dependencies: deps,
                uri: isSync ? HOST + cwf : id,
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
     * 模块入口执行
     * @param module
     * @private
     */
    function _execModule(module) {
        if (!modules[module]) {
            throw new Error('can not found module `' + module + '`');
        }

        modules[module]();
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
                doneLength++;
            }

            script.onload = script.onerror = null;
            containerNode.removeChild(script);

            // （依赖全部加载完成 || 同步机制） && 解析完成
            if ((requireLength === doneLength || isSync) && !inParse) {
                _execModule(isSync ? _getBasename(mainMoule) : mainMoule);
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
            if (REG_READY_STATE_CHANGE.test(script.readyState)) {
                done();
            }
        };
        containerNode.appendChild(script);
    }


    /**
     * 或者文件路径的文件层级
     * @param filepath
     * @private
     */
    function _getPathname(filepath) {
        return filepath.replace(REG_FILE_BASENAME, '/');
    }


    /**
     * 或者文件路径的文件名
     * @param filepath
     * @returns {*|string}
     * @private
     */
    function _getBasename(filepath) {
        return (filepath.match(REG_FILE_BASENAME) || ['', ''])[1];
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

