function Case(context) {
// return 'standard';

	if ((window.matchMedia("(max-resolution: 1.5dppx)").matches) && (context >= 1224)) {
		return 'standard';
 	} else if ((window.matchMedia("(min-resolution: 1.5dppx)").matches) && (window.matchMedia("(max-resolution: 3dppx)").matches) && (context >= 1224)) {
		return 'tablet';	
	} else if ((window.matchMedia("(min-resolution: 3dppx)").matches) && (context >= 1224)) {
		return 'mobile';
	} else if ((context < 1224) && (context >= 768) && (window.matchMedia("(max-resolution: 3dppx)").matches)) {
		return 'tablet';	
	} else if ((context < 1224) && (context >= 768) && (window.matchMedia("(min-resolution: 3dppx)").matches)) {
		return 'mobile';	
	} else if (context < 768) {
		return 'mobile';
	}	else {
		return 'standard';	
	}	


}

function ResetStyle () {

	$('#checker-tr').css({
		'margin-left' : '0',
		width : '20%'
		});
	$('#checker-bl').css({
		'margin-left' : '0',
		width : '80%'
		});
	}


function AddToogleButton() {
		$('#tooglebut').show();
}

function RemoveToogleButton() {
		$('#tooglebut').hide();
}

function RemoveRightAd() {
		if ($('#rightad').length != 0) {
			$('#rightad').remove();
		}	
}

function AddRightAd() {
	if ($('#rightad').length == 0) {
				$('#side-content').after( "<div id='rightad'><a href='#'><img src='/img/banners/bonus-left-side.jpg' /></a></div>" );
	}	
}

function GetPredicted (dim) {

	var CanvasHolderWidth = $('#checker-bl').width();

	if ($( "body" ).hasClass( "closed-side" )) {
		var CanvasHolderWidth = window.innerWidth;
		$("#checker-bl").css('width', CanvasHolderWidth);	
	}	
	
	var CanvasHolderHeight = $('#checker-bl').height();		
	var HoledrAspect = CanvasHolderHeight / CanvasHolderWidth;
	var ViewPorterWidth = window.innerWidth;


	if (HoledrAspect > Aspect) {
		var PredCanvasWidth = CanvasHolderWidth;
		var PredCanvasHeight = CanvasHolderWidth * Aspect;
		} else {
		var PredCanvasWidth = CanvasHolderHeight / Aspect;
		var PredCanvasHeight = CanvasHolderHeight;

	}

	if (dim === 'w') {	
	return PredCanvasWidth;			
	} else {
	return PredCanvasHeight;					
	}
		
}

function GetCurent(q) {
	
if (q === 'w') {
	return window.innerWidth;
	}	else if (q==='h') {
	return window.innerHeight;	
	}	else if (q==='a') {
	return window.innerHeight/window.innerWidth;
	} else {
	return false;	
	}
}	


function LayoutChange() {
		var e = document.createEvent('Event');
		e.initEvent('layoutChanged',true,true);
		document.dispatchEvent(e);	
	}
function SideHeadFullView () {

	var side = $('div#side-content');
	var w = $('div#side-content').width();
//	alert('! ' + w);
	var brakepoint_middle = 224;
	var brakepoint_small = 50;
	if ((w < brakepoint_middle)) {
		side.addClass('middleSideHead');
		} else {
			side.removeClass('middleSideHead');
		}
	if ((w < brakepoint_small)) {
		side.addClass('smallSideHead');
		} else {
			side.removeClass('smallSideHead');
		}
	}
	
function SetModalDimensions() {
	var w = GetPredicted('w');
	var h = GetPredicted('h');
	$('div.contentmodal').height(h).width(w);
	}
function SetAvatarContainer() {
	var th = GetPredicted('h');
	var setmenu = $('.SettingsContentModal div.wrapper').outerHeight(true);
	var dscr = $('.SettingsContentModal .AvatarContentModal div.moddescription').outerHeight(true);
	var totalpad = 25;
	var bigbut = $('.SettingsContentModal .AvatarContentModal button.bigbut').outerHeight(true);
	if (bigbut == null) {
		var bigbut = 5;
	}
	// var bigbut = 50;
	var avatarc = th - setmenu - dscr - totalpad - bigbut;
	$('.SettingsContentModal .AvatarContentModal div.ng-scope ul').height(avatarc);
	}

	
function ShowModal(content) {
	$('div.contentmodal > div').hide();
	$('div.contentmodal').fadeIn("fast", function() {
		if (content == 'BuyInContentModal') {
				$('div.BuyInContentModal').show();
				$('body').addClass('ModalActive');
			}
		if (content == 'CashOutContentModal') {
				$('div.CashOutContentModal').show();
				$('body').addClass('ModalActive');
			}
		if (content == 'SettingsContentModal') {
				$('div.SettingsContentModal').show();
				$('body').addClass('ModalActive');
			}							
	});
}
function ShowContentModal(button, content) {
  if (button) {
    if ($(button).hasClass('active')) {
      return false;
    }	else {
      $(button).addClass('active').siblings().removeClass('active');			
    }
  }
	$('div.SettingsContentModal > div.cModal').hide();
	if (content == 'uinfo') {
		$('div.SetContentModal').show();
  }
	if (content == 'uavatars') {
		$('div.AvatarContentModal').show();
		SetAvatarContainer();
	}
	if (content == 'urefill') {
		$('div.DoBuyInContentModal').show();
  }		
	if (content == 'cashout') {
		$('div.CashOutContentModal').show();
	}
	if (content == 'uclose') {
		button && $(button).removeClass('active');			
		$('div.contentmodal').hide();
	}				
}
