const translate = require('google-baidu-translate-api')

exports.translate = translate
// 先尝试使用 google 翻译，如果失败再使用 baidu 翻译, 根据文档: https://github.com/eyasliu/google-baidu-translate-api

// Google Translate API
exports.google = translate.google


// Baidu Translate API
exports.baidu = translate.baidu

