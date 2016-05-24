coolie.config({
    mainModulesDir: './'
}).use(['./main1.js', './main2.js'], function (main1, main2) {
    console.log('coolie.use.callback', main1, main2);
}).callback(function (main1, main2) {
    console.log('coolie.callback', main1, main2);
});