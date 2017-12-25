const $ = require('jquery')  // jQuery now loaded and assigned to $
const shell = require('electron').shell
const os = require('os')
const ipc = require('electron').ipcRenderer
const fs = require("fs");
const parser = require('subtitles-parser'); // for SRT, support 'fromSrt' and 'toSrt'
const path = require('path');
const assParser = require('ass-parser'); // for ASS, 'assParser'
const assStringify = require('ass-stringify'); // for ASS, 'assParser'

const LENGTH_LIMIT_PER_REQUEST = 5000; // 5000 is from https://translate.google.com/ input box bottom right cornor
var data = null; // 存字幕文件解析后的 JS 对象。所有字幕数据都在这里。

const line_break = '%0A';

// 发了多少个
var send_many_request = 0;
// 收到多少个
var receive_many_request = 0;

$(function(){

  // animate border
  $('.dropzone-wrapper').on('mouseenter', function () {
    $(this).addClass('animate');
  }).on('mouseleave', function () { 
    $(this).removeClass('animate'); 
  });

  // choose file.
  $('#hint').click(function(){
    $('#file-input').click();
  })

  $('#button-area').click(function(){
    selectedFile = app.selectedFile; // from vue
    // 如果没选文件
    if (selectedFile == null) {
      alert('请先选择一个文件再开始翻译');
      return false;
    }
    // 如果选了文件
    var content = fs.readFileSync(selectedFile.path, 'utf8');
    if (get_suffix(selectedFile.name) == 'srt'){
      handle_SRT(content);
    } else if (get_suffix(selectedFile.name) == 'ass'){
      handle_ASS(content);
    } else{
      alert('这是什么神秘的格式? 无法解读..');
      return false;
    }
  })

});

// Remove all tag, but keep text inside tag.
// Code from: https://stackoverflow.com/questions/5002111/javascript-how-to-strip-html-tags-from-string
// Input: <font color="#3399CC">Subtitles by </font><font color="ffffff">MemoryOnSmells</font>
// Output: Subtitles by MemoryOnSmells
function remove_tag_keep_text(str){
  var div = document.createElement("div");
  div.innerHTML = str;
  var text = div.textContent || div.innerText || "";
  return text;
}

//
// Input: "{\c&HCC9933&}Subtitles by {\c\c&HFFFFFF &}MemoryOnSmells{\c} {\c&HCC9933&}Exclusive for http://UKsubtitles.ru{\c}"
// Output: "Subtitles by MemoryOnSmells  Exclusive for http://UKsubtitles.ru"
function remove_curly_brace_keep_text(str){
  return str.replace(/\s*\{.*?\}\s*/g, ' ').trim();
}

function remove_all_line_break(str){
  return str.replace(/\r?\n|\r/g, ' ');
}

// 翻译 srt
// 用了外部的 data 变量
// ajax promise 发请求和收到结果的顺序不会永远保持一致
function translate_SRT(a_batch_original_text, line){
  translate_api(a_batch_original_text, 'en', 'zh-cn').then(function (result) {
    var result_array = result[0];
    var starting_point = line - result_array.length + 1; // 算出这些结果从哪一行开始

    for (var index = 0; index < result_array.length; index++) {
      var result_text = result_array[index][0];
      var line_position = parseInt(starting_point) + parseInt(index);
      data[line_position].text = result_text + data[line_position].text; // 修改 text 节点，这样 toSRT 的时候能保存下来。
      data[line_position].result = result_text;
    }

    if(check_finish()){
      // 转换结果到 SRT 格式。
      var final_result = parser.toSrt(data);

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
    }
  });
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
    }
  });
}

function handle_ASS(raw_content){
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
        if (index+1 >= body.length) {
          translate_ASS(a_batch_original_text, index+1);
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

// return true | false
function check_finish(){
  for (var i = 0; i < data.length; i++) {
    if (data[i].hasOwnProperty('result')) {
      continue;
    } else {
      return false;
    }
  }
  return true;
}

// Google Translate API
function translate_api(sourceText, sourceLang, targetLang){
  var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURIfix(sourceText)
  return $.ajax({
    url: url,
    method: 'GET'
  })
}

function handle_SRT(content){
  data = parser.fromSrt(content);
  var a_batch_original_text = ''; // 一批一批的翻译。
  for (var index = 0; index < data.length; index++) {
    var element = data[index];
    var only_text = remove_tag_keep_text(element.text);
    console.log(only_text); // 重复了？？？
    
    var new_length = encodeURIComponent(a_batch_original_text + only_text + '%0A').length;
    if (new_length < LENGTH_LIMIT_PER_REQUEST) {
      a_batch_original_text += only_text + '%0A';
      // 如果到了最后一行还是没超过 LENGTH_LIMIT_PER_REQUEST
      if (data.length - 1 == index) {
        translate_SRT(a_batch_original_text, index);
        // index--; // 不然会掉一行没翻译。
      }
    } else {
      translate_SRT(a_batch_original_text, index);
      a_batch_original_text = ''; // 清理掉这一批
      index--; // 不然会掉一行没翻译。
    }
  }
}

// 
// Some little hack to fix Google Translate line break
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