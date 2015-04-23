/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-17 15:04
 */

'use strict';


describe('modules', function () {
    coolie.config({
        base: './test/modules/'
    });

    it('module1 + module2', function (done) {
        coolie.callback(function (main) {
            main.should.be.equal(579);
            done();
        });
    });

    coolie.use('./main.js');
});