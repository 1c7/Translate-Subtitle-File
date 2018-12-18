const $ = require('jquery')  // jQuery now loaded and assigned to $
// const { translate } = require('./src/translate.js');

$(function () {
  // animate border
  $('.dropzone-wrapper').on('mouseenter', function () {
    $(this).addClass('animate');
  }).on('mouseleave', function () {
    $(this).removeClass('animate');
  });

  // support drag & drop
  $dragzone = $('.dropzone-wrapper');
  $dragzone.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
  }).on('dragover dragenter', function () {
    $dragzone.addClass('is-dragover');
  })
  .on('dragleave dragend drop', function () {
    $dragzone.removeClass('is-dragover');
  })


  // click "开始翻译"按钮
  // $('#button-area').click(function () {
  //   var selectedFile = app.selectedFile; // from vue
  //   if (selectedFile == null) {
  //     alert('请先选择文件');
  //     return false;
  //   }

  //   console.log('到这里了');
  //   console.log(selectedFile);
  //   if(selectedFile.length == 1){
  //     console.log('1');
  //     // translate(selectedFile[0]);
  //   }else{
  //     console.log('many');
  //     Array.from(selectedFile).forEach(file => { 
  //       translate(file);
  //     });
  //   }
  // })
});