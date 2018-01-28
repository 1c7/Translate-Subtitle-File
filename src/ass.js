const assParser = require('ass-parser'); // for ASS
const assStringify = require('ass-stringify'); // for ASS
const shell = require('electron').shell
const path = require('path');
const translate_api = require('./translate_api.js');
const common = require('./common.js');
const config = require('./config.js');

var data = '';
var send_many_request = 0;
var receive_many_request = 0;

exports.translate = function(raw_content) {
  data = assParser(raw_content);
  var body = data[3]['body'];
  var a_batch_original_text = ''; // 一批一批的翻译。

  for (var index = 0; index < body.length; index++) {
    var element = body[index];
    if (element.key == 'Dialogue') {
      var text = element.value.Text;
      var only_text = common.remove_tag_keep_text(text);
      only_text = common.remove_curly_brace_keep_text(only_text);
      only_text = common.remove_all_line_break(only_text);

      var new_length = encodeURIComponent(a_batch_original_text + only_text + config.LINE_BREAK).length;
      if (new_length < config.LENGTH_LIMIT_PER_REQUEST) {
        a_batch_original_text += only_text + config.LINE_BREAK;
        // 如果到了最后一行还是没超过 LENGTH_LIMIT_PER_REQUEST
        if (data.length - 1 == index) {
          translate_batch(a_batch_original_text, index + 1);
        }
      } else {
        translate_batch(a_batch_original_text, index);
        a_batch_original_text = ''; // 清理掉这一批
        index--; // 不然会掉一行没翻译。
      }
    }
  }

}

// 代码大致能用，有点乱，之后再整理，
// 现在下面这一段能用，但前提是字幕文件里没有"注释" (Aegisub 右上角打勾那种)
// 注释会导致翻出来的汉语滑动到下一行（如果有一行注释的话）
// 还有最后7行没有翻译，得看看咋回事，但是现在我先 commit 这段代码算是备份下先，
// TODO: fix comment scrabble result problem(shirt result by 1 line or so)
// TODO: last 7 line left untranslate, checkout why and fix it.
// we use 2 line, not \N
function translate_batch(a_batch_original_text, line) {
  send_many_request = send_many_request + 1;

  translate_api.google(a_batch_original_text, 'en', 'zh-cn').then(function (result) {
    var result_array = result[0];
    var body = data[3]['body'];
    var starting_point = line - result_array.length;

    for (var index = 0; index < result_array.length; index++) {
      var result_text = result_array[index][0];
      var line_position = parseInt(starting_point) + parseInt(index);
      // var original_line = data[3]['body'][line_position].value.Text
      // data[3]['body'][line_position].value.Text = common.remove_all_line_break(result_text) + '\\N' + original_line
      data[3]['body'][line_position].value.CustomResult = common.remove_all_line_break(result_text)
    }

    receive_many_request = receive_many_request + 1;
    if (receive_many_request == send_many_request) {
      var temp_arr = [];
      for (var index = 0; index < body.length; index++) {
        var element = body[index];
        if (element.key == 'Dialogue') { // 如果是注释会是 "Comment"
          var text = element.value.CustomResult;
          var new_element = JSON.parse(JSON.stringify(element)); // copy object
          new_element.value.Text = text;
          temp_arr.push(new_element)
        }
      }
      
      // copy a object 
      var format = data[3]['body'][0];
      body.shift()
      var new_arr = body.concat(temp_arr);
      new_arr.unshift(format);
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