WebFont.load({
  custom: {
    families:['Digital-7', 'icomoon','pegyptaregular','Tw Cen MT','A1012HelvetikaCmprs TYGRA','Arial Narrow','Egyptian710 BT']
    ,urls:['/css/fonts/local_fonts.css']
    ,active: function () {
      console.log('ACTIVE', arguments);
    }
  }
});

addEventListener("click", function() {
    var el = document.documentElement ,
    rfs = el.requestFullScreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen || el.mozRequestFullScreen  || el.requestFullscreen || el.msRequestFullscreen;
    rfs.call(el,Element.ALLOW_KEYBOARD_INPUT);
});
