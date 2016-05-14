/**
 * coolie 苦力
 * @author seajs.org ydr.me
 * @version 1.4.7
 * @license MIT
 */


/**
 * Sea.js 3.0.1 | seajs.org/LICENSE.md
 */

// MIT LICENSE
// Copyright (c) 2009 - 2099 Frank Wang, http://seajs.org/
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function (global, undefined) {
    'use strict';

    var VERSION = '1.4.7';
    var COOLIE = 'coolie';

    /* istanbul ignore next */
    if (global.coolie) {
        return;
    }

    var noop = function () {
        // ignore
    };

    // Avoid conflicting when `sea.js` is loaded multiple times
    /* istanbul ignore next */
    if (global.seajs) {
        return;
    }

    var win = window;
    var doc = win.document;
    var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;

    // ==============================================================================
    // =================================== 判断相关 ==================================
    // ==============================================================================

    function isType(type) {
        return function (obj) {
            return {}.toString.call(obj) === "[object " + type + "]";
        };
    }

    var isObject = isType("Object");
    //var isString = isType("String");
    var isBoolean = isType("Boolean");
    var isArray = isType("Array");
    var isFunction = isType("Function");


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
                callback(i, list[i]);
            }
        } else if (typeof(list) === 'object') {
            for (i in list) {
                callback(i, list[i]);
            }
        }
    };


    /**
     * 当前时间戳
     * @returns {number}
     */
    var now = function () {
        return new Date().getTime();
    };


    /**
     * 全局 ID
     * @returns {Number}
     */
    var gid = (function () {
        var id = 0;
        return function () {
            return COOLIE + '-' + VERSION + '-module-' + now() + '-' + (id++);
        };
    }());


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
            /* istanbul ignore next */
            var err = 'parse json error\n' + url;

            /* istanbul ignore next */
            try {
                /* jshint evil: true */
                var fn = new Function('', 'return ' + text);
                json = fn();
            } catch (err2) {
                /* istanbul ignore next */
                throw err;
            }

            /* istanbul ignore next */
            if (!isObject(json) && !isArray(json)) {
                throw err;
            }

            /* istanbul ignore next */
            err = null;
        }

        return json;
    };


    /**
     * 加载文本模块
     * @param url {String} 文本 URL
     * @param callback {Function} 加载回调
     */
    var ajaxText = function (url, callback) {
        var xhr = XMLHttpRequest ? new XMLHttpRequest() : new global.ActiveXObject("Microsoft.XMLHTTP");
        var onready = function () {
            if (xhr && xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 304) {
                    callback(xhr.responseText);
                    xhr.onload = xhr.onreadystatechange = xhr.onerror = xhr.onabort = xhr.ontimeout = null;
                    xhr = null;
                } else {
                    /* istanbul ignore next */
                    throw 'ajax error\n' + url;
                }
            }
        };

        xhr.onload = xhr.onreadystatechange = xhr.onerror = xhr.onabort = xhr.ontimeout = onready;
        xhr.open('GET', url);
        xhr.send(null);
    };


    /**
     * 下一次
     * @param callback
     */
    var nextTick = function (callback) {
        setTimeout(function () {
            callback();
        }, 1);
    };


    var importStyle = (function () {
        var styleEl = doc.createElement('style');
        styleEl.setAttribute('type', 'text/css');
        styleEl.setAttribute('id', COOLIE + '-' + VERSION + '-style');
        head.appendChild(styleEl);
        // ie
        var stylesheet = styleEl.styleSheet;

        /**
         * 导入 style 样式
         * @param cssText
         */
        return function (cssText) {
            /* istanbul ignore next */
            if (stylesheet) {
                stylesheet.cssText += cssText;
            } else {
                styleEl.innerHTML += cssText;
            }

            return styleEl;
        };
    }());


    // ==============================================================================
    // =================================== 事件相关 ==================================
    // ==============================================================================

    var events = {};

    // Bind event
    var bind = function (name, callback) {
        var list = events[name] || (events[name] = []);
        list.push(callback);
    };


    // 仅执行一次
    var once = function (callback) {
        var excuted = false;
        return function () {
            if (excuted) {
                return;
            }

            excuted = true;
            return callback.apply(this, arguments);
        };
    };


    // Emit event, firing all bound callbacks. Callbacks receive the same
    // arguments as `emit` does, apart from the event name
    var emit = function (name, data) {
        var list = events[name];

        if (list) {
            // Copy callback lists to prevent modification
            list = list.slice();

            // Execute event callbacks, use index because it's the faster.
            //for (var i = 0, len = list.length; i < len; i++) {
            //    list[i](data);
            //}
            //
            each(list, function (index, callback) {
                callback(data);
            });
        }
    };


    // ==============================================================================
    // =================================== 路径相关 ==================================
    // ==============================================================================
    var reJSExtname = /\.js$/i;
    var reStaticPath = /^(.*:)?\/\//;
    var reAbsolutePath = /^\//;
    var reProtocol = /^.*:/;
    var LOCATION_HREF = location.href;
    var LOCATION_PROTOCOL = location.protocol;
    var LOCATION_BASE = LOCATION_PROTOCOL + '//' + location.host;
    var reThisPath = /\/\.\//g;
    var reNotURISlash = /\\/g;
    var reStartWidthSlash = /^\//;
    var reEndWidthSlash = /\/$/;
    var rePathBase = /^~\//;
    var rePathQuerystringHashstring = /[?#].*$/;
    // Ignore about:xxx and blob:xxx
    var reIgnoreProtocol = /^(about|blob):/;
    var rePathSep = /\//;
    var reURLBase = /^(.*):\/\/[^\/]*/;


    /**
     * 获取路径协议
     * @param path {string}
     * @returns {*}
     */
    var getPathProtocol = function (path) {
        var matches = path.match(reStaticPath);

        if (!matches) {
            return '';
        }

        var matched = matches[0];

        return reProtocol.test(matched) ? matched : LOCATION_PROTOCOL + matched;
    };


    /**
     * 获取 url base
     * @param url {string}
     * @returns {string}
     */
    var getURLBase = function (url) {
        var matched = url.match(reURLBase);
        return matched ? matched[0] : '';
    };


    /**
     * 格式化路径
     * @param path {string} 路径
     * @returns {*}
     */
    var normalizePath = function (path) {
        if (!path) {
            return '';
        }

        // ~ 相对于当前域
        if (rePathBase.test(path)) {
            path = LOCATION_BASE + path.slice(1);
        }

        var protocol = getPathProtocol(path);

        path = path
        // 去掉 query、hash
            .replace(rePathQuerystringHashstring, '')
            // 去掉协议
            .replace(reStaticPath, '')
            // 反斜杠摆正
            .replace(reNotURISlash, '/')
            // 去掉 ./
            .replace(reThisPath, '/');

        var pathList = path.split(rePathSep);
        var lastItem = '';
        var pathList2 = [];
        var lastPathFlag = '..';
        var slashFlag = '/';
        var startWidthSlash = reStartWidthSlash.test(path);
        var endWidthSlash = reEndWidthSlash.test(path);

        each(pathList, function (index, item) {
            if (item === lastPathFlag && lastItem && lastItem !== lastPathFlag) {
                pathList2.pop();
            } else {
                pathList2.push(item);
            }

            if (index) {
                lastItem = pathList2[pathList2.length - 1];
            }
        });

        path = pathList2.join(slashFlag);

        if (startWidthSlash && !reStartWidthSlash.test(path)) {
            path = slashFlag + path;
        }

        if (endWidthSlash && !reEndWidthSlash.test(path)) {
            path += slashFlag;
        }

        return protocol + path;
    };

    /**
     * 是否为静态路径
     * @param path
     * @returns {boolean}
     */
    var isStaticPath = function (path) {
        return reStaticPath.test(path);
    };


    /**
     * 是否为绝对路径
     * @param path
     * @returns {boolean}
     */
    var isAbsolutePath = function (path) {
        return !isStaticPath(path) && reAbsolutePath.test(path);
    };


    /**
     * 获取路径的目录
     * @param path
     */
    var getPathDirname = function (path) {
        if (!rePathSep.test(path)) {
            return path + '/';
        }

        path += reEndWidthSlash.test(path) ? '' : '/../';
        return normalizePath(path);
    };


    /**
     * 合并路径
     * @param from {String} 起始路径
     * @param to {String} 目标路径
     * @returns {String}
     */
    var resolvePath = function (from, to) {
        from = normalizePath(from);
        to = normalizePath(to);

        // 无 to
        if (!to) {
            return from;
        }

        // 如果 to 为静态，则直接返回
        if (isStaticPath(to)) {
            return to;
        }

        // 如果 to 为绝对，则加协议返回
        if (isAbsolutePath(to)) {
            return getURLBase(from) + to;
        }

        var fromDirname = getPathDirname(from);

        return normalizePath(fromDirname + to);
    };


    /**
     * 修正文件路径的后缀
     * @param path {string} 文件路径
     * @returns {string}
     */
    var fixFilepathExtname = function (path) {
        path = normalizePath(path);

        if (!path) {
            return path;
        }

        return path + (reJSExtname.test(path) ? '' : '.js');
    };


    /**
     * 修正目录路径，添加 index.js
     * @param path {string} 目录路径
     * @returns {string}
     */
    var fixDirnamePathIndex = function (path) {
        path = normalizePath(path);

        if (!path) {
            return path;
        }

        return path + (reEndWidthSlash.test(path) ? 'index.js' : '');
    };


    /**
     * 修正文件路径
     * @param path {string} 文件路径
     * @param isJS {Boolean} 是否为 js
     * @returns {string|*}
     */
    var fixFilePath = function (path, isJS) {
        path = fixDirnamePathIndex(path);

        if (isJS) {
            path = fixFilepathExtname(path);
        }

        return path;
    };


    /**
     * 处理模块文件路径
     * @param from
     * @param to
     * @param [isJS]
     * @returns {string|*}
     */
    var resolveModulePath = function (from, to, isJS) {
        return fixFilePath(resolvePath(from, to), isJS);
    };


    // @coolie ignore webworker
    // Check environment
    //var isWebWorker = typeof window === 'undefined' && typeof importScripts !== 'undefined' && isFunction(importScripts)


    /**
     * 获取当前工作目录
     * @returns {string}
     */
    var getCWDPath = function () {
        return reIgnoreProtocol.test(LOCATION_HREF) ? '' : getPathDirname(LOCATION_HREF);
    };


    /**
     * 获取 script 标签的决定路径
     * @param node
     * @returns {string}
     */
    var getScriptAbsoluteSrc = function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4);
    };


    /**
     * 获取 coolie script
     * @returns {string}
     */
    var getCoolieScript = function () {
        var scripts = doc.scripts;
        return scripts[scripts.length - 1];
    };


    /**
     * 获取 coolie 路径
     * @param loaderScript {Object} 加载器节点
     * @param cwd {string} 工作路径
     * @returns {string}
     */
    var getCooliePath = function (loaderScript, cwd) {
        loaderPath = getScriptAbsoluteSrc(loaderScript);
        return loaderPath || cwd;
    };


    var cwd = getCWDPath();
    var loaderScript = getCoolieScript();
    var loaderPath = getCooliePath(loaderScript, cwd);
    var loaderDir = getPathDirname(loaderPath);


    /**
     * util-request.js - The utilities for requesting script and style files
     * ref: tests/research/load-js-css/test.html
     */

    var currentlyAddingScript;

    function request(url, callback) {
        if (!url) {
            return;
        }

        var node = doc.createElement("script");

        addOnload(node, callback, url);

        node.async = true;
        node.src = url;

        // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
        // the end of the insert execution, so use `currentlyAddingScript` to
        // hold current node, for deriving url in `define` call
        currentlyAddingScript = node;

        head.appendChild(node);

        currentlyAddingScript = null;

        return node;
    }

    function addOnload(node, callback, url) {
        var supportOnload = "onload" in node;

        if (supportOnload) {
            node.onload = onload;
            node.onerror = function () {
                emit('error', {uri: url, node: node});
                onload(true);
            };
        }
        else {
            node.onreadystatechange = function () {
                if (/loaded|complete/.test(node.readyState)) {
                    onload();
                }
            };
        }

        function onload(error) {
            // Ensure only run once and handle memory leak in IE
            node.onload = node.onerror = node.onreadystatechange = null;

            // Remove the script to reduce memory leak
            head.removeChild(node);

            // Dereference the node
            node = null;

            callback(error);
        }
    }

    var interactiveScript;

    function getCurrentScript() {
        if (currentlyAddingScript) {
            return currentlyAddingScript;
        }

        // For IE6-9 browsers, the script onload event may not fire right
        // after the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script
        // ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === "interactive") {
            return interactiveScript;
        }

        var scripts = head.getElementsByTagName("script");

        each(scripts, function (index, script) {
            if (script.readyState === "interactive") {
                interactiveScript = script;
                return false;
            }
        }, true);

        return interactiveScript;
    }


    /**
     * require 正则
     * @type {RegExp}
     * @link https://github.com/seajs/seajs/blob/master/dist/sea-debug.js
     */
    var reRequire = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;


    /**
     * 反斜杠
     * @type {RegExp}
     */
    var reSlash = /\\\\/g;


    /**
     * require 类型
     * @type {RegExp}
     */
    var reRequireType = /([^"']+)(?:['"]\s*?,\s*?['"]([^'"]*))?/;


    /**
     * 模块类型别名
     * @type {{js: string, image: string, file: string, text: string, html: string, json: string, style: string, css: string}}
     */
    var moduleTypeMap = {
        js: 'js',
        image: 'file',
        file: 'file',
        text: 'text',
        html: 'text',
        json: 'json',
        css: 'text'
    };


    /**
     * 解析代码里的依赖信息
     * @param code {String} 代码
     */
    var parseDependencies = function (code) {
        var deps = [];
        var types = [];
        var outTypes = [];

        code.replace(reSlash, '').replace(reRequire, function ($0, $1, $2) {
            if ($2) {
                var matches = $2.match(reRequireType);
                var pipeline = (matches[2] ? matches[2].toLowerCase() : 'js').split('|');

                deps.push(matches[1]);
                types.push(moduleTypeMap[pipeline[0]]);
                outTypes.push(pipeline[1]);
            }
        });

        return [deps, types, outTypes];
    };


    /**
     * module.js - The core of module loader
     */

    var cachedMods = {};
    var anonymousMeta;

    var fetchingList = {};
    var fetchedList = {};
    var callbackList = {};
    var chunkLength = 0;
    var chunkMods = {};

    var STATUS = {
        // 1 - The `module.uri` is being fetched
        FETCHING: 1,
        // 2 - The meta data has been saved to cachedMods
        SAVED: 2,
        // 3 - The `module.dependencies` are being loaded
        LOADING: 3,
        // 4 - The module are ready to execute
        LOADED: 4,
        // 5 - The module is being executed
        EXECUTING: 5,
        // 6 - The `module.exports` is available
        EXECUTED: 6,
        // 7 - 404
        ERROR: 7
    };


    function Module(uri, deps, type, outType) {
        var the = this;

        the.raw = the.uri = the.id = uri;
        the.dependencies = deps;
        the.deps = {}; // Ref the dependence modules
        the.status = 0;
        the.type = type || 'js';
        the.outType = outType || the.type;
        the._entry = [];
    }

    // 默认为 cmd，当第一次 define 为匿名时，后续模块都视为匿名
    // 否则为 amd
    Module.cmd = null;

    var pro = Module.prototype;

    // Resolve module.dependencies
    pro.resolve = function () {
        var mod = this;
        var ids = mod.dependencies;
        var uris = [];

        //for (var i = 0, len = ids.length; i < len; i++) {
        //    uris[i] = Module.resolve(ids[i], mod.uri, mod.types ? mod.types[i] : 'js');
        //}
        each(ids, function (index, id) {
            uris[index] = Module.resolve(id, mod.uri, mod.types ? mod.types[index] : 'js');
        });

        return uris;
    };

    pro.pass = function () {
        var mod = this;
        var len = mod.dependencies.length;

        for (var i = 0; i < mod._entry.length; i++) {
            var entry = mod._entry[i];
            var count = 0;
            for (var j = 0; j < len; j++) {
                var m = mod.deps[mod.dependencies[j]];
                // If the module is unload and unused in the entry, pass entry to it
                if (m.status < STATUS.LOADED && !entry.history[m.uri]) {
                    entry.history[m.uri] = true;
                    count++;
                    m._entry.push(entry);
                    if (m.status === STATUS.LOADING) {
                        m.pass();
                    }
                }
            }
            // If has passed the entry to it's dependencies, modify the entry's count and del it in the module
            if (count > 0) {
                entry.remain += count - 1;
                mod._entry.shift();
                i--;
            }
        }
    };

    // Load module.dependencies and fire onload when all done
    pro.load = function () {
        var mod = this;

        // If the module is being loaded, just wait it onload call
        if (mod.status >= STATUS.LOADING) {
            return;
        }

        mod.status = STATUS.LOADING;


        // Emit `load` event for plugins such as combo plugin
        var uris = mod.resolve();
        emit('load', uris);

        each(uris, function (index, uri) {
            var depMod = Module.get(uri, [], mod.types ? mod.types[index] : 'js', mod.outTypes ? mod.outTypes[index] : 'js');

            depMod.async = mod.async;
            mod.deps[mod.dependencies[index]] = depMod;
        });

        // Pass entry to it's dependencies
        mod.pass();

        // If module has entries not be passed, call onload
        if (mod._entry.length) {
            mod.onload();
            return;
        }

        // Begin parallel loading
        var requestCache = {};

        each(uris, function (index, uri) {
            var m = Module.get(uri);

            if (m.status < STATUS.FETCHING) {
                m.fetch(requestCache);
            }
            else if (m.status === STATUS.SAVED) {
                m.load();
            }
        });

        // Send all requests at last to avoid cache bug in IE6-9. Issues#808
        each(requestCache, function (key) {
            if (requestCache[key]) {
                requestCache[key]();
            }
        });
    };

    // Call this method when module is loaded
    pro.onload = function () {
        var mod = this;
        mod.status = STATUS.LOADED;

        // When sometimes cached in IE, exec will occur before onload, make sure len is an number
        //for (var i = 0, len = (mod._entry || []).length; i < len; i++) {
        //    var entry = mod._entry[i];
        //    if (--entry.remain === 0) {
        //        entry.callback();
        //    }
        //}
        each(mod._entry || [], function (index, entry) {
            if (--entry.remain === 0) {
                entry.callback();
            }
        });

        delete mod._entry;
    };

    // Call this method when module is 404
    pro.error = function () {
        var mod = this;
        mod.onload();
        mod.status = STATUS.ERROR;
    };

    // Execute a module
    pro.exec = function () {
        var mod = this;

        // When module is executed, DO NOT execute it again. When module
        // is being executed, just return `module.exports` too, for avoiding
        // circularly calling
        if (mod.status >= STATUS.EXECUTING) {
            return mod.exports;
        }

        mod.status = STATUS.EXECUTING;

        if (mod._entry && !mod._entry.length) {
            delete mod._entry;
        }

        //non-cmd module has no property factory and exports
        if (!mod.factory) {
            mod.non = true;
            throw 'can not found module: ' + mod.uri;
        }

        // Create require
        var uri = mod.uri;

        function require(id, type) {
            var m = mod.deps[id] || Module.get(require.resolve(id, type), [], type);
            if (m.status === STATUS.ERROR) {
                throw 'module was broken: ' + m.uri;
            }
            return m.exec();
        }

        require.url = mod.id;

        require.resolve = function (id, type) {
            return Module.cmd ? Module.resolve(id, uri, type) : id;
        };

        require.async = function (mainId, callback) {
            // 非同步执行
            nextTick(function () {
                fetchingList = {};
                fetchedList = {};
                callbackList = {};
                Module.use(Module.cmd ? resolvePath(require.url, mainId) : mainId, callback, Module.asyncBase + gid(), true);
            });

            return require;
        };

        // Exec factory
        var factory = mod.factory;

        var exports = isFunction(factory) ?
            factory.call(mod.exports = {}, require, mod.exports, mod) :
            factory;

        if (exports === undefined) {
            exports = mod.exports;
        }

        mod.exports = exports;
        mod.status = STATUS.EXECUTED;

        // Emit `exec` event
        emit('exec', mod);

        return mod.exports;
    };

    // Fetch a module
    pro.fetch = function (requestCache) {
        var mod = this;
        var uri = mod.uri;

        mod.status = STATUS.FETCHING;

        // Emit `fetch` event for plugins such as combo plugin
        var emitData = {uri: uri};
        emit('fetch', emitData);
        var requestUri = emitData.requestUri || uri;

        // Empty uri or a non-CMD module
        if (!requestUri || fetchedList[requestUri]) {
            mod.load();
            return;
        }

        if (fetchingList[requestUri]) {
            callbackList[requestUri].push(mod);
            return;
        }

        fetchingList[requestUri] = true;
        callbackList[requestUri] = [mod];

        // Emit `request` event for plugins such as text plugin
        emit('request', emitData = {
            async: mod.async,
            type: mod.type,
            outType: mod.outType,
            uri: uri,
            requestUri: requestUri,
            onRequest: onRequest
        });

        if (!emitData.requested) {
            requestCache ?
                requestCache[emitData.requestUri] = sendRequest :
                sendRequest();
        }

        function sendRequest() {
            var node = request(emitData._url || emitData.requestUri, emitData.onRequest, emitData.charset, emitData.crossorigin);

            node.id = emitData.requestUri;
        }

        function onRequest(error) {
            delete fetchingList[requestUri];
            fetchedList[requestUri] = true;

            // Save meta data of anonymous module
            if (anonymousMeta) {
                Module.save(uri, anonymousMeta);
                anonymousMeta = null;
            }

            // Call callbacks
            var m, mods = callbackList[requestUri];
            delete callbackList[requestUri];
            while (mods && (m = mods.shift())) {
                // When 404 occurs, the params error will be true
                if (error === true) {
                    m.error();
                }
                else {
                    m.load();
                }
            }
        }
    };

    // Resolve id to uri
    Module.resolve = function (id, refUri, type) {
        // Emit `resolve` event for plugins such as text plugin
        var emitData = {id: id, refUri: refUri, type: type};
        emit('resolve', emitData);

        return emitData.uri || resolveModulePath(refUri, emitData.id, type === 'js');
    };

    // Define a module
    Module.define = function (id, deps, factory) {
        var argsLen = arguments.length;

        // define(factory)
        if (argsLen === 1) {
            factory = id;
            id = undefined;

            if (!isBoolean(Module.cmd)) {
                Module.cmd = true;
            }
        }
        else if (argsLen === 2) {
            factory = deps;

            // define(deps, factory)
            if (isArray(id)) {
                deps = id;
                id = undefined;
            }
            // define(id, factory)
            else {
                deps = undefined;
            }
        } else {
            if (!isBoolean(Module.cmd)) {
                Module.cmd = false;
            }
        }

        // 如果入口为 cmd，则重写后续所有模块都为 cmd
        if (Module.cmd) {
            id = deps = undefined;
        }

        var depList;

        // Parse dependencies according to the module factory code
        if (!isArray(deps) && isFunction(factory)) {
            depList = parseDependencies(factory.toString());
        }

        var meta = {
            id: id,
            uri: Module.resolve(id),
            deps: depList ? depList[0] : deps,
            types: depList ? depList[1] : [],
            outTypes: depList ? depList[2] : [],
            factory: factory
        };

        // @coolie ignore webworker
        // Try to derive uri in IE6-9 for anonymous modules
        //if (!isWebWorker && !meta.uri && doc.attachEvent && typeof getCurrentScript !== "undefined") {
        if (!meta.uri && doc.attachEvent) {
            var script = getCurrentScript();

            if (script) {
                meta.uri = script.id || script.src;
            }

            // NOTE: If the id-deriving methods above is failed, then falls back
            // to use onload event to get the uri
        }

        // Emit `define` event, used in nocache plugin, seajs node version etc
        emit('define', meta);

        if (meta.uri) {
            Module.save(meta.uri, meta);
        } else {
            // Save information for "saving" work in the script onload event
            anonymousMeta = meta;
        }
    };


    // Save meta data to cachedMods
    Module.save = function (uri, meta) {
        var id = meta.id || uri;
        var mod = Module.get(id);

        // Do NOT override already saved modules
        if (mod.status < STATUS.SAVED) {
            mod.types = meta.types;
            mod.outTypes = meta.outTypes;
            mod.dependencies = meta.deps;
            mod.factory = meta.factory;
            mod.status = STATUS.SAVED;
            emit('save', mod);
        }
    };

    // Get an existed module or create a new one
    Module.get = function (uri, deps, type, outType) {
        return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps, type, outType));
    };

    // Use function is equal to load a anonymous module
    Module.entry = [];
    Module.use = function (mainId, callback, uri, async) {
        var mod = Module.get(uri, [mainId]);

        mod.async = async;
        mod._entry.push(mod);
        mod.history = {};
        mod.remain = 1;
        mod.callback = function () {
            // 如果为非 cmd，则入口模块为 0
            if (!Module.cmd && mainId !== '0' && cachedMods[0]) {
                cachedMods[mainId] = cachedMods[0];
                delete(cachedMods[0]);
            }

            // 当前如果还有分块没有加载完成
            if (chunkLength) {
                return;
            }

            var exports = [];
            var uris = mod.resolve();

            emit('ready');

            //for (var i = 0, len = uris.length; i < len; i++) {
            //    exports[i] = cachedMods[uris[i]].exec();
            //}
            each(uris, function (index, uri) {
                if (!cachedMods[uri]) {
                    throw 'can not found main module:\n`' + uri + '`';
                }

                exports[index] = cachedMods[uri].exec();
            });

            emit('execed');

            if (callback) {
                callback.apply(global, exports);
            }

            delete mod.callback;
            delete mod.history;
            delete mod.remain;
            delete mod._entry;
        };
        Module.entry.push(mod);
        emit('start');
        mod.load();

        return mod;
    };


    // Public API

    var useModule = function (id, callback) {
        Module.use(id, callback, cwd + gid());
    };

    /*兼容 1.10 以下版本的 jQuery*/
    Module.define.amd = {jQuery: true};
    Module.define.cmd = {};
    global.define = Module.define;


    // ==============================================================================
    // =============================== coolie exports ===============================
    // ==============================================================================
    // @coolie exports
    (function () {
        var mainURL = loaderScript.getAttribute('data-main');
        var configURL = loaderScript.getAttribute('data-config');
        var baseURL = loaderPath;
        var mainCallbackList = [];
        var mainModule;
        var coolieConfig;
        var reExtname = /\.[^.]*$/;
        var buldVersion = function (url) {
            var version = coolieConfig._v[url];

            return version ? url.replace(reExtname, '.' + version + '$&') : url;
        };
        var buildCache = function (url) {
            if (coolieConfig.cache === false) {
                return url + (url.indexOf('?') > 0 ? '&' : '?') + '_=' + gid();
            }

            return url;
        };
        var timeid;
        var fixDirname = function (p) {
            return p + (reEndWidthSlash.test(p) ? '' : '/');
        };

        bind('resolve', function (meta) {
            if (!Module.cmd) {
                meta.uri = meta.id;
            }
        });

        bind('request', function (meta) {
            // 异步模块
            if (meta.async && !Module.cmd) {
                meta.requestUri = resolveModulePath(Module.asyncBase, meta.requestUri, true);
            }

            meta._url = buldVersion(meta.requestUri);
            meta._url = buildCache(meta._url);
        });

        bind('request', function (meta) {
            var id = meta.requestUri;
            var url = meta._url || id;

            switch (meta.type) {
                case 'text':
                case 'json':
                    switch (meta.outType) {
                        case 'url':
                        case 'base64':
                            Module.save(id, {
                                id: id,
                                types: [],
                                outTypes: [],
                                deps: [],
                                factory: function () {
                                    return url;
                                }
                            });
                            nextTick(function () {
                                meta.onRequest();
                            });
                            meta.requested = true;
                            break;

                        // text
                        // js
                        default :
                            ajaxText(url, function (text) {
                                Module.save(id, {
                                    id: id,
                                    types: [],
                                    outTypes: [],
                                    deps: [],
                                    factory: function () {
                                        if (meta.type === 'json' && meta.outType === 'json') {
                                            return parseJSON(url, text);
                                        } else if (meta.outType === 'style') {
                                            return importStyle(text);
                                        }

                                        return text;
                                    }
                                });
                                meta.onRequest();
                            });
                            meta.requested = true;
                    }
                    break;

                case 'file':
                    // url
                    // text
                    // base64
                    Module.save(id, {
                        id: id,
                        types: [],
                        outTypes: [],
                        deps: [],
                        factory: function () {
                            return url;
                        }
                    });
                    nextTick(function () {
                        meta.onRequest();
                    });
                    meta.requested = true;
                    break;
            }
        });

        if (configURL) {
            configURL = resolveModulePath(loaderDir, configURL, true);
        }

        global.coolie = {
            modules: cachedMods,
            version: VERSION,
            url: loaderPath,
            configURL: configURL,
            importStyle: importStyle,
            dirname: loaderDir,
            /**
             * 路径合并
             * @param from {String} 起始路径
             * @param to {String} 终点路径
             * @returns {String}
             */
            resolvePath: resolvePath,

            /**
             * 配置模块
             * @param config
             * @param [config.base="./"] {String} APP 入口基准路径
             * @param [config.async="./"] {String} async 模块入口标记，相对于 base【只对 cmd 模式作用】
             * @param [config.chunk="./"] {String} chunk 模块入口标记，相对于 base【只对 cmd 模式作用】
             * @param [config.debug=false] {Boolean} 是否启用调试模式
             * @param [config.cache=true] {Boolean} 是否启用缓存
             * @param [config.version] {Object} 版本信息
             * @param [config.global] {Object} 全局变量
             * @param [config._v] {Object} 内置版本信息
             * @returns {global.coolie}
             */
            config: function (config) {
                once(function () {
                    config.base = fixDirname(config.base || './');
                    config.async = fixDirname(config.async || './');
                    config.chunk = fixDirname(config.chunk || './');
                    coolie.mainBaseURL = Module.mainBase = baseURL = getPathDirname(resolvePath(configURL, config.base));
                    coolie.asyncBaseURL = Module.asyncBase = getPathDirname(resolvePath(baseURL, config.async));
                    coolie.chunkBaseURL = Module.chunkBase = getPathDirname(resolvePath(baseURL, config.chunk));
                    coolie.mainURL = mainURL = resolveModulePath(baseURL, mainURL, true);

                    if (config.debug !== false) {
                        config.debug = true;
                    }

                    if (config.cache !== false) {
                        config.cache = true;
                    }

                    /**
                     * @global DEBUG
                     * @type {boolean}
                     */
                    global.DEBUG = !!config.debug;

                    // 定义全局变量
                    each(config.global, function (key, val) {
                        global[key] = val;
                    });

                    config._v = {};
                    each(config.version, function (key, val) {
                        config._v[resolveModulePath(baseURL, key, true)] = val;
                    });

                    coolie.configs = coolieConfig = config;
                })();

                return this;
            },


            /**
             * 使用主模块，开始加载
             * @param [main]
             * @returns {global.coolie}
             */
            use: function (main) {
                main = isArray(main) ? main : [main];

                var allLength = main.length;
                var doneLength = 0;
                var args = [];
                var done = function () {
                    doneLength++;

                    if (doneLength === allLength) {
                        each(mainCallbackList, function (index, callback) {
                            callback.apply(global, args);
                        });
                    }
                };

                each(main, function (index, _main) {
                    useModule(mainURL = _main ? resolveModulePath(baseURL, _main, true) : mainURL, function () {
                        mainModule = Module.get(mainURL);
                        args.push(mainModule.exports);
                        done();
                    });
                });

                return this;
            },


            /**
             * 加载完毕回调，返回主模块
             * @param callback
             * @returns {global.coolie}
             */
            callback: function (callback) {
                var the = this;

                if (!isFunction(callback)) {
                    return the;
                }

                callback = once(callback);

                if (mainModule) {
                    callback(mainModule.exports);
                } else {
                    mainCallbackList.push(callback);
                }

                return the;
            },


            /**
             * 分块加载
             * @param urls
             * @returns {global.coolie}
             */
            chunk: function (urls) {
                each(urls, function (index, url) {
                    if (chunkMods[url]) {
                        return;
                    }

                    chunkLength++;
                    chunkMods[url] = false;
                    var url2 = resolveModulePath(Module.chunkBase, url, true);
                    url2 = buldVersion(url2);
                    request(url2, function () {
                        chunkLength--;
                        chunkMods[url] = true;
                        clearTimeout(timeid);
                        timeid = nextTick(function () {
                            each(Module.entry, function (index, entry) {
                                if (entry.callback) {
                                    entry.callback();
                                }
                            });
                        });
                    });
                });

                return this;
            }
        };

        request(configURL, noop);
    }());
})(this);