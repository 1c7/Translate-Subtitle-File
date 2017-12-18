let $ = require('jquery')  // jQuery now loaded and assigned to $
const shell = require('electron').shell
const os = require('os')
const ipc = require('electron').ipcRenderer

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
    console.log('ha');
    
    var selectedFile = document.getElementById('file-input').files[0];
    console.log(selectedFile);

    $('#selected-file-area').show();
    $('.dropzone-wrapper').hide();
  });

})

