const parser = require('subtitles-parser'); // for SRT, support 'fromSrt' and 'toSrt'
const common = require('./common.js');
const config = require('./config.js');
const {translate: translateAPI} = require('./translate_api.js');
const shell = require('electron').shell
const path = require('path');

var data = '';
var send_many_request = 0;
var receive_many_request = 0;
var temp_arr = [];

function translate(content, to, from) {
  const data = parser.fromSrt(content);
  const lastID = data[data.length - 1].id

  // 翻译分组批量翻译，快凑齐了 config.LENGTH_LIMIT_PER_REQUEST: 5000 字符数时一起翻译
  const batchs = data.reduce((batch, block) => {
    let bat
    if (batch.length) {
      bat = batch.pop()
    } else {
      bat = {
        content: '',
        includes: []
      }
    }
    const text = common.remove_tag_keep_text(block.text)
    const nextContent = bat.content + text + config.LINE_BREAK
    const nextLength = encodeURIComponent(nextContent).length
    if (nextLength < config.LENGTH_LIMIT_PER_REQUEST && bat.includes.length < 100) {
      bat.content = nextContent
      bat.includes.push(block)
    } else {
      batch.push(bat)
      bat = {
        content: text + config.LINE_BREAK,
        includes: [block]
      }
    }
    batch.push(bat)
    return batch
  }, [])

  console.log(batchs)

  const translateProcess = batchs.map(bat => {
    return translateAPI(bat.content, to, from).then(res => {
      bat.result = res.dist
      return bat
    }).catch(err => {
      console.log('有一批翻译失败', err, bat.content)
      bat.result = ''
      return bat
    })
  })
  return Promise.all(translateProcess).then(bats => {
    const res = bats.reduce((list, bat) => {
      const strs = bat.result.split(/[％|\%]?0A/)
      console.log(strs.length, bat.includes.length)
      const items = bat.includes.map((block, index) => ({
        endTime: block.endTime,
        startTime: block.startTime,
        id: String(Number(lastID) + Number(block.id)),
        text: (strs[index] || block.text).trim(),
      }))
      
      return list.concat(items)
    }, [])
    return {
      parse: data,
      translate: res
    }
  })
}

function exportContent(data) {
  const srtData = data.parse.concat(data.translateData)
  const content = parser.toSrt(srtData)
  // console.log(content)
  return content
}


// not using \N, we use 2 line.
function translate_batch(a_batch_original_text, line) {
  send_many_request = send_many_request + 1;
  return translate_api.google(a_batch_original_text, 'en', 'zh-cn').then(function (result) {
    var result_array = result[0];
    var starting_point = line - result_array.length; // 算出这些结果从哪一行开始
    for (var index = 0; index < result_array.length; index++) {
      var result_text = result_array[index][0];
      var line_position = parseInt(starting_point) + parseInt(index);
      data[line_position].result = result_text // 把结果存在 result 属性里，之后再处理
    }
    receive_many_request = receive_many_request + 1;
    if (receive_many_request == send_many_request) {
      // 现在全部翻译完了，我们把中文都加到后面去。
      for (var i = 0; i < data.length; i++) {
        var one_line = data[i];
        var copy_line = JSON.parse(JSON.stringify(one_line));
        copy_line.text = String(copy_line.result)
        copy_line.id = String(data.length + i + 1);
        temp_arr.push(copy_line);
      }
      var huge_arr = data.concat(temp_arr);

      // 转换结果到 SRT 格式。
      var final_result = parser.toSrt(huge_arr);
      // 获得原字幕文件路径
      var onlyPath = path.dirname(app.selectedFile.path);
      // 构造新路径和新文件名
      var new_path = path.join(onlyPath, '(翻译后)' + app.selectedFile.name);
      // 保存文件，并在文件夹中显示文件
      try {
        fs.writeFileSync(new_path, final_result, 'utf-8');
        shell.showItemInFolder(new_path);
      }
      catch (e) {
        alert('Failed to save the file !');
      }
      // 回到初始状态
      app.cancel_file_select(); // from vue
      receive_many_request = 0;
      send_many_request = 0;
    }
  })
}

exports.translate = translate;
exports.exportContent = exportContent;