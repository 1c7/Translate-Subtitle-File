const assParser = require('ass-parser'); // for ASS
const assStringify = require('ass-stringify'); // for ASS
const shell = require('electron').shell
const path = require('path');
const T = require('./translate_api.js');
const common = require('./common.js');
const config = require('./config.js');

var data = '';
var body = '';
var first_line_is_Format = '';
var send_many_request = 0;
var receive_many_request = 0;

exports.translate = function (raw_content) {
  data = assParser(raw_content);
  body = data[3]['body'];
  first_line_is_Format = body[0];
  body.shift()

  var a_batch_original_text = ''; // 一批批翻译
  for (var i = 0; i <= body.length-1; i++) {
    var element = body[i];
    if (element.key == 'Dialogue') {
      var text = element.value.Text;
      var only_text = common.remove_tag_keep_text(text);
      only_text = common.remove_curly_brace_keep_text(only_text);
      only_text = common.remove_all_line_break(only_text);

      var new_length = encodeURIComponent(a_batch_original_text + only_text + config.LINE_BREAK).length;
      if (new_length < config.LENGTH_LIMIT_PER_REQUEST) {
        a_batch_original_text += only_text + config.LINE_BREAK;
        // 如果到最后一行还是没超过 LENGTH_LIMIT_PER_REQUEST
        if (body.length-1 == i) {
          translate_batch(a_batch_original_text, i+1);
        }
      } else {
        translate_batch(a_batch_original_text, i);
        a_batch_original_text = ''; // 清理掉这一批
        i--; // 不然会掉一行没翻译
      }
    }
  }
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