const fs = require("fs");
const ass = require('./ass.js');
const srt = require('./srt.js');
const common = require('./common.js');

function translate(file) {
  if (file == undefined){
    throw 'file empty';
  }
  var content = fs.readFileSync(file.path, 'utf8');
  var suffix = common.get_suffix(file.name);
  try {
    if (suffix == 'srt') {
      srt.translate(content);
    } else if (suffix == 'ass') {
      ass.translate(content);
    }
  } catch (err) {
    console.log('错误');
    console.log(err);
  }
}

exports.translate = translate;
