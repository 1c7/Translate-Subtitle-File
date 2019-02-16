const fs = require('fs')
const { promisify } = require('util')
// 公用函数，如清理换行，返回文件后缀等

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

function downloadFile(content, filePath) {
  return promisify(fs.writeFile)(filePath, content)
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

exports.remove_tag_keep_text = remove_tag_keep_text
exports.get_suffix = get_suffix
exports.properFileSize = properFileSize
exports.downloadFile = downloadFile
exports.deepClone = deepClone