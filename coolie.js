/**
 * coolie 苦力
 * @author coolie.ydr.me
 * @version 2.0.7
 * @license MIT
 */


;(function () {
    'use strict';

    var VERSION = '2.0.7';
    var COOLIE = 'coolie';
    var NODE_MODULES = 'node_modules';
    var JS = 'js';
    var INDEX_JS = 'index.' + JS;
    var MODULE_SPLIT = '->';
    var DEPENDENT_STR = ' 依赖的 ';
    var LOAD_ERROR_STR = ' 资源加载失败';
    var win = window;
    var doc = win.document;
    var headEl = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;


    // ==============================================================================
    // =================================== 工具函数 ==================================
    // ==============================================================================

    var noop = function () {
        // ignore
    };

    function isType(type) {
        return function (obj) {
            return {}.toString.call(obj) === "[object " + type + "]";
        };
    }

    // var isObject = isType("Object");
    //var isString = isType("String");
    // var isBoolean = isType("Boolean");
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
                callback(i, list[i]);
            }
        }
    };


    /**
     * 执行一次
     * @param callback
     * @returns {Function}
     */
    var once = function (callback) {
        var ececuted = false;
        return function () {
            /* istanbul ignore next */
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
        var xhr = new XMLHttpRequest();
        var onLoad = once(function () {
            var err = null;
            var responseText = xhr.responseText;

            /* istanbul ignore next */
            if (xhr.status !== 200 && xhr.status !== 304) {
                err = true;
            }

            xhr.onload = xhr.onreadystatechange = xhr.onerror = xhr.onabort = xhr.ontimeout = null;
            xhr = null;
            callback(err, responseText);
        });

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                onLoad();
            }
        };
        xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = onLoad;
        xhr.open('GET', url);
        xhr.send(null);
    };


    /**
     * 解析 JSON
     * @param jsonStr
     * @returns {*}
     */
    var evalJSON = function (jsonStr) {
        try {
            /* jshint evil: true */
            return new Function('', 'return ' + jsonStr)();
        } catch (err2) {
            /* istanbul ignore next */
            return null;
        }
    };


    /**
     * 解析字符串为 JSON 对象
     * @param parent {Object} 父级模块
     * @param url {String} url 地址
     * @param callback {Function} 回调
     * @returns {{}}
     */
    var ajaxJSON = function (parent, url, callback) {
        ajaxText(url, function (err, text) {
            /* istanbul ignore next */
            if (err) {
                throw new URIError((parent ? parent.url + DEPENDENT_STR : '') + 'JSON ' + LOAD_ERROR_STR + '\n' + url);
            }

            var json = evalJSON(text);

            /* istanbul ignore next */
            if (!json) {
                throw new URIError((parent ? parent.url + DEPENDENT_STR : '') + 'JSON 资源解析失败\n' + url);
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
            /* istanbul ignore next */
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
        var onLoad = function onload(err) {
            scriptEl.onload = scriptEl.onerror = scriptEl.onreadystatechange = null;
            headEl.removeChild(scriptEl);
            scriptEl = null;
            callback(err);
        };

        if ('onload' in scriptEl) {
            scriptEl.onload = onLoad;
            scriptEl.onerror = function () {
                onLoad(true);
            };
        } else {
            scriptEl.onreadystatechange = function () {
                if (/loaded|complete/.test(scriptEl.readyState)) {
                    onLoad();
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
    var reExtname = /\.[^.]+$/;
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
     * 确保路径是一个目录
     * @param path {String}
     * @returns {string}
     */
    var ensurePathDirname = function (path) {
        return path + (reEndWidthSlash.test(path) ? '' : '/');
    };


    /**
     * 获取文件的扩展名
     * @param path
     * @returns {*|string}
     */
    var getPathExtname = function (path) {
        return (path.toLowerCase().match(reExtname) || [''])[0];
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

        var extname = getPathExtname(path);
        return path + (extname === '.' + JS ? '' : '.' + JS);
    };


    /**
     * 修正文件路径
     * @param path {string} 文件路径
     * @param isJS {Boolean} 是否为 js
     * @returns {string|*}
     */
    var fixFilePath = function (path, isJS) {
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
    var coolieConfigPath = coolieAttributeConfigName ? resolvePath(coolieDirname, coolieAttributeConfigName) : null;
    var coolieConfigDirname = coolieConfigPath ? getPathDirname(coolieConfigPath) : coolieDirname;


    // ==============================================================================
    // ==================================== 队列类 ===================================
    // ==============================================================================
    var Queue = function () {
        var the = this;

        the.d = false;
        the.list = [];
    };

    Queue.prototype = {
        constructor: Queue,

        /**
         * 开始队列
         * @param id
         * @param task
         * @example
         * queue.task(id, function(next) {
         *     // do async
         *     next();
         * });
         */
        task: function (id, task) {
            var the = this;

            task.id = id;
            the.list.push(task);
            the.start();
        },


        /**
         * 开始执行队列
         */
        start: function () {
            var the = this;

            if (the.d) {
                return the;
            }

            var task = the.list.shift();

            if (task) {
                the.d = true;
                the.last = task;
                task(function () {
                    the.d = false;
                    the.start();
                });
            } else {
                the.d = false;
            }
        }
    };
    var queue = new Queue();


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
     * 默认的入口模块类型匹配规则
     * @type {*[]}
     */
    var moduleInTypeMatches = [
        [JS, /^js$/],
        ['html', /^html$/],
        ['css', /^css$/],
        ['json', /^json$/],
        ['text', /^txt$/]
    ];


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
     * 解析 require 信息
     * @param name
     * @param pipeline
     * @returns {*[]}
     */
    var parseRequire = function (name, pipeline) {
        var dftInType = JS;
        var extension = getPathExtname(name).slice(1);

        if (isRelativePath(name) && extension && !pipeline) {
            each(moduleInTypeMatches, function (index, rule) {
                var inType = rule[0];
                var regexp = rule[1];

                if (regexp.test(extension)) {
                    dftInType = inType;
                    return false;
                }
            });

            dftInType = dftInType || 'file';
        }

        pipeline = (pipeline ? pipeline.toLowerCase() : dftInType).split('|');
        var inType = pipeline[0];
        var outType = pipeline[1];

        inType = moduleInTypeMap[inType];

        if (!inType) {
            throw new TypeError('不支持的模块类型：' + inType);
        }

        outType = getOutType(inType, outType);

        return [name, inType, outType];
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

                ret.push(parseRequire(matches[1], matches[2]));
            }
        });

        return ret;
    };


    var MODULE_STATE_LOADING = 0;
    var MODULE_STATE_LOADED = 1;
    var MODULE_STATE_EXECUTED = 2;
    var modulesCacheMap = {};
    var moduleGid = 0;

    var Module = function (parent, id, inType, outType, pkg) {
        var the = this;

        the.parent = parent;
        the.main = parent ? parent.main : the;
        the.id = id;
        the.gid = moduleGid++;
        the.inType = inType;
        the.outType = outType;
        the.state = MODULE_STATE_LOADING;
        the.pkg = pkg;
        the.dependencies = [];
        the.resolvedMap = {};
        the.callbacks = [];
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
             * @param callback
             */
            var resolveNodeModuleURL = function (dependency, callback) {
                var mainURL;
                var nodeModuleDir = resolvePath(coolieNodeModulesDir, dependency + '/');

                if (coolieNodeModuleMainPath) {
                    mainURL = resolveModulePath(nodeModuleDir, coolieNodeModuleMainPath, true);
                    callback(mainURL);
                } else {
                    // ！！为了减少复杂度，避免模块可能无法被查找到的 BUG，因 npm 不同的版本，安装依赖模块的存放方式不一致
                    // node 模块只从根目录的 node_modules 查找，前端模块必须平级安装
                    var pkgURL = resolveModulePath(coolieNodeModulesDir, dependency + '/package.json', false);

                    ajaxJSON(the.parent, pkgURL, function (pkg) {
                        mainURL = resolveModulePath(pkgURL, pkg.main || INDEX_JS, true);
                        callback(mainURL, pkg, pkgURL);
                    });
                }
            };

            the.build(dependencyNameList, factory);

            each(dependencyMetaList, function (index, dependencyMeta) {
                var dependency = dependencyMeta.name;
                var inType = dependencyMeta.inType;
                var outType = dependencyMeta.outType;
                var isRelativeOrAbsoluteDependency = isRelativePath(dependency) || isAbsolutePath(dependency);
                var url = dependency;
                var dependencyModule;

                // ./path/to ../path/to
                if (isRelativeOrAbsoluteDependency) {
                    url = the.resolve(dependency, inType === JS);
                    dependencyModule = loadModule(the, url, inType, outType);
                    the.dependencies[index] = dependencyModule.id;
                }
                // name
                // 需要根据目录下 package.json 来判断
                else {
                    resolveNodeModuleURL(dependency, function (url, pkg, pkgURL) {
                        dependencyModule = loadModule(the, url, inType, outType, pkg);
                        dependencyModule.pkgURL = pkgURL;
                        the.resolvedMap[dependency] = url;
                        the.dependencies[index] = dependencyModule.id;
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

                var reqMetas = parseRequire(name, pipeLine);
                var inType = reqMetas[1];
                var outType = reqMetas[2];
                var id = the.resolve(name, inType === 'js') + MODULE_SPLIT + outType;
                return modulesCacheMap[id].expose();
            };
            the.require.resolve = the.resolve;
            the.require.async = function (names, callback) {
                names = isArray(names) ? names : [names];
                callback = isFunction(callback) ? callback : noop;

                var asyncLength = names.length;
                var asyncArgs = [];
                var done = function (exports) {
                    asyncArgs.push(exports);

                    if (asyncLength === asyncArgs.length) {
                        callback.apply(win, asyncArgs);
                    }
                };
                nextTick(function () {
                    each(names, function (_, name) {
                        if (coolieAMDMode) {
                            name = name + '.' + coolieAsyncModulesMap[name] + '.' + JS;
                        }

                        var url = resolveModulePath(coolieAsyncModulesDir, name);
                        useModule(null, url, JS, JS, the.pkg, done);
                    });
                });
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
            nextTick(function () {
                each(mainModule.callbacks, function (_, callback) {
                    callback(mainModule.exports);
                });
            });
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


    var lastDefineMainModule = null;

    /**
     * 定义 AMD 模块
     * @param id
     * @param dependencies
     * @param factory
     * @returns {Module}
     */
    win.define = function (id, dependencies, factory) {
        /* istanbul ignore next */
        if (!coolieAMDMode) {
            throw new SyntaxError('AMD 模式才允许调用 define，coolie.js@2.x 开发环境只支持 commonJS 规范');
        }

        var cacheModule = modulesCacheMap[id];

        if (!cacheModule) {
            id = queue.last.id;
            cacheModule = modulesCacheMap[id];
        }

        var module = modulesCacheMap[id] = cacheModule || new Module(null, id);

        if (module.parent) {
            module.url = module.parent.url;
        } else {
            lastDefineMainModule = module;
        }

        each(dependencies, function (index, depId) {
            modulesCacheMap[depId] = modulesCacheMap[depId] || new Module(module, depId);
            modulesCacheMap[depId].url = module.url;
        });

        module.build(dependencies, factory);
        module.exec();

        return module;
    };


    /**
     * 加载模块
     * @param parent
     * @param url
     * @param inType
     * @param outType
     * @param pkg
     * @param callback
     */
    var loadModule = function (parent, url, inType, outType, pkg, callback) {
        var id = url + MODULE_SPLIT + outType;
        var cacheModule = modulesCacheMap[id];

        if (cacheModule) {
            return cacheModule;
        }

        var module = modulesCacheMap[id] = new Module(parent, id, inType, outType, pkg);
        module.url = url;

        if (!parent && callback) {
            module.callbacks.push(callback);
        }

        var dependencyMetaList = [];
        var dependencyNameList = [];
        var define = function (id, dependencies, factory) {
            var args = arguments;
            var argsLength = args.length;

            switch (argsLength) {
                case 0:
                    /* istanbul ignore next */
                    throw new SyntaxError('模块书写语法不正确\n' + id);

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
                ajaxText(url, function (err, code) {
                    /* istanbul ignore next */
                    if (err) {
                        throw new URIError((module.parent ? module.parent.url + DEPENDENT_STR : '') + 'JS' + LOAD_ERROR_STR + '\n' + url);
                    }

                    var requires = parseRequires(code);

                    each(requires, function (index, meta) {
                        var name = meta[0];
                        var inType = meta[1];
                        var outType = meta[2];
                        dependencyMetaList.push({
                            name: name,
                            inType: inType,
                            outType: outType
                        });
                        dependencyNameList.push(name);
                    });

                    var moduleCode = moduleWrap(url, id, dependencyNameList, code);

                    /* jshint evil: true */
                    return new Function('define', moduleCode)(define);
                });
                break;

            case 'css':
            case 'text':
            case 'json':
                switch (moduleOutType) {
                    case 'url':
                    case 'base64':
                        define(id, [], function () {
                            return url;
                        });
                        break;

                    case 'js':
                        ajaxText(url, function (err, code) {
                            if (err) {
                                throw new URIError((module.parent ? module.parent.url + DEPENDENT_STR : '') + moduleInType + LOAD_ERROR_STR + '\n' + url);
                            }

                            define(id, [], function () {
                                return evalJSON(code);
                            });
                        });
                        break;

                    case 'style':
                        ajaxText(url, function (err, code) {
                            if (err) {
                                throw new URIError((module.parent ? module.parent.url + DEPENDENT_STR : '') + moduleInType + LOAD_ERROR_STR + '\n' + url);
                            }

                            define(id, [], function () {
                                return importStyle(code);
                            });
                        });
                        break;

                    // text
                    default:
                        ajaxText(url, function (err, code) {
                            if (err) {
                                throw new URIError((module.parent ? module.parent.url + DEPENDENT_STR : '') + moduleInType + LOAD_ERROR_STR + '\n' + url);
                            }

                            define(id, [], function () {
                                return code;
                            });
                        });
                        break;
                }
                break;

            case 'file':
                // url
                // base64
                define(id, [], function () {
                    return url;
                });
        }

        return module;
    };


    /**
     * 使用模块
     * @param parent
     * @param url
     * @param inType
     * @param outType
     * @param pkg
     * @param callback
     */
    var useModule = function (parent, url, inType, outType, pkg, callback) {
        var id = url + (coolieAMDMode ? '' : MODULE_SPLIT + outType);
        var cacheModule = modulesCacheMap[id];

        if (cacheModule) {
            if (cacheModule.state === MODULE_STATE_EXECUTED) {
                return callback(cacheModule.exports);
            }

            return cacheModule.callbacks.push(callback);
        }


        if (coolieAMDMode) {
            modulesCacheMap[id] = new Module(parent, id, inType, outType, pkg);
            modulesCacheMap[id].url = url;
            queue.task(url, function (next) {
                loadScript(url, function () {
                    if (lastDefineMainModule) {
                        lastDefineMainModule.callbacks.push(callback);
                        lastDefineMainModule = null;
                    }

                    next();
                });
            });
        } else {
            loadModule(parent, url, inType, outType, pkg, callback);
        }
    };


    // ==============================================================================
    // ===================================== 出口 ===================================
    // ==============================================================================
    var coolieAMDMode = false;
    var coolieConfigs = {};
    var coolieCallbacks = [];
    var coolieCallbackArgs = null;
    var coolieChunkMap = {};
    var coolieNodeModuleMainPath = null;

    /**
     * @namespace coolie
     */
    var coolie = win.coolie = {
        version: VERSION,
        url: cooliePath,
        configURL: coolieConfigPath,
        importStyle: importStyle,
        dirname: coolieDirname,
        configs: coolieConfigs,
        modules: modulesCacheMap,
        callbacks: coolieCallbacks,

        /**
         * 路径合并
         * @param {String} from
         * @param {String} to
         * @returns {String}
         */
        resolvePath: resolvePath,


        /**
         * 配置
         * @param cf {Object}
         * @param [cf.mode="cjs"] {String} commonJS 加密
         * @param [cf.mainModulesDir] {String} 入口模块基础目录
         * @param [cf.nodeModulesDir] {String} node_modules 根目录
         * @param [cf.nodeModuleMainPath] {String} Node 模块的入口路径
         * @param [cf.global={}] {Object} 全局变量，其中布尔值将会作为压缩的预定义全局变量
         * @param [cf.chunkModulesDir] {String} 由构建工具指定
         * @param [cf.chunkModulesMap] {Object} 由构建工具指定
         * @param [cf.asyncModulesDir] {String} 由构建工具指定
         * @param [cf.asyncModulesMap] {Object} 由构建工具指定
         * @param [cf.debug=true] {Boolean} 由构建工具指定
         * @returns {{coolie}}
         */
        config: function (cf) {
            if (coolieConfigs.mode) {
                return coolie;
            }

            cf = cf || {};
            coolieConfigs.mode = cf.mode || 'CJS';
            coolieAMDMode = coolieConfigs.mode === 'AMD';
            coolieConfigs.mainModulesDir = coolieMainModulesDir =
                ensurePathDirname(resolvePath(coolieConfigDirname, cf.mainModulesDir || '.'));
            coolieConfigs.nodeModulesDir = coolieNodeModulesDir =
                ensurePathDirname(resolvePath(coolieMainModulesDir, cf.nodeModulesDir || '/' + NODE_MODULES + '/'));
            coolieConfigs.chunkModulesDir = coolieChunkModulesDir =
                ensurePathDirname(resolvePath(coolieMainModulesDir, cf.chunkModulesDir || '.'));
            coolieConfigs.chunkModulesMap = coolieChunkModulesMap = cf.chunkModulesMap || {};
            coolieConfigs.asyncModulesDir = coolieAsyncModulesDir =
                ensurePathDirname(resolvePath(coolieMainModulesDir, cf.asyncModulesDir || '.'));
            coolieConfigs.asyncModulesMap = coolieAsyncModulesMap = cf.asyncModulesMap || {};
            coolieConfigs.dirname = coolieDirname;
            coolieConfigs.configDirname = coolieConfigDirname;
            cf.global = cf.global || {};
            cf.global.DEBUG = coolieConfigs.debug = cf.debug !== false;
            // coolieExtensionMath = coolieConfigs.extensionMath = cf.extensionMath !== false;
            coolieNodeModuleMainPath = coolieConfigs.nodeModuleMainPath = cf.nodeModuleMainPath;

            // 定义全局变量
            each(cf.global, function (key, val) {
                win[key] = val;
            });

            return coolie;
        },


        /**
         * 加载入口模块，只支持 JS 模块
         * @param mainModules
         * @param callback
         * @returns {{coolie}}
         */
        use: function (mainModules, callback) {
            callback = isFunction(callback) ? callback : noop;

            var useLength = 0;
            var args = [];
            var done = function (exports) {
                args.push(exports);

                if (args.length == useLength) {
                    coolieCallbackArgs = coolieCallbackArgs || args;
                    callback.apply(win, args);

                    each(coolieCallbacks, function (_, callback) {
                        callback.apply(win, args);
                    });
                }
            };

            /* istanbul ignore next */
            if (!mainModules && coolieAttributeMainName) {
                coolieMainPath = resolvePath(coolieMainModulesDir, coolieAttributeMainName);
                useModule(null, coolieMainPath, JS, JS, null, done);
                useLength = 1;
                return coolie;
            }

            if (!mainModules) {
                return coolie;
            }

            mainModules = isArray(mainModules) ? mainModules : [mainModules];
            useLength = mainModules.length;
            each(mainModules, function (index, mainModule) {
                var url = resolveModulePath(coolieMainModulesDir, mainModule, true);

                nextTick(function () {
                    useModule(null, url, JS, JS, null, done);
                });
            });

            return coolie;
        },


        /**
         * 第一次 use 模块加载完毕后回调
         * @param callback {Function}
         * @returns {{coolie}}
         */
        callback: function (callback) {
            if (!isFunction(callback)) {
                return coolie;
            }

            if (coolieCallbackArgs) {
                callback.apply(win, coolieCallbackArgs);
            } else {
                coolieCallbacks.push(callback);
            }

            return coolie;
        },


        /**
         * 加载分块文件
         * @param chunkIds {Array}
         * @returns {{coolie}}
         */
        chunk: function (chunkIds) {
            chunkIds = isArray(chunkIds) ? chunkIds : [chunkIds];
            each(chunkIds, function (_, chunkId) {
                if (coolieChunkMap[chunkId]) {
                    return;
                }

                coolieChunkMap[chunkId] = true;
                var chunkName = chunkId + '.' + coolieChunkModulesMap[chunkId] + '.' + JS;
                var chunkURL = resolvePath(coolieChunkModulesDir, chunkName);
                loadScript(chunkURL, noop);
            });

            return coolie;
        }
    };


    // ==============================================================================
    // =================================== 启动 =====================================
    // ==============================================================================
    var coolieMainPath = '';
    var coolieMainModulesDir = coolieDirname;
    var coolieChunkModulesDir = coolieDirname;
    var coolieChunkModulesMap = {};
    var coolieAsyncModulesDir = coolieDirname;
    var coolieAsyncModulesMap = {};
    var coolieNodeModulesDir = resolvePath(coolieDirname, '/' + NODE_MODULES + '/');

    /* istanbul ignore next */
    if (coolieConfigPath) {
        loadScript(coolieConfigPath, noop);
    }
}());