$(document).ready(function () {

  $('[data-toggle=offcanvas]').click(function () {
    $('.row-offcanvas').toggleClass('active')
  });

var elemhight = $('div.box').height();
alert(elemhight);

$('canvas#casino').height(elemhight);

});