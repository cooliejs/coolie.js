/*!
 * coolie 苦力
 * @author ydr.me
 * @create 2014-10-21 14:52
 */

(function () {
    'use strict';

    // 该正则取自 seajs
    var REG_REQUIRE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
    var REG_SLASH = /\\\\/g;
    var REG_UP_PATH = /\.\.\//g;
    var REG_READY_STATE_CHANGE = /loaded|complete/;
    var REG_FILE_BASENAME = /\/([^\/]+)$/;
    var REG_BEGIN_TYPE = /^.*?\//;
    var REG_END_PART = /[^\/]+\/$/;
    var REG_HOST = /^.*\/\/[^\/]*/;
    // 入口模块
    var mainMoule;
    // 入口模块是否为匿名模块
    var isMainAnonymous;
    // 当前脚本
    var currentScript = _getCurrentScript();
    var containerNode = currentScript.parentNode;
    var mePath = _getPathname(_pathJoin(location.pathname, currentScript.getAttribute('src')));
    // 配置
    var config = {
        base: mePath
    };
    var modulesCache = {};
    var modules = {};
    // 依赖长度
    var requireLength = 0;
    // 完成加载长度
    var doneLength = 0;
    // 加载依赖队列
    var dependencies = [];


    /**
     * 定义一个模块
     * @namespace define
     * @param {String} [id] 模块id
     * @param {Array} [deps] 模块依赖
     * @param {Function} factory 模块方法
     */
    window.define = function (id, deps, factory) {
        var args = arguments;
        var isAnonymous = args.length === 1;

        if (isMainAnonymous === undefined) {
            isMainAnonymous = isAnonymous;
        }

        // define(fn);
        if (isAnonymous) {
            factory = args[0];
            id = '';
        } else {
            if (!_isString(id)) {
                throw new Error('module id must be a string');
            }

            // define(id, fn);
            if (_isFunction(args[1])) {
                factory = args[1];
                deps = [];
            }

            if (!_isArray(deps)) {
                throw new Error('module dependencies must be an array');
            }
        }

        if (!_isFunction(factory)) {
            throw new Error('module factory must be a function');
        }


        deps = isAnonymous ? _parseRequires(factory.toString()) : deps;
        factory = factory;

        dependencies.push([id, deps, factory]);
    };


    /**
     * @namespace coolie
     * @type {{config: config, use: use}}
     */
    window.coolie = {
        /**
         * 配置 coolie
         * @param cnf {Object} 配置
         * @returns {coolie}
         */
        config: function (cnf) {
            cnf = cnf || {};

            config.base = cnf.base ? _pathJoin(mePath, cnf.base) : mePath;
            config.version = cnf.version;

            return this;
        },


        /**
         * 执行入口模块
         * @param main {String} 入口模块ID
         * @returns {coolie}
         */
        use: function (main) {
            if (!_isString(config.base)) {
                throw new Error('coolie config `base` property must be a string');
            }

            if (!_isString(main)) {
                throw new Error('main module must be a string');
            }

            mainMoule = _pathJoin(config.base, main);
            _loadScript(mainMoule);

            return this;
        }
    };


    /**
     * 脚本加载完毕保存模块
     * @param script
     * @private
     */
    function _saveModule(script) {
        var module = {};
        var meta;

        if (dependencies.length) {
            // 总是按照添加的脚本顺序执行，因此这里取出依赖的第0个元素
            meta = dependencies.shift();
            module.id = script.id;
            module.deps = meta[1];
            module.factory = meta[2];

            // 包装
            _wrapModule(module);

            if (!modules[module.id]) {
                modules[module.id] = module;
            }

            if (module.deps.length) {
                _loadRequeire(module.id, module.deps);
            }
        }

        // （依赖全部加载完成 || 入口同步机制） && 解析完成
        if (requireLength === doneLength) {
            _execModule(mainMoule);
        }
    }


    /**
     * 加载依赖，拉到外面来构造独立作用域，防止执行define切换路径影响到路径匹配
     * @param relativeTo
     * @param deps
     * @private
     */
    function _loadRequeire(relativeTo, deps) {
        var path = _getPathname(relativeTo);

        _each(deps, function (i, dep) {
            var id = _pathJoin(path, dep);
            _loadScript(id);
        });
    }


    /**
     * 模块入栈
     * @param isAnonymous 是否匿名
     * @param deps 依赖
     * @param factory 函数
     * @private
     */
    function _wrapModule(module) {
        module.exports = {};
        module.exec = (function () {
            var require = function (dep) {
                var depId = _pathJoin(_getPathname(module.id), dep);

                if (!modules[depId]) {
                    throw new Error('can not found module `' + depId + '`, require in `' + module.id + '`');
                }

                return modules[depId].exec();
            };

            return function () {
                module.factory.call(window, require, module.exports, module);
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

        modules[module].exec();
    }


    /**
     * 异步加载并执行脚本
     * @param src {String} 脚本完整路径
     * @private
     */
    function _loadScript(src) {
        var script;
        var time;
        var complete;

        if (modulesCache[src]) {
            return !1;
        }

        modulesCache[src] = 1;
        requireLength++;
        script = document.createElement('script');
        time = Date.now();
        complete = function (err) {
            if (!err) {
                console.log(src, (Date.now() - time) + 'ms');
                doneLength++;
                _saveModule(script);
            }

            script.onload = script.onerror = script.onreadystatechange = null;
            containerNode.removeChild(script);
        };

        script.id = src;
        script.async = true;
        script.defer = true;
        script.src = _addRequestVersion(src);
        script.onload = function () {
            complete();
        };
        script.onerror = function (err) {
            complete(err);
        };
        script.onreadystatechange = function () {
            if (REG_READY_STATE_CHANGE.test(script.readyState)) {
                complete();
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
        var fromHost = (from.match(REG_HOST) || [''])[0];
        var fromBeiginType = from.replace(REG_HOST, '').match(REG_BEGIN_TYPE);
        var toBeginType = to.replace(REG_HOST, '').match(REG_BEGIN_TYPE);
        var toDepth = 0;
        var from2 = from.replace(REG_HOST, '');
        var to2 = to;

        if (!fromBeiginType) {
            from2 = './' + from2;
        }

        if (from2.slice(-1) !== '/') {
            from2 += '/';
        }

        if (toBeginType) {
            toBeginType = toBeginType[0];
        } else {
            to2 = './' + to2;
            toBeginType = './';
        }

        switch (toBeginType) {
            case './':
                return fromHost + from2 + to2.slice(2);

            case '../':
                toDepth = to2.match(REG_UP_PATH).length;

                while (toDepth-- > 0) {
                    if (!REG_END_PART.test(from2)) {
                        throw new Error('can not change path from `' + from + '` to `' + to + '`');
                    }

                    from2 = from2.replace(REG_END_PART, '');
                }

                return fromHost + from2 + to2.replace(REG_UP_PATH, '');

            default:
                return to2;
        }
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
                requires.push(m2);
            }
        });

        return requires;
    }


    /**
     * 判断是否为数组
     * @param obj
     * @returns {*|boolean}
     * @private
     */
    function _isArray(obj) {
        return obj && obj instanceof  Array;
    }


    /**
     * 判断是否为函数
     * @param obj
     * @returns {boolean}
     * @private
     */
    function _isFunction(obj) {
        return typeof obj === 'function';
    }


    /**
     * 判断是否为字符串
     * @param obj
     * @returns {boolean}
     * @private
     */
    function _isString(obj) {
        return typeof obj === 'string';
    }


    /**
     * 遍历
     * @param list
     * @param callback
     * @private
     */
    function _each(list, callback) {
        var i;
        var j;

        if (_isArray(list)) {
            for (i = 0, j = list.length; i < j; i++) {
                callback(i, list[i]);
            }
        } else if (typeof list === 'object') {
            for (i in list) {
                if (list.hasOwnProperty(i)) {
                    callback(i, list[i]);
                }
            }
        }
    }


    /**
     * 添加请求版本号
     * @param str
     * @returns {String}
     * @private
     */
    function _addRequestVersion(str) {
        return config.version ?
            str + (str.indexOf('?') > -1 ? '&' : '?') + '_=' + encodeURIComponent(config.version) :
            str;
    }


    /**
     * 获取当前脚本
     * @returns {Node}
     * @private
     */
    function _getCurrentScript() {
        var scripts = document.getElementsByTagName('script');

        return scripts[scripts.length - 1];
    }
})();

