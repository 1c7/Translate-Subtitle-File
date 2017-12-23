let $ = require('jquery')  // jQuery now loaded and assigned to $
const shell = require('electron').shell
const os = require('os')
const ipc = require('electron').ipcRenderer
const fs = require("fs");
var parser = require('subtitles-parser'); // 解析字幕文件内容
// const translate = require('google-translate-api'); // 翻译 API
// not working, no on maintaining

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
    
    // console.log(selectedFile);

    var root = 'https://jsonplaceholder.typicode.com';

    $.ajax({
      url: root + '/posts/1',
      method: 'GET'
    }).then(function (data) {
      console.log(data);
    });

    // fs
    // var data = fs.readFileSync(selectedFile.path);
    // console.log("Synchronous read: " + data.toString());
    // console.log("Program Ended");
    console.log('click!');

    console.log('asdasd');

    if (selectedFile != null){
      var srt = fs.readFileSync(selectedFile.path, 'utf8');

      var data = parser.fromSrt(srt);
      // console.log(data);

      for (var index = 0; index < data.length; index++) {
        var element = data[index];
        console.log(element.text);
        console.log(remove_tag_keep_text(element.text));
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
