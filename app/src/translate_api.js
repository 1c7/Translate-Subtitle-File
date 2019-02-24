const translate = require('google-baidu-translate-api')
const SogouTranslate = require('sogou-translate');
const sogou = new SogouTranslate('c86ad6900b177666166f609b55135c75', '8cec7d6e04183750aba6ae00811bfd37');

exports.translate = translate
// 先尝试使用 google 翻译，如果失败再使用 baidu 翻译, 根据文档: https://github.com/eyasliu/google-baidu-translate-api

// Google Translate API
exports.google = translate.google


// Baidu Translate API
exports.baidu = translate.baidu

// Sogou Translate API

exports.sogou = sogou
