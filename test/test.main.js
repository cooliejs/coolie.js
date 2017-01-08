/**
 * CJS 测试
 * @author ydr.me
 * @create 2014-11-17 15:04
 */


describe('coolie.js', function () {
    'use strict';

    coolie.config({
        mode: 'CJS',
        mainModulesDir: coolie.resolvePath(coolie.dirname, './test/modules/'),
        nodeModulesDir: './__node_modules/',
        global: {
            abc: true
        }
    });

    coolie.config({
        mode: 'cmd'
    });

    coolie.config({
        mode: 'cjs'
    });

    coolie.config({
        nodeModulesDir: './__node_modules2/'
    });

    coolie.config({
        nodeModulesDir: './__node_modules/'
    });

    coolie.use('./main.js');


    it('rewrite configs', function () {
        expect(coolie.configs.mode).toBe('CJS');
    });

    var getStyle = function (el, cssKey) {
        return getComputedStyle(el).getPropertyValue(cssKey);
    };

    it('.resolvePath', function () {
        expect(coolie.resolvePath('../../../aa/', '')).toEqual('../../../aa/');
        expect(coolie.resolvePath('/aa/', '../bb/cc/')).toEqual('/bb/cc/');
        expect(coolie.resolvePath('/aa/a.js', '../bb/cc/')).toEqual('/bb/cc/');
        expect(coolie.resolvePath('/aa/a.js', './bb/cc/')).toEqual('/aa/bb/cc/');
        expect(coolie.resolvePath('http://locahost:9876/base/node_modules/coolie.js/', '../../'))
            .toEqual('http://locahost:9876/base/');
    });

    it('.callback', function (done) {
        coolie.callback(function () {
            setTimeout(function () {
                coolie.callback(1);
                coolie.callback(function () {
                    done();
                });
            }, 100);
        });
    });

    // it('.use twice', function (done) {
    //     coolie.use('main2.js', function (exports) {
    //         expect(exports).toEqual('main2');
    //         done();
    //     });
    // });

    it('.use delay', function (done) {
        var index = 0;
        var length = 2;
        var ready = function () {
            index++;

            if (index === length) {
                done();
            }
        };

        coolie.use('/delay.js', function (exports) {
            expect(exports).toMatch(/delay/);
            ready();
        });
        coolie.use('/delay.js', function (exports) {
            expect(exports).toMatch(/delay/);
            ready();
        });
    });

    it('.use repeat', function (done) {
        coolie.use('main.js', function (exports) {
            done();
        });
    });

    it('.config', function () {
        expect(window.abc).toEqual(true);
    });

    it('main', function (done) {
        coolie.callback(function (exports) {
            expect(exports.module0).toEqual('module0');
            expect(exports.module1).toEqual('module1');
            expect(exports.module2).toEqual('module2');

            expect(exports.nodeModuleA).toEqual('a/a-b');

            expect(exports.text).toEqual('text');
            expect(exports.text_js).toEqual('text');
            expect(exports.text_text).toEqual('text');
            expect(exports.text_url).toMatch(/^http/);
            expect(exports.text_base64).toMatch(/^http/);

            expect(exports.json).toEqual({});
            expect(exports.json_js).toEqual({});
            expect(exports.json_text).toEqual('{}');
            expect(exports.json_url).toMatch(/^http/);
            expect(exports.json_base64).toMatch(/^http/);

            expect(exports.css).toMatch(/body\s*\{/);
            expect(exports.css_js).toMatch(/body\s*\{/);
            expect(exports.css_text).toMatch(/body\s*\{/);
            expect(exports.css_url).toMatch(/^http/);
            expect(exports.css_base64).toMatch(/^http/);
            expect(exports.css_style.nodeType).toEqual(1);

            expect(exports.html).toEqual('<br/>');
            expect(exports.html_js).toEqual('<br/>');
            expect(exports.html_text).toEqual('<br/>');
            expect(exports.html_url).toMatch(/^http/);
            expect(exports.html_base64).toMatch(/^http/);

            expect(exports.file).toMatch(/^http/);
            expect(exports.file_js).toMatch(/^http/);
            expect(exports.file_text).toMatch(/^http/);
            expect(exports.file_url).toMatch(/^http/);
            expect(exports.file_base64).toMatch(/^http/);

            exports.async(function (exports) {
                expect(exports).toEqual('module5');
                done();
            });
            expect(getStyle(document.body, 'width')).toEqual('100px');
        });
    });
});
