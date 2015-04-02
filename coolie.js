/*!
 * coolie 苦力
 * @author ydr.me
 * @version 0.6.3
 * @license MIT
 */

(function () {
    'use strict';

    var version = '0.6.3';
    // 该正则取自 seajs
    var REG_REQUIRE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
    var REG_SLASH = /\\\\/g;
    var REG_UP_PATH = /\.\.\//g;
    var REG_THIS_PATH = /^.\//;
    var REG_FILE_BASENAME = /\/([^\/]+)$/;
    var REG_BEGIN_TYPE = /(\.{1,2}|^)\//;
    var REG_END_PART = /[^\/]+\/$/;
    var REG_SEARCH = /\?.*$/;
    var REG_SEARCH_HASH = /[?#].*$/;
    var REG_SUFFIX = /(\.[^.]*)$/;
    var REG_SCHEMA = /^https?:/i;
    var REG_HOST = /^(.*)\/\/[^/]*/;
    var REG_TEXT = /^(css|html|text)!/i;
    var REG_JS = /\.js$/i;
    //var REG_URL_CACHE = /^(.*)(\?|&)(_=.*?)($|\?|&)(.*)$/;
    //入口文件
    var mainFile;
    // 入口模块ID，构建之后情况
    var mainID;
    var execModule;
    var mainIsAnonymous = true;
    // 当前脚本
    var currentScript = _getCurrentScript();
    var supportOnload = 'onload' in currentScript;
    var containerNode = currentScript.parentNode;
    //var mePath = location.protocol + '//' + location.host + _getPathname(_joinPath(_getPathname(location.pathname), currentScript.getAttribute('src')));
    //var pagePath = _getPathname(location.href);
    var mePath = _getPathname(_getScriptAbsoluteSrc(currentScript));
    var meMain = _getData(currentScript, 'main');
    var meConfig = _getData(currentScript, 'config');
    // 配置
    var config = {};
    var moduleDepsMap = {};
    var modules = {};
    // 依赖长度
    var requireLength = 0;
    // 完成加载长度
    var doneLength = 0;
    // 加载依赖队列
    var defineModules = [];
    // 依赖数组
    var dependencyModules = [];
    var beginTime;
    var console = (function () {
        var ret = {};
        var hasConsole = window.console;
        var arr = ['log', 'warn', 'group', 'groupEnd'];

        _each(arr, function (index, key) {
            ret[key] = function () {
                if (hasConsole && hasConsole[key]) {
                    try {
                        hasConsole[key].apply(hasConsole, arguments);
                    } catch (err) {
                        //ignore
                    }
                }
            };
        });

        return ret;
    })();


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

        // 第一个运行 define 的为入口模块（？）
        if (!execModule) {
            mainIsAnonymous = isAnonymous;

            if (isAnonymous) {
                execModule = mainFile;
            } else {
                // define('0', ['1','2'], fn);
                // id = 0
                mainID = execModule = id;
                moduleDepsMap = {};
                moduleDepsMap[mainID] = {};
            }
        }

        // define(fn);
        if (isAnonymous) {
            id = '';
            deps = [];
            factory = args[0];
        } else {
            if (!_isString(id)) {
                throw 'module id must be a string';
            }

            // define(id, fn);
            if (_isFunction(args[1])) {
                factory = args[1];
                deps = [];
            }

            if (!_isArray(deps)) {
                throw 'module defineModules must be an array';
            }
        }

        if (!_isFunction(factory)) {
            throw 'module factory must be a function';
        }

        // 入口是匿名的
        if (mainIsAnonymous) {
            id = '';
            deps = _parseRequires(factory.toString());
        }

        defineModules.push([id, deps, factory]);
    };

    window.define.amd = {};
    window.define.cmd = {};


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
        version: version,

        /**
         * 模块出口
         * @name modules
         * @type Object
         */
        modules: modules,


        /**
         * 模块全部加载完成进行回调
         * @name callback
         * @type Function|Null
         */
        callback: null,


        /**
         * 配置 coolie
         * @param [cnf] {Object} 配置
         * @param [cnf.base] {String} 基础路径，相对于`coolie.js`
         * @param [cnf.version] {String|Object} 版本号，字符串修改的是所有请求模块的querystring，而对象值修改的是某个模块的版本号（推荐）
         * @returns {coolie}
         */
        config: function (cnf) {
            cnf = cnf || {};

            config.base = cnf.base ? _joinPath(mePath, cnf.base) : mePath;
            config.version = cnf.version;
            config.cache = !!cnf.cache;

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
                    console.warn('attribute main is `' + meMain + '`, but use main is `' + main + '`');
                }

                main = meMain;
            }

            mainFile = _joinPath(config.base, main);
            beginTime = _now();
            console.group('coolie modules');
            _loadModule(mainFile);

            return this;
        }
    };


    if (meConfig) {
        _loadScript(_cacheURL(_joinPath(mePath, meConfig)));
    }


    /**
     * 脚本加载完毕保存模块
     * @param [scriptORxhr] script对象或xhr对象
     * @param [id] xhr 请求的地址
     * @private
     */
    function _saveModule(scriptORxhr, id) {
        var module = {};
        var meta;
        var script;
        var xhr;

        // ajax text
        if (arguments.length === 2) {
            xhr = scriptORxhr;
            // 是否命名
            module._isAnonymous = false;
            // 模块ID
            module._id = id;
            // 模块类型
            module._type = 'ajax';
            // 模块目录
            module._path = _getPathname(id);
            // 模块依赖
            module._deps = [];
            // 模块原始方法
            module._factory = function (require, exports, module) {
                module.exports = xhr.responseText || '';
                xhr = null;
            };
            // 包装
            // 添加 module._exec 执行函数
            _wrapModule(module);
            modules[module._id] = module;
            moduleDepsMap[module._id] = {};
        }
        // load/local script
        else if (defineModules.length) {
            script = scriptORxhr;
            // 总是按照添加的脚本顺序执行，因此这里取出依赖的第0个元素
            meta = defineModules.shift();

            // 是否为匿名模块
            module._isAnonymous = meta[0] === '';

            // 模块ID
            // 匿名：模块加载的路径
            // 具名：模块的ID
            module._id = meta[0] || script.id;
            module._type = meta[0] ? 'local' : 'script';
            script = null;

            // 模块所在路径
            module._path = module._isAnonymous ? _getPathname(module._id) : '';

            // 模块依赖数组
            module._deps = meta[1];

            // 模块出厂函数
            module._factory = meta[2];

            // 包装
            // 添加 module._exec 执行函数
            _wrapModule(module);

            modules[module._id] = module;
            moduleDepsMap[module._id] = {};

            if (module._deps.length) {
                _each(module._deps, function (i, dep) {
                    // 匿名模块：依赖采用相对路径方式
                    // 具名模块：依赖采用绝对路径方式
                    var relDep = dep.replace(REG_TEXT, '');
                    var depId = module._isAnonymous ? _joinPath(module._path, relDep) : relDep;

                    if (moduleDepsMap[depId] && moduleDepsMap[depId][module._id]) {
                        throw 'module `' + module._id + '` and module `' + depId + '` make up a circular dependency relationship';
                    }

                    module._deps[i] = depId;
                    moduleDepsMap[module._id][depId] = 1;
                    dependencyModules.push({
                        id: depId,
                        by: module._id
                    });

                    if (!moduleDepsMap[depId]) {
                        moduleDepsMap[depId] = {};

                        if (REG_TEXT.test(dep)) {
                            _ajaxText(depId);
                        } else {
                            _loadModule(depId);
                        }
                    }
                });
            }
        }

        // 依赖全部加载完成
        if (requireLength === doneLength && !defineModules.length && execModule && modules[execModule]) {
            _each(dependencyModules, function (i, module) {
                if (!moduleDepsMap[module.id]) {
                    throw 'can not found module `' + module.id + '`, but module `' + module.by + '` dependence on it';
                }
            });

            _execModule(execModule);
            moduleDepsMap = null;
            defineModules = null;
            dependencyModules = null;
        }
    }


    /**
     * 模块入栈
     * @param module 模块
     * @private
     */
    function _wrapModule(module) {
        module.exports = {};
        module._exec = (function () {
            var require = function (dep) {
                var depId = module._isAnonymous ? _joinPath(_getPathname(module._id), _fixPath(dep)) : dep;

                if (!modules[depId]) {
                    throw 'can not found module `' + depId + '`, but required in `' + module._id + '`';
                }

                return modules[depId]._exec();
            };

            return function () {
                var id = module._id;

                if (module._hasExport) {
                    return modules[id].exports;
                } else {
                    module._hasExport = true;
                    modules[id].exports = module._factory.call(window, require, module.exports, module) || module.exports;

                    return modules[id].exports;
                }
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
            throw 'can not found module `' + module + '`';
        }

        console.log('past ' + (_now() - beginTime) + ' ms');
        console.groupEnd('coolie modules');
        modules[module]._exec();

        if (_isFunction(coolie.callback)) {
            coolie.callback(modules[module].exports);
        }
    }


    /**
     * 修正路径
     * @param path {String} 原始路径
     * @private
     *
     * @example
     * "text!path/to/a.css" => "path/to/a.css"
     * "text!path/to/a.css?abc123" => "path/to/a.css"
     * "text!path/to/a.css#abc123" => "path/to/a.css"
     * "text!path/to/a.css?abc123#abc123" => "path/to/a.css"
     * "path/to/a.min.js?abc123" => "path/to/a.min.js"
     * "path/to/a" => "path/to/a.js"
     * "path/to/a.php#" => "path/to/a.php"
     * "path/to/a/" => "path/to/a/index.js"
     * "path/to/a.js" => "path/to/a.js"
     */
    function _fixPath(path) {
        // 文本路径
        if (REG_TEXT.test(path)) {
            return path.replace(REG_SEARCH_HASH, '').replace(REG_TEXT, '');
        }

        if (path.indexOf('?') > -1) {
            return path;
        }

        var lastChar = path.slice(-1);

        switch (lastChar) {
            case '#':
                return path.slice(0, -1);

            case '/':
                return path + 'index.js';

            default :
                return REG_JS.test(path) ? path : path + '.js';
        }
    }


    /**
     * 加载脚本并回调
     * @param url
     * @param callback
     * @param [id]
     * @private
     */
    function _loadScript(url, callback, id) {
        var script = document.createElement('script');
        var onload = function () {
            containerNode.removeChild(script);

            if (_isFunction(callback)) {
                callback.apply(this, arguments);
            }
        };

        script.id = id;
        script.src = url;
        script.async = true;
        script.defer = true;
        containerNode.appendChild(script);

        if (supportOnload) {
            script.onload = onload;
        } else {
            script.onreadystatechange = function () {
                if (/loaded|complete/.test(script.readyState)) {
                    onload.call(this, arguments)
                }
            };
        }

        script.onerror = onload;
    }


    /**
     * 异步加载并执行脚本
     * @param src {String} 脚本完整路径
     * @private
     *
     * @example
     * // src为相对、绝对路径的都会被加载，如“./”、“../”、“/”、“//”或“http://”
     */
    function _loadModule(src) {
        src = _fixPath(src);

        var srcType = _getPathType(src);
        var time = _now();
        var url = _addRequestVersion(src);

        requireLength++;

        // 非路径型地址，主动触发 _saveModule
        if (!srcType) {
            // 这里使用延迟函数原因：
            // 1. 与 onload 有相同效果了
            // 2. 不再是同步函数了，不会递归执行，导致计数错误
            return setTimeout(function () {
                console.log('local module', url, (_now() - time) + 'ms');
                doneLength++;
                _saveModule();
            }, 1);
        }

        _loadScript(url, function (eve) {
            if (eve.type === 'error') {
                console.groupEnd('coolie modules');
            } else {
                console.log('script module', url, (_now() - time) + 'ms');
                doneLength++;
                _saveModule(this);
            }
        }, src);
    }


    /**
     * 异步加载文本内容
     * @param url
     * @private
     */
    function _ajaxText(url) {
        requireLength++;

        var xhr = new XMLHttpRequest();
        var time = _now();
        var hasComplete;
        var complete = function () {
            if (xhr.readyState === 4 && !hasComplete) {
                hasComplete = true;
                if (xhr.status === 200 || xhr.status === 304) {
                    console.log('text module', url, (_now() - time) + 'ms');
                    doneLength++;
                    _saveModule(xhr, url);
                } else {
                    throw 'can not ajax ' + url + ', response status is ' + xhr.status;
                }
            }
        };

        xhr.onload = xhr.onreadystatechange = xhr.onerror = xhr.onabort = xhr.ontimeout = complete;
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
     * 获取路径类型
     * @param path
     * @returns {String} 返回值有 “./”、“/”、“../”、“http:”、“https:”、“//”和“”（空字符串）
     * @private
     */
    function _getPathType(path) {
        var ret;

        if (REG_HOST.test(path)) {
            ret = path.match(REG_HOST);
            return (ret[1] || '//');
        }

        return (path.replace(REG_TEXT, '').match(REG_BEGIN_TYPE) || [''])[0];
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
    function _joinPath(from, to) {
        while (REG_THIS_PATH.test(to)) {
            to = to.replace(REG_THIS_PATH, '');
        }

        var fromHost = (from.match(REG_HOST) || [''])[0];
        var fromBeiginType = _getPathType(from);
        var toBeginType = _getPathType(to);
        var toDepth = 0;
        var from2 = from.replace(REG_HOST, '');
        var to2 = to;

        if (REG_HOST.test(toBeginType)) {
            return REG_SCHEMA.test(to) ? to : location.protocol + to;
        }

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
                        throw 'can not change path from `' + from + '` to `' + to + '`';
                    }

                    from2 = from2.replace(REG_END_PART, '');
                }

                return fromHost + from2 + to2.replace(REG_UP_PATH, '');

            default:
                return fromHost + to2;
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
     * 类型判断
     * @param obj
     * @returns {string}
     */
    function _typeis(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }


    /**
     * 判断是否为数组
     * @param obj
     * @returns {Boolean}
     * @private
     */
    function _isArray(obj) {
        return _typeis(obj) === 'array';
    }


    /**
     * 判断是否为函数
     * @param obj
     * @returns {Boolean}
     * @private
     */
    function _isFunction(obj) {
        return _typeis(obj) === 'function';
    }


    /**
     * 判断是否为字符串
     * @param obj
     * @returns {Boolean}
     * @private
     */
    function _isString(obj) {
        return _typeis(obj) === 'string';
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
     * @param url {String} 请求地址
     * @returns {String}
     * @private
     */
    function _addRequestVersion(url) {
        var type = _typeis(config.version);
        var relative;
        var version;
        var search;

        switch (type) {
            case 'string':
                return _cacheURL(url, encodeURIComponent(config.version));

            case 'object':
                relative = url.replace(config.base, '');
                search = (url.match(REG_SEARCH) || [''])[0];
                version = config.version[relative] || config.version['./' + relative];

                return version ?
                url.replace(REG_SEARCH, '').replace(REG_SUFFIX, '.' + version + '$1') + search :
                    url;

            default :
                return url;
        }
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
     * 获取 script 标签的绝对路径
     * @param node
     * @returns {string|CSSStyleDeclaration.src|*|src}
     */
    function _getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute('src', 4);
    }


    /**
     * 获取 data-main 属性值
     * @param node
     * @param dataName
     * @returns {String}
     * @private
     */
    function _getData(node, dataName) {
        return node.getAttribute('data-' + dataName);
    }


    /**
     * 获取当前时间戳
     * @returns {number}
     * @private
     */
    function _now() {
        return new Date().getTime();
    }


    /**
     * 构建无缓存 URL
     * @param url {String}
     * @returns {String}
     * @private
     */
    function _cacheURL(url, version) {
        return url + (url.indexOf('?') > -1 ? '&' : '?') + '_=' + (version || _now());
    }
})();

