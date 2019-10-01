// 核心翻译组件
const fs = require("fs");
const path = require('path')
const { shell } = require('electron')
const ass = require('./ass.js');
const srt = require('./srt.js');
const common = require('./common.js');

// 翻译
// file 待翻译的文件 (类型是 __)
// to 目标语言
// from 源语言
// selApi 用哪家翻译 API
function translate(file, to, from = 'auto', selApi) {
  if (file == undefined){
    throw 'file empty';
  }
  var content = fs.readFileSync(file.path, 'utf8');
  var suffix = common.get_suffix(file.name);
  if (suffix == 'srt') {
      console.log(srt.translate(content, to, from));
    return srt.translate(content, to, from, selApi);
  } else if (suffix == 'ass') {
    return ass.translate(content, to, from, selApi);
  }
}

// 下载文件
// prefix  是文件名前缀
function download(file, prefix = '') {
  var suffix = common.get_suffix(file.name);
  let content = ''
  // 判断后缀来导出内容
  if (suffix == 'srt') {
    content = srt.exportContent(file)
  } else if (suffix == 'ass') {
    content = ass.exportContent(file)
  }
  // 拼接文件路径
  const folder = path.dirname(file.path)
  const filePath = path.join(folder, prefix + file.name)
  // 保存文件然后显示
  // 这里 return 的是 promise
  const p = common.downloadFile(content, filePath).then(() => {
    shell.showItemInFolder(filePath)
  })
  return p
}

exports.translate = translate;
exports.download = download;

