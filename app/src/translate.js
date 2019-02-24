const fs = require("fs");
const path = require('path')
const { shell } = require('electron')
const ass = require('./ass.js');
const srt = require('./srt.js');
const common = require('./common.js');

// 翻译
function translate(file, to, from = 'auto', selApi) {
  console.log('进入这里');
  if (file == undefined){
    throw 'file empty';
  }
  var content = fs.readFileSync(file.path, 'utf8');
  var suffix = common.get_suffix(file.name);
  console.log(`后缀是 ${suffix}`);
  if (suffix == 'srt') {
      console.log(srt.translate(content, to, from));
    return srt.translate(content, to, from, selApi);
  } else if (suffix == 'ass') {
    return ass.translate(content, to, from, selApi);
  }
}

// 下载
function download(file, prefix = '') {
  var suffix = common.get_suffix(file.name);
  let content = ''
  if (suffix == 'srt') {
    content = srt.exportContent(file)
  } else if (suffix == 'ass') {
    content = ass.exportContent(file)
  }
  const folder = path.dirname(file.path)
  const filePath = path.join(folder, prefix + file.name)
  const p = common.downloadFile(content, filePath).then(() => {
    shell.showItemInFolder(filePath)
  })
  return p
}

exports.translate = translate;
exports.download = download;

