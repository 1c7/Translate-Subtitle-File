const assParser = require('ass-parser'); // for ASS
const assStringify = require('ass-stringify'); // for ASS
const shell = require('electron').shell
const path = require('path');
const {translate: translateAPI} = require('./translate_api.js');
const common = require('./common.js');
const config = require('./config.js');

var data = '';
var body = '';
var first_line_is_Format = '';
var send_many_request = 0;
var receive_many_request = 0;

exports.translate = function (raw_content, to, from) {
  const parse = assParser(raw_content);
  const data = parse[3]['body'];
  // first_line_is_Format = body[0];


  // 翻译分组批量翻译，快凑齐了 config.LENGTH_LIMIT_PER_REQUEST: 5000 字符数时一起翻译
  const batchs = data.reduce((batch, block) => {
    if (block.key !== 'Dialogue') {
      return batch
    }
    let bat
    if (batch.length) {
      bat = batch.pop()
    } else {
      bat = {
        content: '',
        includes: []
      }
    }
    const text = common.remove_tag_keep_text(block.value.Text)
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

      const items = bat.includes.map((block, index) => {
        const item = {
          key: block.key,
          value: JSON.parse(JSON.stringify(block.value)),
        }
        item.value.Text = (strs[index] || block.value.Text).trim()
        return item
      })
      return list.concat(items)
    }, [])
    return {
      parse: parse,
      translate: res
    }
  })
}

exports.exportContent = function(data) {
  data.parse[3].body = data.parse[3].body.concat(data.translateData)
  const assData = JSON.parse(JSON.stringify(data.parse))
  const content = assStringify(assData)
  // console.log(content)
  return content
}

// we use 2 line, not \N
function translate_batch(a_batch_original_text, line) {
  send_many_request = send_many_request + 1;

  T.google(a_batch_original_text, 'en', 'zh-cn').then(function (result) {
    // 下面这一堆做的是，把翻译结果赋值给那一行字幕的 CustomResult 属性，便于后面处理。
    var result_array = result[0];
    var body_index = line - result_array.length; // body_index 用于找到 body 里那一行原始字幕
    var result_index = 0; // result_index 用于拿翻译返回结果里的一行
    for (body_index; body_index < line; body_index++) {
      var element = body[body_index];
      if (element.key == 'Dialogue') {
        var result_text = result_array[result_index][0];
        result_index = result_index + 1;
        element.value.CustomResult = common.remove_all_line_break(result_text);
      }
    }
    receive_many_request = receive_many_request + 1;
    if (receive_many_request == send_many_request) {
      // 因为我们要2行字幕，而不是\N分开，那么这里复制原字幕那一行，得到一行新的。
      // 然后用 CustomResult 覆盖掉 text，然后新的这行中文字幕，推到一个临时数组里。
      var temp_arr = [];
      for (var index = 0; index < body.length; index++) {
        var element = body[index];
        if (element.key == 'Dialogue') {
          var new_element = JSON.parse(JSON.stringify(element)); // copy object
          new_element.value.Text = element.value.CustomResult;
          temp_arr.push(new_element)
        }
      }
      // 把 temp_arr 这个装满中文字幕的数组，一次性塞到文件后面。
      var new_arr = body.concat(temp_arr);
      new_arr.unshift(first_line_is_Format);
      data[3]['body'] = new_arr;
      
      var final_result = assStringify(data);
      var onlyPath = path.dirname(app.selectedFile.path);
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
  });
}