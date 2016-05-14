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
    var NODE_MODULES = 'node_modules';
    var JS = 'js';
    var INDEX_JS = 'index.' + JS;
    var MODULE_PIPE_SPLIT = '->';

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
     * 执行一次
     * @param callback
     * @returns {Function}
     */
    var once = function (callback) {
        var ececuted = false;
        return function () {
            if (ececuted) {
                return;
            }

            ececuted = true;
            callback.apply(this, arguments);
        };
    };


    /**
     * 加载文本模块
     * @param url {String} 文本 URL
     * @param callback {Function} 加载回调
     */
    var ajaxText = function (url, callback) {
        var xhr = XMLHttpRequest ? new XMLHttpRequest() : new win.ActiveXObject("Microsoft.XMLHTTP");
        var onready = once(function () {
            if (xhr.status === 200 || xhr.status === 304) {
                callback(xhr.responseText);
                xhr.onload = xhr.onreadystatechange = xhr.onerror = xhr.onabort = xhr.ontimeout = null;
                xhr = null;
            } else {
                throw new URIError('加载资源失败\n' + url);
            }
        });

        xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = onready;
        xhr.open('GET', url);
        xhr.send(null);
    };


    /**
     * 解析字符串为 JSON 对象
     * @param url {String} url 地址
     * @param callback {Function} 回调
     * @returns {{}}
     */
    var ajaxJSON = function (url, callback) {
        ajaxText(url, function (text) {
            var json = {};

            try {
                json = JSON.parse(text);
            } catch (err1) {
                var err = '解析 JSON 错误\n' + url;

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

            callback(json);
        });
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


    var reError = /error/i;

    /**
     * 加载脚本
     * @param url
     * @param callback
     * @returns {Element}
     */
    var loadScript = function (url, callback) {
        var scriptEl = doc.createElement("script");

        var onload = function onload(ev) {
            // Ensure only run once and handle memory leak in IE
            scriptEl.onload = scriptEl.onerror = scriptEl.onreadystatechange = null;

            // Remove the script to reduce memory leak
            headEl.removeChild(scriptEl);

            // Dereference the node
            scriptEl = null;

            callback(reError.test(ev.type) ? true : null);
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
    var reRelativePath = /^\.{1,2}\//;
    var reProtocol = /^.*:/;
    var LOCATION_HREF = location.href;
    var LOCATION_PROTOCOL = location.protocol;
    var LOCATION_BASE = LOCATION_PROTOCOL + '//' + location.host;
    var reThisPath = /\/\.\//g;
    var reEndThisPath = /\/\.$/g;
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
            .replace(reThisPath, '/')
            // 去掉 ./$
            .replace(reEndThisPath, '/');

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
     * 是否为相对路径
     * @param path
     * @returns {boolean}
     */
    var isRelativePath = function (path) {
        return reRelativePath.test(path);
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

        return path + (reEndWidthSlash.test(path) ? INDEX_JS : '');
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


    /**
     * 获取当前工作目录
     * @returns {string}
     */
    var getCWDPath = function () {
        return reIgnoreProtocol.test(LOCATION_HREF) ? '' : getPathDirname(LOCATION_HREF);
    };


    var cwd = getCWDPath();
    var coolieScriptEl = getCoolieScript();
    var cooliePath = getScriptAbsoluteSrc(coolieScriptEl) || cwd;
    var coolieDirname = getPathDirname(cooliePath);
    var coolieAttributeConfigName = getAttributeDataSet(coolieScriptEl, 'config');
    var coolieAttributeMainName = getAttributeDataSet(coolieScriptEl, 'main');
    var coolieConfigPath = resolvePath(coolieDirname, coolieAttributeConfigName);


    // ==============================================================================
    // ==================================== 模块类 ===================================
    // ==============================================================================

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
     * 模块入口类型
     * @type {{}}
     */
    var moduleInTypeMap = {
        js: 'js',
        image: 'file',
        file: 'file',
        text: 'text',
        html: 'text',
        json: 'json',
        css: 'css'
    };


    /**
     * 模块出口类型
     * @type {{}}
     */
    var moduleOutTypeMap = {
        js: {
            js: 1,
            d: 'js'
        },
        file: {
            url: 1,
            base64: 1,
            d: 'url'
        },
        text: {
            text: 1,
            url: 2,
            base64: 2,
            d: 'text'
        },
        css: {
            text: 1,
            url: 2,
            base64: 2,
            style: 3,
            d: 'text'
        },
        json: {
            js: 1,
            text: 2,
            url: 3,
            base64: 3,
            d: 'js'
        }
    };


    /**
     * 获取出口类型
     * @param inType
     * @param outType
     * @returns {*}
     */
    var getOutType = function (inType, outType) {
        var dfnOutType = moduleOutTypeMap[inType];
        var foundOutType = dfnOutType[outType];

        if (!foundOutType) {
            return dfnOutType.d;
        }

        return outType;
    };


    /**
     * 解析代码里的依赖信息
     * @param code {String} 代码
     */
    var parseRequires = function (code) {
        var ret = [];

        code.replace(reSlash, '').replace(reRequire, function ($0, $1, $2) {
            if ($2) {
                var matches = $2.match(reRequireType);
                var pipeline = (matches[2] ? matches[2].toLowerCase() : 'js').split('|');
                var inType = pipeline[0];
                var outType = pipeline[1];

                inType = moduleInTypeMap[inType];

                if (!inType) {
                    throw new TypeError('不支持加载该' + inType + '类型\n' + url);
                }

                outType = getOutType(inType, outType);
                ret.push([matches[1], inType, outType]);
            }
        });

        return ret;
    };


    var MODULE_STATE_LOADING = 0;
    var MODULE_STATE_LOADED = 1;
    var MODULE_STATE_EXECUTED = 2;
    var modulesCacheMap = {};

    var Module = function (parent, id, inType, outType, pkg) {
        var the = this;

        the.parent = parent;
        the.id = id;
        the.inType = inType;
        the.outType = outType;
        the.state = MODULE_STATE_LOADING;
        the.pkg = pkg;
        the.dependencies = [];
        the.resolvedMap = {};
    };

    Module.prototype = {
        constructor: Module,


        /**
         * 模块依赖信息
         * @param dependencyMetaList
         * @param dependencyNameList
         * @param factory
         */
        save: function (dependencyMetaList, dependencyNameList, factory) {
            var the = this;

            /**
             * 解决 node module
             * @param dependency
             * @returns {string|*}
             */
            var resolveNodeModulePackage = function (dependency) {
                var fromDirname;

                if (the.pkg) {
                    if (!the.pkg.dependencies && !the.pkg.devDependencies && !the.pkg.peerDependencies) {
                        throw new TypeError('未指定 dependencies 或 devDependencies 或 peerDependencies\n' + the.id);
                    }

                    if (the.pkg.dependencies[dependency] || the.pkg.devDependencies[dependency]) {
                        fromDirname = resolvePath(the.id, NODE_MODULES + '/');
                    } else {
                        fromDirname = coolieNodeModulesDirname;
                    }
                } else {
                    fromDirname = coolieNodeModulesDirname;
                }

                return resolveModulePath(fromDirname, dependency + '/package.json', false);
            };

            the.build(dependencyNameList, factory);
            each(dependencyMetaList, function (index, dependencyMeta) {
                var dependency = dependencyMeta.name;
                var inType = dependencyMeta.inType;
                var outType = dependencyMeta.outType;
                var isRelativeOrAbsoluteDependency = isRelativePath(dependency) || isAbsolutePath(dependency);
                var url = dependency;

                // ./path/to ../path/to
                if (isRelativeOrAbsoluteDependency) {
                    url = the.resolve(dependency, inType === JS);
                    loadModule(the, url, inType, outType);
                }
                // name
                // 需要根据目录下 package.json 来判断
                else {
                    var pkgURL = resolveNodeModulePackage(dependency);
                    ajaxJSON(pkgURL, function (pkg) {
                        var url2 = resolveModulePath(pkgURL, pkg.main || INDEX_JS, true);
                        the.resolvedMap[dependency] = url2;
                        loadModule(the, url2, inType, outType, pkg);
                    });
                }
            });
            the.exec();
        },


        /**
         * 模块构建
         * @param dependencies
         * @param factory
         */
        build: function (dependencies, factory) {
            var the = this;

            the.dependencies = dependencies;
            the.state = MODULE_STATE_LOADED;
            the.factory = factory;
            the.expose = function () {
                if (the.state === MODULE_STATE_EXECUTED) {
                    return the.exports;
                }

                the.state = MODULE_STATE_EXECUTED;

                var originalFactory = the.factory;
                var factory = the.factory;

                if (!isFunction(originalFactory)) {
                    factory = function () {
                        return originalFactory;
                    };
                }

                var ret = factory.call(win, the.require, the.exports, the);

                if (ret !== undefined) {
                    the.exports = ret;
                }

                return the.exports;
            };
            the.require = function (name, pipeLine) {
                if (coolieAMDMode) {
                    return modulesCacheMap[name].expose();
                }

                var pipeLineArr = (pipeLine || JS).split('|');
                var inType = pipeLineArr[0];
                inType = moduleInTypeMap[inType];
                var outType = getOutType(inType, pipeLineArr[1]);
                var id = the.resolve(name, inType === 'js') + MODULE_PIPE_SPLIT + outType;
                return modulesCacheMap[id].expose();
            };
            the.exports = {};
        },


        /**
         * 模块路径
         * @param name
         * @param isJS
         * @returns {*}
         */
        resolve: function (name, isJS) {
            var the = this;
            var url = the.resolvedMap[name];

            if (url) {
                return url;
            }

            return resolveModulePath(the.id, name, isJS);
        },


        /**
         * 模块尝试执行
         */
        exec: function () {
            var allLoaded = true;
            // 从祖先模块开始向下遍历查询依赖模块是否都加载完毕
            var checkModule = function (module) {
                each(module.dependencies, function (index, dependency) {
                    var cacheModule = modulesCacheMap[dependency];

                    if (!cacheModule || cacheModule.state < MODULE_STATE_LOADED) {
                        allLoaded = false;
                        return false;
                    }

                    checkModule(cacheModule);
                });
            };

            var mainModule = this;

            while (mainModule.parent) {
                mainModule = mainModule.parent;
            }

            checkModule(mainModule);

            if (!allLoaded) {
                return;
            }

            mainModule.expose();
        }
    };


    /**
     * 模块包装
     * @param url
     * @param id
     * @param dependencies
     * @param code
     * @returns {string}
     */
    var moduleWrap = function (url, id, dependencies, code) {
        var dependenciesStr = dependencies.join('","');

        if (dependenciesStr) {
            dependenciesStr = '"' + dependenciesStr + '"';
        }

        return [
            'define("' + id + '", [' + dependenciesStr + '], function(require, exports, module) {\n\n',
            /****/code,
            '\n\n});',
            '//# sourceURL=' + url
        ].join('\n');
    };


    /**
     * 定义 AMD 模块
     * @param id
     * @param dependencies
     * @param factory
     * @returns {*}
     */
    win.define = function (id, dependencies, factory) {
        var module = modulesCacheMap[id] = modulesCacheMap[id] || new Module(null, id);

        each(dependencies, function (index, depId) {
            modulesCacheMap[depId] = new Module(module, depId);
        });

        module.build(dependencies, factory);
        module.exec();
    };


    /**
     * 加载模块
     * @param parent
     * @param url
     * @param inType
     * @param outType
     * @param pkg
     */
    var loadModule = function (parent, url, inType, outType, pkg) {
        var id = url + MODULE_PIPE_SPLIT + outType;

        if (modulesCacheMap[id]) {
            return;
        }

        var module = modulesCacheMap[id] = new Module(parent, id, inType, outType, pkg);
        var dependencyMetaList = [];
        var dependencyNameList = [];

        var define = function (id, dependencies, factory) {
            var args = arguments;
            var argsLength = args.length;

            switch (argsLength) {
                case 0:
                    throw new SyntaxError('模块书写语法不正确\n' + id);
                    break;

                // define(id, deps, factory);
                case 3:
                    if (module.state !== MODULE_STATE_EXECUTED) {
                        module.save(dependencyMetaList, dependencies, factory);
                    }

                    break;

                default:
                    // 对 amd 的兼容
                    if (module.state === MODULE_STATE_EXECUTED) {
                        var ret = args[argsLength - 1](module.require, module.exports, module);

                        if (ret !== undefined) {
                            module.exports = ret;
                        }
                    }
            }
        };

        var moduleInType = module.inType;
        var moduleOutType = module.outType;
        switch (moduleInType) {
            case 'js':
                return ajaxText(url, function (code) {
                    var requires = parseRequires(code);

                    each(requires, function (index, meta) {
                        if (!meta.length) {
                            return;
                        }

                        var name = meta[0];
                        var inType = meta[1];
                        var outType = meta[2];
                        dependencyMetaList.push({
                            name: name,
                            inType: inType,
                            outType: outType
                        });
                        dependencyNameList.push(resolvePath(id, name + MODULE_PIPE_SPLIT + outType));
                    });

                    var moduleCode = moduleWrap(url, id, dependencyNameList, code);
                    return new Function('define', moduleCode)(define);
                });

            case 'css':
            case 'text':
            case 'json':
                switch (moduleOutType) {
                    case 'url':
                    case 'base64':
                        return define(id, [], function () {
                            return url;
                        });

                    case 'js':
                        return ajaxText(url, function (code) {
                            define(id, [], function () {
                                return new Function('return ' + code + ';')();
                            });
                        });

                    case 'style':
                        return ajaxText(url, function (code) {
                            define(id, [], function () {
                                return importStyle(code);
                            });
                        });

                    // text
                    default:
                        return ajaxText(url, function (code) {
                            define(id, [], function () {
                                return code;
                            });
                        });
                }

            case 'file':
                // url
                // base64
                return define(id, [], function () {
                    return url;
                });
        }
    };


    /**
     * 使用模块
     * @param parent
     * @param url
     * @param inType
     * @param outType
     * @param pkg
     */
    var useModule = function (parent, url, inType, outType, pkg) {
        if (coolieAMDMode) {
            loadScript(url, noop);
        } else {
            loadModule(parent, url, inType, outType, pkg);
        }
    };


    // ==============================================================================
    // =================================== 出口 ==================================
    // ==============================================================================
    var coolieAMDMode = false;

    /**
     * @namespace coolie
     */
    var coolie = win.coolie = {
        version: VERSION,
        url: cooliePath,
        configURL: coolieConfigPath,
        importStyle: importStyle,
        dirname: coolieDirname,
        configs: {},
        modules: modulesCacheMap,

        resolvePath: resolvePath,


        /**
         * 配置
         * @param cf {Object}
         * @returns {{coolie}}
         */
        config: function (cf) {
            cf = cf || {};
            coolie.configs.base = coolieModuleBaseDirname = resolvePath(coolieDirname, cf.base || './');
            coolie.configs.nodeModules = coolieNodeModulesDirname = resolvePath(coolieModuleBaseDirname, cf.nodeModules || NODE_MODULES + '/');
            coolieAMDMode = cf.mode === 'AMD';

            // 定义全局变量
            each(cf.global, function (key, val) {
                win[key] = val;
            });

            return coolie;
        },


        /**
         * 加载入口模块
         * @param main
         * @returns {{coolie}}
         */
        use: function (main) {
            if (!main && coolieAttributeMainName) {
                coolieMainPath = resolvePath(coolieModuleBaseDirname, coolieAttributeMainName);
                useModule(null, coolieMainPath, JS, JS, null);
                return coolie;
            }

            main = isArray(main) ? main : [main];
            each(main, function (index, _main) {
                nextTick(function () {
                    useModule(null, _main, JS, JS, null);
                });
            });

            return coolie;
        }
    };


    // ==============================================================================
    // =================================== 启动 ==================================
    // ==============================================================================
    var coolieMainPath = '';
    var coolieModuleBaseDirname = coolieDirname;
    var coolieNodeModulesDirname = resolvePath(coolieDirname, NODE_MODULES + '/');

    loadScript(coolieConfigPath, noop);
}());