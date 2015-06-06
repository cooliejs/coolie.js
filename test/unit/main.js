/*!
 * 主测试文件
 * @author ydr.me
 * @create 2014-11-17 15:04
 */


describe('main', function () {
    'use strict';

    var currentScript = coolie.getCurrentScript();
    var currentScriptURL = coolie.getScriptURL(currentScript);
    var host = coolie.getHost(currentScriptURL);
    var dir = coolie.getPathDir(currentScriptURL);

    coolie.config({
        base: host + coolie.getPathJoin(dir, '../modules/'),
        version: {
            './module5.js': 'abc123'
        }
    }).use('./main.js');

    it('main', function (done) {
        coolie.callback(function (ret) {
            expect(ret).toEqual(123 + 456);

            done();
        });
    });
});
