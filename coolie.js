/**
 * coolie 苦力
 * @author coolie.ydr.me
 * @version 2.0.0-alpha1
 * @license MIT
 */


;(function () {
    'use strict';

    var VERSION = '2.0.0-alpha1';
    var COOLIE = 'coolie';

    var noop = function () {
        // ignore
    };

    var win = window;
    var doc = win.document;
    var headEl = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;


    // ==============================================================================
    // =================================== 工具函数 ==================================
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
            var err = 'parse json error\n' + url;

            try {
                /* jshint evil: true */
                var fn = new Function('', 'return ' + text);
                json = fn();
            } catch (err2) {
                throw err;
            }

            if (!isObject(json) && !isArray(json)) {
                throw err;
            }

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
        headEl.appendChild(styleEl);
        // ie
        var stylesheet = styleEl.styleSheet;

        /**
         * 导入 style 样式
         * @param cssText
         */
        return function (cssText) {
            if (stylesheet) {
                stylesheet.cssText += cssText;
            } else {
                styleEl.innerHTML += cssText;
            }

            return styleEl;
        };
    }());


    /**
     * 加载脚本
     * @param url
     * @param callback
     * @returns {Element}
     */
    var loadScript = function (url, callback) {
        var scriptEl = doc.createElement("script");

        var onload = function onload(error) {
            // Ensure only run once and handle memory leak in IE
            scriptEl.onload = scriptEl.onerror = scriptEl.onreadystatechange = null;

            // Remove the script to reduce memory leak
            headEl.removeChild(scriptEl);

            // Dereference the node
            scriptEl = null;

            callback(error);
        };

        if ('onload' in scriptEl) {
            scriptEl.onload = onload;
            scriptEl.onerror = function () {
                onload(true);
            };
        }
        else {
            scriptEl.onreadystatechange = function () {
                if (/loaded|complete/.test(scriptEl.readyState)) {
                    onload();
                }
            };
        }

        scriptEl.async = true;
        scriptEl.src = url;
        headEl.appendChild(scriptEl);

        return scriptEl;
    };


    var evalScript = function (code) {
        new Function('define', code).call(moduleDefine);
    };


    // ==============================================================================
    // =================================== DOM函数 ==================================
    // ==============================================================================

    /**
     * 获取 data-key
     * @param el
     * @param dataKey
     * @returns {string}
     */
    var getAttributeDataSet = function (el, dataKey) {
        return el.getAttribute('data-' + dataKey);
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


    // ==============================================================================
    // ==================================== 路径函数 ===================================
    // ==============================================================================
    var reJSExtname = /\.js$/i;
    var reStaticPath = /^(.*:)?\/\//;
    var reAbsolutePath = /^\//;
    var reProtocol = /^.*:/;
    var LOCATION_HREF = location.href;
    var LOCATION_PROTOCOL = location.protocol;
    var LOCATION_BASE = LOCATION_PROTOCOL + '//' + location.host;
    var reLastPath = /\/[^/]+\/\.\.(\/|$)/;
    var reThisPath = /\/\.\//g;
    var reNotURISlash = /\\/g;
    var rePathDirname = /\/$/;
    var rePathBase = /^~\//;
    var rePathQuerystringHashstring = /[?#].*$/;
    // Ignore about:xxx and blob:xxx
    var reIgnoreProtocol = /^(about|blob):/;
    var rePathSep = /\//;


    /**
     * 获取路径协议
     * @param path
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

        while (reLastPath.test(path)) {
            path = path.replace(reLastPath, '/')
        }

        return protocol + path;
    };


    /**
     * 获取当前工作目录
     * @returns {string}
     */
    var getCWDPath = function () {
        return reIgnoreProtocol.test(LOCATION_HREF) ? '' : getPathDirname(LOCATION_HREF);
    };


    /**
     * 获取 coolie 路径
     * @param loaderScript {Object} 加载器节点
     * @param cwd {string} 工作路径
     * @returns {string}
     */
    var getCooliePath = function (loaderScript, cwd) {
        cooliePath = getScriptAbsoluteSrc(loaderScript);
        return cooliePath || cwd;
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

        path += rePathDirname.test(path) ? '' : '/..';
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
            return (getPathProtocol(from) || '/') + to.slice(1);
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

        return path + (rePathDirname.test(path) ? 'index.js' : '');
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


    // ==============================================================================
    // ==================================== 模块类 ===================================
    // ==============================================================================
    var Module = function () {

    };

    Module.prototype = {
        constructor: Module
    };

    var moduleWrap = function (id, dependencies, code) {
        return ''.concat(
            'define(' + id + ', [' + dependencies.join(',') + '], function(require, exports, module) {',
            code,
            '});'
        );
    };

    var moduleDefine = function (id, dependencies, factory) {
        return new Module(id, dependencies, factory);
    };


    // ==============================================================================
    // =================================== 出口 ==================================
    // ==============================================================================
    win.coolie = {
        config: function (cf) {
            coolieModuleBaseDirname = resolvePath(coolieDirname, cf.base || '.');
        },

        use: function (main) {
            main = isArray(main) ? main : [main];
        }
    };

    // ==============================================================================
    // =================================== 启动分析 ==================================
    // ==============================================================================
    var cwd = getCWDPath();
    var coolieScriptEl = getCoolieScript();
    var cooliePath = getCooliePath(coolieScriptEl, cwd);
    var coolieDirname = getPathDirname(cooliePath);
    var coolieAttributeConfigName = getAttributeDataSet(coolieScriptEl, 'config');
    var coolieAttributeMainName = getAttributeDataSet(coolieScriptEl, 'main');
    var coolieConfigPath = resolvePath(coolieDirname, coolieAttributeConfigName);
    var coolieModuleBaseDirname = coolieDirname;

    loadScript(coolieConfigPath, noop);
}());