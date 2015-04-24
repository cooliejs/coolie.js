/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-17 15:04
 */

'use strict';


describe('main', function () {
    coolie.config({
        base: './test/modules/'
    });

    it('main', function (done) {
        coolie.callback(function (main) {
            //main.should.be.equal(579);
            //Object.keys(coolie.modules).length.should.be.equal(3);
            //coolie.configs.should.be.not.equal(undefined);
            //define.should.be.not.equal(undefined);
            //define.amd.should.be.not.equal(undefined);
            //define.cmd.should.be.not.equal(undefined);
            done();
        });
    });

    coolie.use('./main.js');
});
