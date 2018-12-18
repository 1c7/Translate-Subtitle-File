const $ = require('jquery')  // jQuery now loaded and assigned to $
const common = require('./common.js');
const translate = require('google-baidu-translate-api')

exports.translate = translate

// Google Translate API
exports.google = translate.google
// exports.google = function(sourceText, sourceLang, targetLang) {
//   var url = "https://translate.googleapis.cn/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + common.encodeURIfix(sourceText)
//   return $.ajax({
//     url: url,
//     method: 'GET'
//   })
// }

// Baidu Translate API
exports.baidu = translate.baidu
// exports.baidu = function(sourceText, sourceLang, targetLang) {
//   var url = "https://crashcourse.club/api/translate/q=" +common.encodeURIfix(sourceText) + "&from="+ sourceLang + "&to=" + targetLang
//   return $.ajax({
//     url: url,
//     method: 'GET'
//   })
// }
