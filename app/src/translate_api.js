const translate = require('google-baidu-translate-api')
const SogouTranslate = require('sogou-translate');
const sogou = new SogouTranslate('', '');
// TODO: 这里的 key 和 secret 在正式发布之前需要去掉，这是别人的

exports.translate = translate
// 先尝试使用 google 翻译，如果失败再使用 baidu 翻译, 根据文档: https://github.com/eyasliu/google-baidu-translate-api

// Google Translate API
exports.google = translate.google

// Baidu Translate API
exports.baidu = translate.baidu

// Sogou Translate API
exports.sogou = sogou
