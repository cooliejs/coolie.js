/*!
 * 主测试文件
 * @author ydr.me
 * @create 2014-11-17 15:04
 */

'use strict';


describe('main', function () {
    coolie.config({
        base: './test/modules/',
        version: {
            './module5.js': 'abc123'
        }
    });

    it('main', function (done) {
        coolie.callback(function (main) {
            done();
        });
    });

    coolie.use('./main.js');
});
