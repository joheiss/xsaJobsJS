/*eslint-env node, es6*/
/**
 * Run gulp via script.
 * This is to be used to debug the tests.
 **/

const gulp = require("gulp");
require("./gulpfile");

// run tests without coverage to allow debugging
gulp.start("test");