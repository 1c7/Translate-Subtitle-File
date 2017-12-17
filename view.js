let $ = require('jquery')  // jQuery now loaded and assigned to $


$(function(){
  console.log('1');
  $('.dropzone-wrapper').on('mouseenter', function () {
    $(this).addClass('animate');
    console.log('mouseenter');
  }).on('mouseleave', function () { 
    $(this).removeClass('animate'); 
    console.log('mouseleave');
  });
})

