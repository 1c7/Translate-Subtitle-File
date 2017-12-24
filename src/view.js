const $ = require('jquery')  // jQuery now loaded and assigned to $
const shell = require('electron').shell
const os = require('os')
const ipc = require('electron').ipcRenderer
const fs = require("fs");
const parser = require('subtitles-parser'); // 解析字幕文件内容
const path = require('path');

const LENGTH_LIMIT_PER_REQUEST = 5000;
// 5000 this number is from https://translate.google.com/ input box bottom right cornor

var data = null; // 存字幕文件解析后的 JS 对象。所有字幕数据都在这里。

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
    // fs
    // var data = fs.readFileSync(selectedFile.path);
    // console.log("Synchronous read: " + data.toString());

    selectedFile = app.selectedFile; // from vue
    // 这一大段 if 就是遍历字幕，然后一块块发请求出去，而不是一行字幕就发一个请求。
    if (selectedFile != null){
      var srt = fs.readFileSync(selectedFile.path, 'utf8');
      data = parser.fromSrt(srt);

      var a_batch_original_text = ''; // 一批一批的翻译。
      for (var index = 0; index < data.length; index++) {
        var element = data[index];
        var only_text = remove_tag_keep_text(element.text);

        var new_length = encodeURIComponent(a_batch_original_text + only_text + '%0A').length;
        if (new_length < LENGTH_LIMIT_PER_REQUEST){
          a_batch_original_text += only_text + '%0A';
          // 如果到了最后一行还是没超过 LENGTH_LIMIT_PER_REQUEST
          if(data.length - 1 == index){
            translate(a_batch_original_text, index);
          }
        }else{
          translate(a_batch_original_text, index);
          a_batch_original_text = ''; // 清理掉这一批
          index--; // 不然会掉一行没翻译。
        }
      }
    }// if end
  })// click end

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

// 翻译
// 用了外部的 data 变量
// 顺序不会永远保持一致
function translate(a_batch_original_text, line){
  translate_api(a_batch_original_text, 'en', 'zh-cn').then(function (result) {
    var result_array = result[0];
    var starting_point = line - result_array.length + 1; // 算出这些结果从哪一行开始

    for (var index = 0; index < result_array.length; index++) {
      var result_text = result_array[index][0];
      var line_position = parseInt(starting_point) + parseInt(index);
      data[line_position].text = result_text + data[line_position].text;
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
  var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + sourceText
  return $.ajax({
    url: url,
    method: 'GET'
  })
}
