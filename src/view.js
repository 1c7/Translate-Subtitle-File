const $ = require('jquery')  // jQuery now loaded and assigned to $
const fs = require("fs");
const ass = require('./src/ass.js');
const srt = require('./src/srt.js');

var droppedFiles = '';
$(function () {
  // animate border
  $('.dropzone-wrapper').on('mouseenter', function () {
    $(this).addClass('animate');
  }).on('mouseleave', function () {
    $(this).removeClass('animate');
  });

  $dragzone = $('.dropzone-wrapper');
  $dragzone.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
  }).on('dragover dragenter', function () {
    $dragzone.addClass('is-dragover');
    console.log('drag oer');
  })
  .on('dragleave dragend drop', function () {
    $dragzone.removeClass('is-dragover');
    console.log('drag oer');
  })
  .on('drop', function (e) {
    // console.log('drag dddddddrop');
    droppedFiles = e.originalEvent.dataTransfer.files;
    if (droppedFiles.length > 1){
      alert('一次只能拖入一个文件!');
      droppedFiles = '';
      return;
    }

    var file = droppedFiles[0];
    var suffix = get_suffix(file.name);
    if (suffix == 'srt' || suffix == 'ass') {
      app.file_name = file.name;
      app.selectedFile = file;
      // 界面切换
      $('#selected-file-area').show();
      $('.dropzone-wrapper').hide();
    } else {
      alert("只能选择字幕文件，文件后缀必须是 srt 或 ass");
    }
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