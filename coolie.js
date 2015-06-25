/*!
 * coolie 苦力
 * @author ydr.me
 * @version 0.14.0
 * @license MIT
 */


/**
 * 路径关系
 * coolie.js => page
 * coolie-config.js => coolie.js
 * base => coolie-config.js
 */


(function () {
    'use strict';

    var win = this;

    /**
     * 如果 coolie 已经运行完毕，则不必重新运行
     */
    if (win.coolie) {
        return;
    }


    // 常量
    var CONST_IMAGE = 'image';
    var CONST_JSON = 'json';
    var CONST_TEXT = 'text';
    var CONST_JS = 'js';
    var CONST_SRC = 'src';
    var CONST_SCRIPT = 'script';
    var CONST_COOLIE_MODULES = 'coolie modules';

    /**
     * coolie
     * @type {Object}
     */
    var coolie = {};


    /**
     * coolie 版本号
     * @type {string}
     */
    coolie.version = '0.14.0';


    /**
     * @type {undefined}
     */
    var udf;


    /**
     * 获取当前时间戳
     * @returns {Number}
     */
    var now = function () {
        return new Date().getTime();
    };


    /**
     * 当前时间
     * @type {Number}
     */
    var timeNow = 0;


    /**
     * document
     * @type {HTMLDocument}
     */
    var doc = win.document;


    /**
     * coolie 配置
     * @property base {String} 模块入口基准路径
     * @property version {Object|String} 入口模块版本 map
     * @property [debug=true] {Boolean} 是否为调试模式
     * @type {Object}
     */
    var coolieConfig = {};


    /**
     * coolie 回调列表
     * @type {Array}
     */
    var coolieCallbacks = [];


    /**
     * 判断数据类型
     * @param obj
     * @returns {string}
     */
    var typeis = function (obj) {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    };


    /**
     * 判断是否为数组
     * @param obj
     * @returns {Boolean}
     * @private
     */
    var isArray = function (obj) {
        return typeis(obj) === 'array';
    };


    /**
     * 判断是否为函数
     * @param obj
     * @returns {Boolean}
     * @private
     */
    var isFunction = function (obj) {
        return typeis(obj) === 'function';
    };


    /**
     * 判断是否为字符串
     * @param obj
     * @returns {Boolean}
     * @private
     */
    var isString = function (obj) {
        return typeis(obj) === 'string';
    };


    /**
     * 遍历
     * @param list
     * @param callback {Function} 返回 false，中断当前循环
     * @param [isReverse=false] {Boolean} 是否反序
     * @private
     */
    var each = function (list, callback, isReverse) {
        var i;
        var j;

        if (isArray(list)) {
            for (i = isReverse ? list.length - 1 : 0, j = isReverse ? 0 : list.length;
                 isReverse ? i > j : i < j;
                 isReverse ? i-- : i++) {
                if (callback(i, list[i]) === false) {
                    break;
                }
            }
        } else if (typeof(list) === 'object') {
            for (i in list) {
                if (callback(i, list[i]) === false) {
                    break;
                }
            }
        }
    };


    /**
     * map1 是否全部匹配到 map2
     * @param map1
     * @param map2
     * @returns {boolean}
     */
    var matchMap = function (map1, map2) {
        for (var i in map1) {
            if (!map2[i]) {
                return false;
            }
        }

        return true;
    };


    /**
     * 定义 console，防止出错
     */
    var console = (function () {
        var ret = {};
        var hasConsole = win.console;
        var arr = ['log', 'warn', 'group', 'groupEnd'];

        each(arr, function (index, key) {
            ret[key] = function () {
                if (!coolieConfig.debug) {
                    return;
                }

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
     * 非目录结尾
     * @type {RegExp}
     */
    var REG_PATH_DIR = /\/[^/]+$/;


    /**
     * host
     * @type {RegExp}
     */
    var REG_HOST = /^((ftp|file|https?):)?\/\/[^\/]*/;


    /**
     * 忽略协议
     * @type {RegExp}
     */
    var REG_IGNORE_PROTOCOL = /^\/\//;


    /**
     * 获取路径所在的目录
     * @param path {String} 路径或目录
     * @param [isDir=false] {Boolean} 本身是目录
     * @returns {*}
     */
    var getPathDir = function (path, isDir) {
        path = path.replace(REG_HOST, '');

        if (path === '/') {
            return path;
        }

        return REG_PATH_DIR.test(path) ? (isDir ? path + '/' : path.replace(REG_PATH_DIR, '/')) : path;
    };


    /**
     * 判断是否为绝对路径
     * @type {RegExp}
     */
    var REG_PATH_ABSOLUTE = /^\/|((http|ftp)s?:\/\/)/;


    /**
     * 判断是否相对路径
     * @type {RegExp}
     */
    var REG_PATH_RELATIVE = /^(\.{1,2})\//;


    /**
     * 路径结尾
     * @type {RegExp}
     */
    var REG_PATH_END = /(\/[^/]+?)?\/$/;


    /**
     * 路径合并
     * @param from {String} 标准的起始目录
     * @param to {String} 标准的目标路径
     * @returns {string} 标准的合并路径
     *
     * @example
     * path.j('/', '/');
     * // => '/'
     *
     * path.j('/a/b/c/', '/d/e/f');
     * // => '/d/e/f'
     *
     * path.j('/a/b/c/', './d/e/f');
     * // => '/a/b/c/d/e/f'
     *
     * path.j('/a/b/c/', '../../d/e/f');
     * // => '/a/d/e/f'
     */
    var getPathJoin = function (from, to) {
        if (!to || REG_PATH_ABSOLUTE.test(to)) {
            return to;
        }

        var mathes;

        to = './' + to;

        while ((mathes = to.match(REG_PATH_RELATIVE))) {
            to = to.replace(REG_PATH_RELATIVE, '');

            if (mathes[1].length === 2) {
                from = from.replace(REG_PATH_END, '/');
            }
        }

        return from + to;
    };


    /**
     * 获取标签列表
     * @param tagName {String} 标签名称
     * @param [$parent] {Node|HTMLElement} 父节点
     * @returns {NodeList|*}
     */
    var getNodeList = function (tagName, $parent) {
        return ($parent || doc).getElementsByTagName(tagName);
    };


    /**
     * 文件后缀
     * @type {RegExp}
     */
    var REG_SUFFIX = /[\?#].*?$/;


    /**
     * 脚本后缀
     * @type {RegExp}
     */
    var REG_JS = /\.js($|\?)/i;


    /**
     * 清理 url
     * @param url {String} 原始 URL
     * @param [isSingleURL=false] 是否为独立 URL
     * @returns {String}
     */
    var cleanURL = function (url, isSingleURL) {
        url = url.replace(REG_SUFFIX, '');

        if (isSingleURL) {
            return url;
        }

        if (REG_PATH_END.test(url)) {
            url += 'index';
        }

        return url + (REG_JS.test(url) ? '' : '.' + CONST_JS);
    };


    /**
     * 获取 script 的绝对路径
     * @param script
     * @returns {*}
     */
    var getScriptURL = function (script) {
        return cleanURL(script.hasAttribute ?
            // non-IE6/7
            script.src :
            // @see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            script.getAttribute(CONST_SRC, 4));
    };


    /**
     * 获取 node 的 dataset 值
     * @param node
     * @param dataKey
     * @returns {string}
     */
    var getNodeDataset = function (node, dataKey) {
        return node.getAttribute('data-' + dataKey);
    };


    /**
     * 创建一个元素
     * @param tagName
     * @param [properties]
     * @returns {Element}
     */
    var createElement = function (tagName, properties) {
        var $node = doc.createElement(tagName);

        each(properties, function (key, val) {
            $node[key] = val;
        });

        return $node;
    };


    /**
     * 插入一个元素
     * @param $ele
     * @param [$parent]
     */
    var appendChild = function ($ele, $parent) {
        ($parent || $body || $html).appendChild($ele);
    };


    /**
     * 移除一个 element
     * @param $ele
     * @param $parent
     */
    var removeElement = function ($ele, $parent) {
        try {
            $ele.remove();
        } catch (err) {
            try {
                ($parent || doc).removeChild($ele);
            } catch (err) {
                // ignore
            }
        }
    };


    /**
     * 是否加载完毕
     * @type {RegExp}
     */
    var REG_LOAD_COMPLETE = /loaded|complete/;


    /**
     * html
     * @type {HTMLHtmlElement|*}
     */
    var $html = doc.documentElement;


    /**
     * body
     * @type {HTMLBodyElement|*}
     */
    var $body = doc.body;


    /**
     * 为了增加安全性，coolie 会复制一个 coolie.js 到文档末尾，
     * 然后，所有的模块都载入到一个独立的缓存块里，
     * 防止电信广告影响
     */
    var $cache = createElement('div', {
        id: CONST_COOLIE_MODULES + now()
    });


    // 添加到 body 里
    appendChild($cache);


    /**
     * 文件后缀
     * @type {RegExp}
     */
    var REG_EXT = /\.[^.]*$/;


    /**
     * 构造版本 URL
     * @param url
     * @returns {*}
     */
    var buildVersionURL = function (url) {
        if (!coolieConfig._v) {
            return url;
        }

        var version = isString(coolieConfig._v) ? coolieConfig._v : coolieConfig._v[url];

        if (!version) {
            return url;
        }

        return url.replace(REG_EXT, '.' + version + '$&');
    };


    /**
     * 最后一个添加的脚本
     * @type {null|Object}
     */
    var $lastScript = null;


    /**
     * 加载脚本
     * @param url {String} 脚本 URL
     * @param [isNotModule=false] {Boolean} 是否为非模块
     */
    var loadScript = function (url, isNotModule) {
        var url2 = buildVersionURL(url);
        var $script = createElement(CONST_SCRIPT, {
            src: url2 + (coolieConfig.cache === false ? '?_=' + now() : ''),
            id: url,
            async: true
        });
        var hasReady = false;
        var onready = function (eve) {
            if (hasReady) {
                return;
            }

            hasReady = true;

            if (eve && eve.type === 'error') {
                throw 'load script error\n' + url2;
            }

            if (isNotModule !== true) {
                $lastScript = $script;
                analyScriptModule($script);
            }
        };

        if ($script.onload !== udf) {
            $script.onload = $script.onerror = onready;
        } else {
            $script.onreadystatechange = function (eve) {
                if (REG_LOAD_COMPLETE.test($script.readyState)) {
                    eve = eve || win.event;
                    onready(eve);
                }
            };
        }

        appendChild($script, $cache);
    };


    /**
     * 解析字符串为 JSON 对象
     * @param url {String} url 地址
     * @param text {String} JSON 字符串
     * @returns {{}}
     */
    var parseJSON = function (url, text) {
        var json = {};

        try {
            json = JSON.parse(text);
        } catch (err1) {
            try {
                /* jshint evil: true */
                var fn = new Function('', 'return ' + text);
                json = fn();
            } catch (err2) {
                throw 'parse json error ' + url;
            }
        }

        return json;
    };


    /**
     * 加载文本模块
     * @param url {String} 文本 URL
     * @param type {String} 文本类型
     */
    var ajaxText = function (url, type) {
        var url2 = buildVersionURL(url);
        var xhr = new XMLHttpRequest();
        var hasComplete;
        var onready = function () {
            if (xhr.readyState === 4 && !hasComplete) {
                hasComplete = true;
                if (xhr.status === 200 || xhr.status === 304) {
                    defineModule({
                        _isAn: mainModule._isAn,
                        id: url,
                        url: url2,
                        deps: [],
                        factory: function () {
                            var code = xhr.responseText;

                            if (code && type === CONST_JSON) {
                                code = parseJSON(url, code);
                            }

                            return code;
                        }
                    });
                } else {
                    throw 'ajax error\n' + url2;
                }
            }
        };

        xhr.onload = xhr.onreadystatechange = xhr.onerror = xhr.onabort = xhr.ontimeout = onready;
        xhr.open('GET', url2);
        xhr.send(null);
    };


    /**
     * 包裹图片模块
     * @param id
     */
    var wrapImageModule = function (id) {
        defineModule({
            _isAn: mainModule._isAn,
            id: id,
            url: buildVersionURL(id),
            deps: [],
            factory: function () {
                return id;
            }
        });
    };


    /**
     * 获取当前脚本
     * @param [$parent] {*} 父级
     * @returns {*}
     */
    var getCurrentScript = function ($parent) {
        var scripts = getNodeList(CONST_SCRIPT, $parent);

        return scripts[scripts.length - 1];
    };


    /**
     * 当前运行的脚本
     * @type {Node}
     */
    var $currentScript = getCurrentScript();


    // 添加到缓存区
    appendChild($currentScript, $cache);


    //            -   -
    // 看我眼神，这种方式根本没办法阻止电信广告
    //
    //// 克隆一个伪脚本
    //var $cloneCoolie = createElement(CONST_SCRIPT, {
    //    src: currentScript.src
    //});
    //
    //
    //appendChild($cloneCoolie);


    /**
     * 获取 URL 的 host
     * @param url
     * @returns {*}
     */
    var getHost = function (url) {
        if (REG_IGNORE_PROTOCOL.test(url)) {
            url = location.protocol + url;
        }

        return (url.match(REG_HOST) || [])[0];
    };


    /**
     * coolie.js 绝对路径
     * @type {String}
     */
    var coolieJSURL = coolie.coolieJSURL = getScriptURL($currentScript);


    /**
     * coolie.js host
     * @type {String}
     */
    var coolieJSHost = getHost(coolieJSURL);


    /**
     * coolie.js data-config
     * @type {string}
     */
    var coolieJSDataConfig = getNodeDataset($currentScript, 'config');


    /**
     * coolie.js data-main
     * @type {string}
     */
    var coolieJSDataMain = getNodeDataset($currentScript, 'main');


    /**
     * coolie.js 绝对目录
     * @type {String}
     */
    var coolieJSAbsolutelyDir = getPathDir(coolieJSURL);


    /**
     * coolie-config.js 路径
     * @type {string}
     */
    var coolieConfigJSPath = coolieJSDataConfig ? getPathJoin(coolieJSAbsolutelyDir, coolieJSDataConfig) : null;


    /**
     * coolie-config.js 路径
     * @type {string}
     */
    var coolieConfigJSDir = coolieJSDataConfig ? getPathDir(coolieConfigJSPath) : null;


    /**
     * coolie-config.js URL
     * @type {string}
     */
    var coolieConfigJSURL = coolieJSDataConfig ? getPathJoin(coolieJSHost, coolieConfigJSPath) : null;


    /**
     * coolie-config.js host
     * @type {String}
     */
    var coolieConfigJSHost = (function () {
        if (!coolieJSDataConfig) {
            return null;
        }

        var host = getHost(coolieConfigJSURL);

        if (host) {
            return host;
        }

        host = coolieJSHost;
        coolieConfigJSURL = host + coolieConfigJSURL;

        return host;
    }());


    /**
     * 入口模块的基准路径
     * @type {String}
     */
    var mainModuleBaseDir = coolieConfigJSDir;


    /**
     * 入口模块
     * @type {Object}
     */
    var mainModule = {};


    /**
     * 是否已经执行了入口模块
     * @type {boolean}
     */
    var hasExecuteMain = false;


    /**
     * 依赖的模块
     * @type {{}}
     */
    var dependenceModules = {};


    /**
     * 定义模块数组
     * @type {Array}
     */
    var defineList = [];


    /**
     * 模块
     * @type {{}}
     */
    var modules = {};


    /**
     * 依赖长度，包括入口模块
     * @type {number}
     */
    var dependenceLength = 1;


    /**
     * 注册长度，包括入口模块
     * @type {number}
     */
    var defineLength = 0;


    /**
     * coolie 配置
     * @param config
     */
    coolie.config = function (config) {
        coolieConfig = config;
        coolieConfig.version = coolieConfig.version || {};

        if (coolieConfigJSURL) {
            mainModuleBaseDir = getPathJoin(coolieConfigJSDir, getPathDir(coolieConfig.base, true));
        } else {
            coolieConfigJSHost = getHost(config.base);
            mainModuleBaseDir = getPathDir(config.base)
        }

        if (isString(coolieConfig.version)) {
            coolieConfig._v = coolieConfig.version;
        } else {
            coolieConfig._v = {};
            each(coolieConfig.version, function (path, version) {
                coolieConfig._v[coolieConfigJSHost + getPathJoin(mainModuleBaseDir, path)] = version;
            });
        }

        if (coolieJSDataMain) {
            var mainModuleId = mainModule.url = cleanURL(coolieConfigJSHost + getPathJoin(mainModuleBaseDir, coolieJSDataMain));

            mainModule._dfn = false;
            dependenceModules[mainModuleId] = mainModule;
        }

        /**
         * 会在 config.debug 不为 false 的时候
         * 添加一个 DEBUG 到 window 上
         * @namespace DEBUG
         * @type {boolean}
         */
        win.DEBUG = config.debug = config.debug !== false;

        return coolie;
    };


    /**
     * 开始执行入口模块
     * @param [main] 手动指定入口模块地址
     * @returns {Object}
     */
    coolie.use = function (main) {
        if (hasExecuteMain) {
            return coolie;
        }

        hasExecuteMain = true;
        timeNow = now();

        if (main) {
            mainModule.url = coolieConfigJSHost + getPathJoin(mainModuleBaseDir, main);
            dependenceModules[mainModule.url] = mainModule;
        }

        if (!mainModule.url) {
            return coolie;
        }

        loadScript(mainModule.url);

        console.group(CONST_COOLIE_MODULES);

        return coolie;
    };


    /**
     * 添加模块加载器回调
     * @param callback
     */
    coolie.callback = function (callback) {
        if (mainModule._exd && isFunction(callback)) {
            callback.call(coolie, mainModule.exports);

            return coolie;
        }

        if (isFunction(callback)) {
            coolieCallbacks.push(callback);
        }

        return coolie;
    };


    /**
     * require 正则
     * @type {RegExp}
     * @link https://github.com/seajs/seajs/blob/master/dist/sea-debug.js
     */
    var REG_REQUIRE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;


    /**
     * 反斜杠
     * @type {RegExp}
     */
    var REG_SLASH = /\\\\/g;


    /**
     * require 类型
     * @type {RegExp}
     */
    var REG_REQUIRE_TYPE = /([^"']+)(?:['"]\s*?,\s*?['"]([^'"]*))?/;


    /**
     * 模块类型别名
     * @type {{image: string, text: string, html: string, css: string}}
     */
    var moduleTypeMap = {
        image: CONST_IMAGE,
        text: CONST_TEXT,
        html: CONST_TEXT,
        json: CONST_JSON,
        css: CONST_TEXT
    };


    /**
     * 解析代码里的依赖信息
     * @param code {String} 代码
     */
    var parseDependencies = function (code) {
        var requires = [];

        code.replace(REG_SLASH, '').replace(REG_REQUIRE, function ($0, $1, $2) {
            if ($2) {
                var matches = $2.match(REG_REQUIRE_TYPE);
                // require('1.js', 'js');
                var dep = {
                    name: cleanURL(matches[1], !!matches[2]),
                    type: matches[2] ? moduleTypeMap[matches[2].toLowerCase()] : CONST_JS
                };

                requires.push(dep);
            }
        });

        return requires;
    };


    /**
     * 分析脚本模块
     * @params $interactiveScript {HTMLScriptElement} 当前活动脚本
     */
    var analyScriptModule = function ($interactiveScript) {
        var isAn = true;
        var args = defineList.shift();

        if (!args) {
            return;
        }

        var id = args[0];
        var deps = args[1];
        var factory = args[2];
        var interactiveScriptId = $interactiveScript.id;
        var interactiveScriptURL = getScriptURL($interactiveScript);
        var interactiveScriptPath = getPathDir(interactiveScriptId);

        // define(id, deps, factory);
        if (isFunction(args[2])) {
            isAn = false;
        }
        // define(id, factory);
        else if (isFunction(args[1])) {
            id = null;
            deps = [];
            factory = args[1];
        }
        // define(factory);
        else if (isFunction(args[0])) {
            factory = args[0];
            deps = parseDependencies(factory.toString());
            id = null;
        }

        id = mainModule._dfn && mainModule._isAn ? interactiveScriptId : id || interactiveScriptId;

        var module = {
            _isAn: isAn,
            _path: interactiveScriptPath,
            _node: $interactiveScript,
            id: id,
            url: interactiveScriptURL,
            deps: deps,
            factory: factory
        };

        if (!mainModule.id) {
            // 具名模块
            if (!isAn) {
                dependenceModules[id] = dependenceModules[mainModule.url];
                delete dependenceModules[mainModule.url];
            }

            module._isMain = true;
            mainModule = module;
            mainModule._dfn = true;
        }

        var deps2 = [];

        each(deps, function (index, dep) {
            // ['1', '2']
            if (isString(dep)) {
                dep = {
                    id: dep
                };
            }

            if (mainModule._isAn) {
                var path = getPathJoin(interactiveScriptPath, dep.name);

                dep.id = cleanURL(coolieConfigJSHost + path, dep.type !== CONST_JS);
            }

            if (id === dep.id) {
                throw 'required myself: \n' + id;
            }

            if (modules[dep.id]) {
                each(modules[dep.id].deps, function (index, dep) {
                    if (dep === id) {
                        throw 'required circle: \n' + dep + '\n' + id;
                    }
                });
            }

            if (!dependenceModules[dep.id]) {
                deps2.push(dep.id);
                dependenceModules[dep.id] = true;
                dependenceLength++;

                if (mainModule._isAn) {
                    switch (dep.type) {
                        case CONST_TEXT:
                        case CONST_JSON:
                            ajaxText(dep.id, dep.type);
                            break;

                        case CONST_IMAGE:
                            wrapImageModule(dep.id);
                            break;

                        default :
                            loadScript(dep.id);
                    }
                }
            }
        });

        module.deps = deps2;
        defineModule(module);

        if (defineList.length && $lastScript) {
            analyScriptModule($lastScript);
        }
    };


    /**
     * 定义 module
     * @param module
     * @returns module
     */
    var defineModule = function (module) {
        module.exports = {};
        module._exe = (function () {
            var require = function (id, type) {
                var dep;

                if (mainModule._isAn) {
                    dep = {
                        name: id,
                        type: type || CONST_JS
                    };

                    id = coolieConfigJSHost + cleanURL(getPathJoin(module._path, dep.name), dep.type !== CONST_JS);
                }

                if (!modules[id]) {
                    throw 'can not found module \n' + id + '\nbut required in\n' + module.id;
                }

                return modules[id]._exe();
            };

            return function () {
                var id = module.id;

                if (module._exd) {
                    return modules[id].exports;
                } else {
                    module._exd = true;
                    modules[id].exports = module.factory.call(win, require, module.exports, module) || module.exports;

                    return modules[id].exports;
                }
            };
        })();

        modules[module.id] = module;
        defineLength++;
        console.log(module.id);

        if (!defineList.length &&
            defineLength >= dependenceLength &&
            matchMap(dependenceModules, modules) && !mainModule._exd) {
            if (coolieConfig.debug === false) {
                removeElement($cache, $body);
            }

            console.log('past ' + ( now() - timeNow) + 'ms');
            console.groupEnd(CONST_COOLIE_MODULES);
            mainModule._exe();
            each(coolieCallbacks, function (index, callback) {
                callback.call(coolie, mainModule.exports);
            });
        }
    };


    /**
     * 定义一个模块
     * @param {String} [id] 模块id
     * @param {Array} [deps] 模块依赖
     * @param {Function} factory 模块方法
     */
    var define = function (id, deps, factory) {
        defineList.push([id, deps, factory]);
    };


    // 加载配置脚本
    if (coolieJSDataConfig) {
        loadScript(coolieConfigJSURL, true);
    }


    /**
     * @namespace coolie
     * @type {Object}
     */
    win.coolie = coolie;


    /**
     * 当前使用的模块
     * @name coolie.modules
     * @property getHost {Function}
     */
    win.coolie.modules = modules;


    /**
     * 数组、对象遍历
     * @name coolie.each
     * @property getHost {Function}
     */
    win.coolie.each = each;


    /**
     * 获得 host
     * @name coolie.getHost
     * @property getHost {Function}
     */
    win.coolie.getHost = getHost;


    /**
     * 路径合并
     * @name coolie.getPathJoin
     * @property getHost {Function}
     */
    win.coolie.getPathJoin = getPathJoin;


    /**
     * 获得目录
     * @name coolie.getPathDir
     * @property getPathDir {Function}
     */
    win.coolie.getPathDir = getPathDir;


    /**
     * 获得当前脚本
     * @name coolie.getCurrentScript
     * @property getCurrentScript {Function}
     */
    win.coolie.getCurrentScript = getCurrentScript;


    /**
     * 获得脚本地址
     * @name coolie.getScriptURL
     * @property getScriptURL {Function}
     */
    win.coolie.getScriptURL = getScriptURL;


    /**
     * coolie 脚本标签 Node 对象
     * @name coolie.script
     * @property script {HTMLScriptElement}
     */
    win.coolie.script = $currentScript;


    /**
     * 加载 chunk 脚本
     * @name coolie.chunk
     * @param chunkList {String|Array}
     * @type {Function}
     */
    win.coolie.chunk = function (chunkList) {
        chunkList = isArray(chunkList) ? chunkList : [chunkList];

        each(chunkList, function (index, chunkId) {
            loadScript(coolieJSHost + getPathJoin(mainModuleBaseDir, chunkId));
        });
    };


    /**
     * @namespace define
     * @type {define}
     */
    win.define = define;
    win.define.amd = {};
    win.define.cmd = {};
}.call(this));
