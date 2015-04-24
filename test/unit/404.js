/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-24 11:55
 */

'use strict';

describe('测试组', function () {
    it('测试单元', function (done) {
        coolie.config({
            base: './test/modules/'
        });

        coolie.use('./404.js');
    });
});
