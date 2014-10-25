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
    var REG_FILE_BASENAME = /\/([^\/]+)$/;
    var REG_BEGIN_TYPE = /^.*?\//;
    var REG_END_PART = /[^\/]+\/$/;
    var REG_HOST = /^.*\/\/[^\/]*/;
    var REG_TEXT = /^text!/i;
    // 入口模块
    var mainFile;
    var execModule;
    // 当前脚本
    var currentScript = _getCurrentScript();
    var containerNode = currentScript.parentNode;
    var mePath = _getPathname(_pathJoin(_getPathname(location.pathname), currentScript.getAttribute('src')));
    var meMain = _getMain(currentScript);
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

        if (execModule === undefined) {
            execModule = isAnonymous ? mainFile : id;
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
        dependencies.push([id, deps, factory]);
    };


    /**
     * @namespace coolie
     * @type {{version: String, config: Function, use: Function}}
     */
    window.coolie = {
        /**
         * 版本号
         * @name version
         * @type String
         */
        version: '0.1.0',


        /**
         * 配置 coolie
         * @param [cnf] {Object} 配置
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
         * @param [main] {String} 入口模块ID，为空时读取`data-main`
         * @returns {coolie}
         */
        use: function (main) {
            if (mainFile) {
                throw new Error('can not  execute `coolie.use` twice more');
            }

            if (!_isString(config.base)) {
                throw new Error('coolie config `base` property must be a string');
            }

            if (main && !_isString(main)) {
                throw new Error('main module must be a string');
            }

            if (meMain && meMain !== main) {
                if (main) {
                    console.log('inline main is `' + meMain + '`, use main is `' + main + '`');
                }

                main = meMain;
            }

            mainFile = _pathJoin(config.base, main);
            _loadScript(mainFile);

            return this;
        }
    };


    /**
     * 脚本加载完毕保存模块
     * @param [script]
     * @param [id]
     * @private
     */
    function _saveModule(script, id) {
        var module = {};
        var meta;

        // ajax text
        if (arguments.length === 2) {
            module.isAnonymous = !1;
            module.id = id;
            module.path = _getPathname(id);
            module.deps = [];
            module.factory = function (require, exports, module) {
                module.exports = script;
            };
            // 包装
            // 添加 module.exec 执行函数
            _wrapModule(module);
            if (!modules[module.id]) {
                modules[module.id] = module;
            }
        }
        // load/import script
        else if (dependencies.length) {
            // 总是按照添加的脚本顺序执行，因此这里取出依赖的第0个元素
            meta = dependencies.shift();

            // 是否为匿名模块
            module.isAnonymous = meta[0] === '';

            // 模块ID
            // 匿名：模块加载的路径
            // 具名：模块的ID
            module.id = meta[0] || script.id;

            // 模块所在路径
            module.path = module.isAnonymous ? _getPathname(module.id) : '';

            // 模块依赖数组
            module.deps = meta[1];

            // 模块出厂函数
            module.factory = meta[2];

            // 包装
            // 添加 module.exec 执行函数
            _wrapModule(module);

            if (!modules[module.id]) {
                modules[module.id] = module;
            }

            if (module.deps.length) {
                _each(module.deps, function (i, dep) {
                    // 匿名模块：依赖采用相对路径方式
                    // 具名模块：依赖采用绝对路径方式
                    var relDep = dep.replace(REG_TEXT, '');
                    var depId = module.isAnonymous ? _pathJoin(module.path, relDep) : relDep;

                    if (_isDepCircle(module.id, depId)) {
                        throw new Error('`' + module.id + '` and `' + depId + '` make up a circular dependencies relationship');
                    }

                    module.deps[i] = depId;

                    if (REG_TEXT.test(dep)) {
                        _ajaxText(depId);
                    } else {
                        _loadScript(depId);
                    }
                });
            }
        }


        // 依赖全部加载完成
        if (requireLength === doneLength && execModule && modules[execModule]) {
            _execModule(execModule);
        }
    }


    /**
     * 判断是否构成循环引用
     * @param src
     * @param dep
     * @returns {boolean}
     * @private
     */
    function _isDepCircle(src, dep) {
        var ret = !1;

        if (!modules[dep]) {
            return ret;
        }

        var deps = modules[dep].deps;

        _each(deps, function (i, _dep) {
            if (src === _dep) {
                ret = !0;
                return !1;
            }
        });

        return ret;
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
                dep = dep.replace(REG_TEXT, '');

                var depId = module.isAnonymous ? _pathJoin(_getPathname(module.id), dep) : dep;

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
     *
     * @example
     * src为相对、绝对路径的都会被加载，如“./”、“../”、“/”、“//”或“http://”
     */
    function _loadScript(src) {
        var script;
        var time = Date.now();
        var complete;
        var srcType = _getPathType(src);

        if (modulesCache[src]) {
            return !1;
        }

        modulesCache[src] = 1;
        requireLength++;

        // 非路径型地址，主动触发 _saveModule
        if (!srcType) {
            // 这里使用延迟函数原因：
            // 1. 与 onload 有相同效果了
            // 2. 不再是同步函数了，不会递归执行，导致计数错误
            return setTimeout(function () {
                console.log('>import module', src, '0ms');
                doneLength++;
                _saveModule();
            }, 1);
        }

        script = document.createElement('script');
        complete = function (err) {
            script.onload = script.onerror = null;

            if (!(err && err.constructor === Error)) {
                console.log('>load   module', src, (Date.now() - time) + 'ms');
                doneLength++;
                _saveModule(script);
            }

            containerNode.removeChild(script);
        };

        script.id = src;
        script.async = true;
        script.defer = true;
        script.src = _addRequestVersion(src);
        script.onload = script.onerror = complete;
        containerNode.appendChild(script);
    }


    /**
     * 异步加载文本内容
     * @param url
     * @private
     */
    function _ajaxText(url) {
        var xhr = new XMLHttpRequest();
        var time = Date.now();
        var complete = function () {
            if (xhr.status === 200 || xhr.status === 304) {
                console.log('>ajax   module', url, (Date.now() - time) + 'ms');
                doneLength++;
                _saveModule(xhr.responseText, url);
            } else {
                throw new Error('can not ajax ' + url + ', response status is ' + xhr.status);
            }
        };

        requireLength++;
        xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = complete;
        xhr.open('GET', url);
        xhr.send(null);
    }


    /**
     * 或者文件路径的文件层级
     * @param filepath
     * @returns {*|string}
     * @private
     */
    function _getPathname(filepath) {
        return filepath.replace(REG_FILE_BASENAME, '/');
    }


    /**
     * 获取文件路径的名称
     * @param filepath
     * @returns {*|string}
     * @private
     */
    function _getBasename(filepath){
        return (filepath.match(REG_FILE_BASENAME) || ['',''])[1];
    }


    /**
     * 获取路径类型
     * @param path
     * @returns {String} 返回值有 “./”、“/”、“../”和“”（空字符串）
     * @private
     */
    function _getPathType(path) {
        return (path
            .replace(REG_TEXT, '')
            .replace(REG_HOST, '')
            .match(REG_BEGIN_TYPE) || [''])[0];
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
        var fromBeiginType = _getPathType(from);
        var toBeginType = _getPathType(to);
        var toDepth = 0;
        var from2 = from.replace(REG_HOST, '');
        var to2 = to;

        if (!fromBeiginType) {
            from2 = './' + from2;
        }

        if (from2.slice(-1) !== '/') {
            from2 += '/';
        }

        if (!toBeginType) {
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
     * @param code {String} 源码
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
     * @returns {Boolean}
     * @private
     */
    function _isArray(obj) {
        return obj && obj instanceof  Array;
    }


    /**
     * 判断是否为函数
     * @param obj
     * @returns {Boolean}
     * @private
     */
    function _isFunction(obj) {
        return typeof obj === 'function';
    }


    /**
     * 判断是否为字符串
     * @param obj
     * @returns {Boolean}
     * @private
     */
    function _isString(obj) {
        return typeof obj === 'string';
    }


    /**
     * 遍历
     * @param list
     * @param callback {Function} 返回 false，中断当前循环
     * @private
     */
    function _each(list, callback) {
        var i;
        var j;

        if (_isArray(list)) {
            for (i = 0, j = list.length; i < j; i++) {
                if (callback(i, list[i]) === false) {
                    break;
                }
            }
        } else if (typeof list === 'object') {
            for (i in list) {
                if (list.hasOwnProperty(i)) {
                    if (callback(i, list[i]) === false) {
                        break;
                    }
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


    /**
     * 获取 data-main 属性值
     * @param node
     * @returns {String}
     * @private
     */
    function _getMain(node) {
        if (node.dataset) {
            return node.dataset.main;
        }

        return node.getAttribute('data-main');
    }

})();

