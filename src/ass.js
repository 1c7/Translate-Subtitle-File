const assParser = require('ass-parser'); // for ASS, 'assParser'
const assStringify = require('ass-stringify'); // for ASS, 'assParser'
const shell = require('electron').shell
const path = require('path');

var PI = 3.14; // PI will not be accessible from outside this module

exports.area = function (r) {
  return PI * r * r;
};

var data = '';
function handle_ASS(raw_content) {
  data = assParser(raw_content);
  var body = data[3]['body'];
  var a_batch_original_text = ''; // 一批一批的翻译。

  for (var index = 0; index < body.length; index++) {
    var element = body[index];
    if (element.key == 'Dialogue') {
      var text = element.value.Text;
      var only_text = remove_tag_keep_text(text);
      only_text = remove_curly_brace_keep_text(only_text);
      only_text = remove_all_line_break(only_text);

      var new_length = encodeURIComponent(a_batch_original_text + only_text + '%0A').length;
      if (new_length < LENGTH_LIMIT_PER_REQUEST) {
        a_batch_original_text += only_text + '%0A';
        // 如果到了最后一行还是没超过 LENGTH_LIMIT_PER_REQUEST
        if (index + 1 >= body.length) {
          translate_ASS(a_batch_original_text, index + 1);
        }
      } else {
        translate_ASS(a_batch_original_text, index);
        // console.log(a_batch_original_text);
        a_batch_original_text = ''; // 清理掉这一批
        index--; // 不然会掉一行没翻译。
      }
    }
  }

}


// 翻译 ass
// 用了外部的 data 变量
// ajax promise 发请求和收到结果的顺序不会永远保持一致
function translate_ASS(a_batch_original_text, line) {
  send_many_request = send_many_request + 1;

  translate_api(a_batch_original_text, 'en', 'zh-cn').then(function (result) {
    var result_array = result[0];
    var body = data[3]['body'];

    // 算出从哪一行开始
    var starting_point = line - result_array.length;
    for (var index = 0; index < result_array.length; index++) {
      var result_text = result_array[index][0];
      var line_position = parseInt(starting_point) + parseInt(index);
      var original_line = data[3]['body'][line_position].value.Text
      data[3]['body'][line_position].value.Text = remove_all_line_break(result_text) + '\\N' + original_line
    }
    receive_many_request = receive_many_request + 1;
    if (receive_many_request == send_many_request) {
      // console.log(data[3]['body']);
      var final_result = assStringify(data);
      console.log(final_result);

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
  });
}



