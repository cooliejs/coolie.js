/*!
 * 主测试文件
 * @author ydr.me
 * @create 2014-11-17 15:04
 */


describe('main', function () {
    'use strict';

    coolie.config({
        base: coolie.resolvePath(coolie.dirname, './test/modules/'),
        version: {
            './module0.js': 'abc123'
        }
    }).use('./main.js');

    var getStyle = function (el, cssKey) {
        return getComputedStyle(el).getPropertyValue(cssKey);
    };

    it('main', function (done) {
        coolie.callback(function (exports) {
            expect(exports.module0).toEqual('module0');
            expect(exports.module1).toEqual('module1');
            expect(exports.module2).toEqual('module2');
            expect(exports.module3).toEqual('module3');
            expect(exports.module4).toEqual({});
            exports.async(function (exports) {
                expect(exports).toEqual('module5');
                done();
            });
            expect(getStyle(document.body, 'width')).toEqual('100px');

            expect(coolie.resolvePath('../../../aa/', '')).toEqual('../../../aa/');
            expect(coolie.resolvePath('/aa/', '../bb/cc/')).toEqual('/bb/cc/');
            expect(coolie.resolvePath('/aa/a.js', '../bb/cc/')).toEqual('/bb/cc/');
            expect(coolie.resolvePath('/aa/a.js', './bb/cc/')).toEqual('/aa/bb/cc/');
            expect(coolie.resolvePath('http://locahost:9876/base/node_modules/coolie.js/', '../../'))
                .toEqual('http://locahost:9876/base/');
        });
    });
});
