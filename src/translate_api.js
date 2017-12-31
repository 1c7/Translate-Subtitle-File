const $ = require('jquery')  // jQuery now loaded and assigned to $
const common = require('./common.js');

// Google Translate API
exports.google = function(sourceText, sourceLang, targetLang) {
  var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + common.encodeURIfix(sourceText)
  return $.ajax({
    url: url,
    method: 'GET'
  })
}