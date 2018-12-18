// 公用函数，如清理换行，返回文件后缀等

// Little hack to fix Google Translate line break
function encodeURIfix(str) {
  str = str.replace(/!(\s)+/g, '!'); // "Hello! World" -> "Hello!World"
  // reason for this is Google API would have line break if it see a "! " 
  // (a examation exclamation mark follow by a white space)
  // not sure why, you can test it yourself, https://translate.google.com/
  str = str.replace(/\./g, ''); // . 
  str = str.replace(/\;/g, '');  // ;
  str = str.replace(/\?(\s)+/g, '?'); // ?
  // same reason as above. to avoid line break
  return str;
}


// Remove all tag, but keep text inside tag.
// Code from: https://stackoverflow.com/questions/5002111/javascript-how-to-strip-html-tags-from-string
// Input: <font color="#3399CC">Subtitles by </font><font color="ffffff">MemoryOnSmells</font>
// Output: Subtitles by MemoryOnSmells
function remove_tag_keep_text(str) {
  var div = document.createElement("div");
  div.innerHTML = str;
  var text = div.textContent || div.innerText || "";
  return text;
}

// Remove all {}
// Input: "{\c&HCC9933&}Subtitles by {\c\c&HFFFFFF &}MemoryOnSmells{\c} {\c&HCC9933&}Exclusive for http://UKsubtitles.ru{\c}"
// Output: "Subtitles by MemoryOnSmells  Exclusive for http://UKsubtitles.ru"
function remove_curly_brace_keep_text(str) {
  return str.replace(/\s*\{.*?\}\s*/g, ' ').trim();
}

function remove_all_line_break(str) {
  return str.replace(/\r?\n|\r/g, ' ');
}

function get_suffix(filename) {
  return filename.split('.').pop()
}

function properFileSize(fileSizeInBytes) {
  var i = -1;
  var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
  do {
    fileSizeInBytes = fileSizeInBytes / 1024;
    i++;
  } while (fileSizeInBytes > 1024);
  return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

exports.encodeURIfix = encodeURIfix
exports.remove_tag_keep_text = remove_tag_keep_text
exports.remove_curly_brace_keep_text = remove_curly_brace_keep_text
exports.remove_all_line_break = remove_all_line_break
exports.get_suffix = get_suffix
exports.properFileSize = properFileSize