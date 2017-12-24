let $ = require('jquery')  // jQuery now loaded and assigned to $
const shell = require('electron').shell
const os = require('os')
const ipc = require('electron').ipcRenderer
const fs = require("fs");
var parser = require('subtitles-parser'); // 解析字幕文件内容

var LENGTH_LIMIT_PER_REQUEST = 5000;
// 5000 this number is from https://translate.google.com/ input box bottom right cornor

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

  // when file change.
  // $(document).on('change', '#file-input', function (event) { 
  //   selectedFile = document.getElementById('file-input').files[0];
  //   console.log(selectedFile);

  //   // 界面切换
  //   $('#selected-file-area').show();
  //   $('.dropzone-wrapper').hide();
  // });

  $('#button-area').click(function(){
    // fs
    // var data = fs.readFileSync(selectedFile.path);
    // console.log("Synchronous read: " + data.toString());

    selectedFile = app.selectedFile; // from vue
    // 这一大段 if 就是遍历字幕，然后一块块发请求出去，而不是一行字幕就发一个请求。
    if (selectedFile != null){
      var srt = fs.readFileSync(selectedFile.path, 'utf8');
      var data = parser.fromSrt(srt);

      var a_batch_original_text = '';
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
          a_batch_original_text = ''; // clear it, make sure it's last line
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

function translate(a_batch_original_text, line){
  translate_api(a_batch_original_text, 'en', 'zh-cn').then(function (data) {
    var result_array = data[0];
    console.log(result_array);
    console.log(line);
    // for (var index = 0; index < result_array.length; index++) {
    //   var result_text = result_array[index];
      
    // }
  });
}

// Google Translate API
function translate_api(sourceText, sourceLang, targetLang){
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
