/*!
 * 主测试文件
 * @author ydr.me
 * @create 2014-11-17 15:04
 */

'use strict';


describe('main', function () {


    it('main', function (done) {
        coolie.callback(function (main) {
            done();
        });
    });

    coolie.config({
        base: './test/modules/',
        version: {
            './module5.js': 'abc123'
        }
    });
    coolie.use('./main.js');
});
