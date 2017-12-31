const $ = require('jquery')  // jQuery now loaded and assigned to $
const fs = require("fs");
const ass = require('./src/ass.js');
const srt = require('./src/srt.js');

$(function () {
  // animate border
  $('.dropzone-wrapper').on('mouseenter', function () {
    $(this).addClass('animate');
  }).on('mouseleave', function () {
    $(this).removeClass('animate');
  });

  // choose file.
  $('#hint').click(function () {
    $('#file-input').click();
  })

  // 开始翻译按钮
  $('#button-area').click(function () {
    selectedFile = app.selectedFile; // from vue
    if (selectedFile == null) {
      alert('请先选择一个文件再开始翻译');
      return false;
    }

    var content = fs.readFileSync(selectedFile.path, 'utf8');
    if (get_suffix(selectedFile.name) == 'srt') {
      srt.translate(content);
    } else if (get_suffix(selectedFile.name) == 'ass') {
      // handle_ASS(content);
      // console.log(content);
    } else {
      alert('这是什么神秘的格式? 无法解读..');
      return false;
    }
  })
});