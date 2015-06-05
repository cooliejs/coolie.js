/*!
 * 主测试文件
 * @author ydr.me
 * @create 2014-11-17 15:04
 */



describe('main', function () {
    'use strict';

    coolie.config({
        base: '../modules/',
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
