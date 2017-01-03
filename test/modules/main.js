    'use strict';

    module.exports = {
        module0: require('./module0.js'),
        module1: require('./module1.js'),
        module2: require('./module2.js'),
        
        nodeModuleA: require('a'),
        
        text: require('./text.txt', 'text'),
        text_js: require('./text.txt', 'text|js'),
        text_text: require('./text.txt', 'text|text'),
        text_url: require('./text.txt', 'text|url'),
        text_base64: require('./text.txt', 'text|base64'),
        
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
