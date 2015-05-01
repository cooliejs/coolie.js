/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-26 01:56
 */


'use strict';


var gulp = require('gulp');
var react = require('gulp-react');
var watch = require('gulp-watch');

gulp.task('default', function () {
    return watch('./examples/react/*.jsx', function () {
        gulp.src('./examples/react/*.jsx')
            .pipe(react())
            .pipe(gulp.dest('./examples/react/'));
    });
});



