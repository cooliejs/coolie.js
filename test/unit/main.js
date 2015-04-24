/*!
 * 主测试文件
 * @author ydr.me
 * @create 2014-11-17 15:04
 */

'use strict';


describe('main', function () {


    it('main', function (done) {
        coolie.callback(function () {
            expect(coolie.modules).toBeDefined();
            expect(coolie.configs).toBeDefined();

            var list = [1,2,3];

            coolie.each(list, function (index, value) {
                expect(value).toBe(list[index]);
            });

            coolie.each(list, function (index, value) {
                expect(value).toBe(list[index]);
            }, true);

            done();
        });
    });

    coolie.config({
        base: './test/modules/',
        version: {
            './module5.js': 'abc123'
        }
    }).use('./main.js');
});
