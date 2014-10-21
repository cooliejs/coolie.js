/*!
 * porter
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
    // 配置
    var config = {};
    // 当前解析文件，current working file
    var cwf;
    // 入口模块
    var mainMoule;
    var meNode = _getMeNode();
    var containerNode = document.body || document.documentElement || meNode.parentNode;
    var mePath = _getPathname(_pathJoin(location.pathname, meNode.getAttribute('src')));
    var modules = {};
    // 是否为同步加载机制，异步：开发环境（默认），一个模块一个文件；同步：生产环境，多个模块合并成一个文件
    var isSync = !1;
    // 是否正在解析
    var inParse = !0;
    // 依赖长度
    var requireLength = 0;
    // 完成加载长度
    var doneLength = 0;

    /**
     * 定义一个模块
     * @namespace define
     * @param {String} [id] 模块id
     * @param {Array} [deps] 模块依赖
     * @param {Function} factory 模块方法
     */
    window.define = function (id, deps, factory) {
        var args = arguments;

        isSync = args.length === 3;
        requireLength++;

        if (isSync) {
            if (!_isString(id)) {
                throw new Error('module id must be a string');
            }

            if (!_isArray(deps)) {
                throw new Error('module dependencies must be an array');
            }
        } else {
            factory = args[0];
            id = '';
        }

        if (!_isFunction(factory)) {
            throw new Error('module factory must be a function');
        }

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
                _each(deps, function (i, dep) {
                    id = _pathJoin(_getPathname(cwf), dep);
                    _loadScript(id);
                });
            } else {
                inParse = !1;
            }
        }
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

            if(!_isString(main)){
                throw new Error('main module must be a string');
            }

            cwf = config.base;
            mainMoule = _pathJoin(_getPathname(cwf), main);
            _loadScript(mainMoule);

            return this;
        }
    };


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
                uri: isSync ? cwf : id,
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
                console.log(src, (Date.now() - time) + 'ms');
                doneLength++;
            }

            script.onload = script.onerror = null;
            containerNode.removeChild(script);

            // （依赖全部加载完成 || 同步机制） && 解析完成
            if ((requireLength === doneLength || isSync) && !inParse) {
                _execModule(isSync ? _getBasename(mainMoule) : mainMoule);
            }
        };

        cwf = src;
        script.src = _addRequestVersion(src);
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
            str + (str.indexOf('?') > -1 ? '&': '?') + '_=' + encodeURIComponent(config.version):
            str;
    }
})();

