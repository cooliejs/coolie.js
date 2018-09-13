    'use strict';

    module.exports = {
        module0: require('./module0.js'),
        module1: require('./module1.js'),
        module2: require('./module2.js'),
        esModule: require('./es-module'),
        
        nodeModuleA: require('a'),
        nodeModuleAChildJS: require('a/child'),
        nodeModuleAChildTxt: require('a/child.txt', 'text'),

        scopeModuleA: require('@scope/a'),
        scopeModuleAChildJS: require('@scope/a/child'),
        scopeModuleAChildTxt: require('@scope/a/child.txt', 'text'),

        js: require('./sub/js.js', 'js'),
        js_js: require('./sub/js.js', 'js|js'),
        js_text: require('./sub/js.js', 'js|text'),
        js_url: require('./sub/js.js', 'js|url'),
        js_base64: require('./sub/js.js', 'js|base64'),

        text: require('./sub/text.txt', 'text'),
        text_js: require('./sub/text.txt', 'text|js'),
        text_text: require('./sub/text.txt', 'text|text'),
        text_url: require('./sub/text.txt', 'text|url'),
        text_base64: require('./sub/text.txt', 'text|base64'),

        json: require('./sub/json.json', 'json'),
        json_js: require('./sub/json.json', 'json|js'),
        json_text: require('./sub/json.json', 'json|text'),
        json_url: require('./sub/json.json', 'json|url'),
        json_base64: require('./sub/json.json', 'json|base64'),
        
        html: require('./sub/html.html', 'html'),
        html_js: require('./sub/html.html', 'html|js'),
        html_text: require('./sub/html.html', 'html|text'),
        html_url: require('./sub/html.html', 'html|url'),
        html_base64: require('./sub/html.html', 'html|base64'),
        
        file: require('./sub/file.png', 'file'),
        file_js: require('./sub/file.png', 'file|js'),
        file_text: require('./sub/file.png', 'file|text'),
        file_url: require('./sub/file.png', 'file|url'),
        file_base64: require('./sub/file.png', 'file|base64'),
        
        async: function (callback) {
            require.async('./async/module5.js', callback);
        },
        
        css: require('./sub/css.css', 'css'),
        css_js: require('./sub/css.css', 'css|js'),
        css_text: require('./sub/css.css', 'css|text'),
        css_url: require('./sub/css.css', 'css|url'),
        css_base64: require('./sub/css.css', 'css|base64'),
        css_style: require('./sub/css.css', 'css|style')
    };
