let $ = require('jquery')  // jQuery now loaded and assigned to $
const shell = require('electron').shell
const os = require('os')
const ipc = require('electron').ipcRenderer
// const fs = require("fs");
var parser = require('subtitles-parser'); // 解析字幕文件内容

var length_limit_per_request = 5000;
// 5000 this number is from https://translate.google.com/ input box bottom right cornor

// 保存已提交文件
var selectedFile = null;

$(function(){

  // animate
  $('.dropzone-wrapper').on('mouseenter', function () {
    $(this).addClass('animate');
  }).on('mouseleave', function () { 
    $(this).removeClass('animate'); 
  });

  // choose file.
  $('#hint').click(function(){
    // console.log('点击了')
    $('#file-input').click();
  })

  // when file change.
  $(document).on('change', '#file-input', function (event) { 
    // console.log('ha');
    
    selectedFile = document.getElementById('file-input').files[0];
    // console.log(selectedFile);

    // 界面切换
    $('#selected-file-area').show();
    $('.dropzone-wrapper').hide();
  });

  $('#button-area').click(function(){

    // translate('Hello', 'en', 'zh-cn').then(function (data) {
    //   console.log(data[0][0][0]);
    // });

    // console.log(result);
    
    // console.log(selectedFile);

    // var root = 'https://jsonplaceholder.typicode.com';

    // $.ajax({
    //   url: root + '/posts/1',
    //   method: 'GET'
    // }).then(function (data) {
    //   console.log(data);
    // });

    // fs
    // var data = fs.readFileSync(selectedFile.path);
    // console.log("Synchronous read: " + data.toString());
    // console.log("Program Ended");
    // console.log('click!');

    // console.log('asdasd');

    if (selectedFile != null){
      var srt = fs.readFileSync(selectedFile.path, 'utf8');

      var data = parser.fromSrt(srt);
      // console.log(data);

      for (var index = 0; index < data.length; index++) {
        var element = data[index];
        var only_text = remove_tag_keep_text(element.text);

        // 整块传过去翻译，一行发一次请求很低效。
        // 1. GET 请求最大长度多少？
        // 2. 刚好低于一点点这个最大长度。把字幕文件分块传递过去。

        translate(only_text, 'en', 'zh-cn').then(function (data) {
          console.log(data[0][0][0]);
        });
      }
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

// Google Translate API
function translate(sourceText, sourceLang, targetLang){
  console.log('start');
  var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + sourceText

  return $.ajax({
    url: url,
    method: 'GET'
  })

  // $.ajax({
  //   url: url,
  //   method: 'GET'
  // }).then(function (data) {
  //   // console.log(data);
  //   return data;
  // });
}
