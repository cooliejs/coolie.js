
console.log('js|text', require('./file.js', 'js|text'));
console.log('js|url', require('./file.js', 'js|url'));
console.log('file', require('./text.png', 'file'));
console.log('file|url', require('./text.png', 'file|url'));
console.log('file|base64', require('./text.png', 'file|base64'));
