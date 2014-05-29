$(document).ready( function(){

$("select.image-picker").imagepicker();

$('.ModalActive div.sl-room').click(function(){

	});

$('div.move-up').click(function(){

$(this).siblings('button.settings').hide();

$('#side-head > div.fullview').slideUp( "fast", function() {
		$('#side-head > div.shortview').slideDown( "slow", function() {
//			alert('!');
		});	
});

});

function rule() {

	ResetStyle();
//	var CanvasHolderWidth = $('#checker-bl').width();
	var CanvasHolderWidthPx = window.innerWidth / 10 * 8;
	var CanvasHolderWidth = CanvasHolderWidthPx;

	if ($( "body" ).hasClass( "closed-side" )) {
		var CanvasHolderWidth = window.innerWidth;
		$("#checker-bl").css('width', CanvasHolderWidth);	
	}	
	
	var CanvasHolderHeight = GetCurent('h');		
	var HoledrAspect = CanvasHolderHeight / CanvasHolderWidth;
	var ViewPorterWidth = GetCurent('w');

	
	if (HoledrAspect > Aspect) {
		var PredCanvasWidth = CanvasHolderWidth;
		var PredCanvasHeight = CanvasHolderWidth * Aspect;
		} else {
		var PredCanvasWidth = CanvasHolderHeight / Aspect;
		var PredCanvasHeight = CanvasHolderHeight;
	}	
				
	alert(PredCanvasWidth);	
	alert(PredCanvasHeight);	



$('#side-content').css('height',$(this).outerHeight());
$('#rightad').css('height',$(this).outerHeight());
	if ((Case(GetCurent('w')) == 'standard') || (Case(GetCurent('w')) == 'mobile')) {
		RemoveToogleButton();
		var SideMargin = PredCanvasWidth;
		var SideWidth = ViewPorterWidth - PredCanvasWidth;
		$('#checker-tr').css({
		width : SideWidth,
		'margin-left' : SideMargin	
		})
		if (SideWidth > (MaxSidebarWidth + SideBannerMinWidth)) {
				$('#side-content').css({
				width : MaxSidebarWidth
				});
				AddRightAd();
				var AdWidth = SideWidth - MaxSidebarWidth;
				$('#rightad').css('width', AdWidth);							
		}	else {
				$('#side-content').css({
				width : SideWidth
				});
				RemoveRightAd();					
			}
	
	} else if (Case(GetCurent('w')) == 'tablet') {				
		var MaxSideWidth = 250;
		var MinSideWidth = 100;
		var MinClosedSideWidth = 35;
		RemoveRightAd();	
		
		var ViewPorterHeight = $('div#viewporter').height();
		var ViewPorterWidth	= $('div#viewporter').width();
		var CurentAspect = ViewPorterHeight / ViewPorterWidth;

if (GetCurent('a') <= 1) { // Portrait
  	var SideWidth = GetCurent('w') - GetPredicted('w');

//		var SideWidth = ViewPorterWidth - PredCanvasWidth;

		if ($( "body" ).hasClass( "closed-side" )) {
			if (SideWidth <= MinClosedSideWidth) {
				SideWidth = 0;			
			}
		}	

		$('#checker-tr').css({width: SideWidth});
		$('#side-content').css({width: SideWidth});	
		if(GetPredicted('h') < GetCurent('h')) {
			AddToogleButton();			
			} else {
			if (!$( "body" ).hasClass( "closed-side" )) {
				RemoveToogleButton();	
			}	
		}		

		if (SideWidth > (MaxSidebarWidth + SideBannerMinWidth)) { // Dodaje Banner
				$('#side-content').css({
				width : MaxSidebarWidth
				});
				if ($('#rightad').length == 0) {
				$('#side-content').after( "<div id='rightad'><a href='#'><img src='/img/banners/bonus-left-side.jpg' /></a></div>" );
				// alert('!');
				}
				var AdWidth = SideWidth - MaxSidebarWidth;
				$('#rightad').css('width', AdWidth);
				// Max Side width - 250
				console.log('Ad width = ' + AdWidth);					
				console.log('Side width = ' + SideWidth);
				console.log('Screen width =' + window.innerWidth);							
				console.log('Predicted width =' + GetPredicted('w'));							
		}	else {
				$('#side-content').css({
				width : SideWidth
				});
				if ($('#rightad').length != 0) {
				// alert('!');	
				$('#rightad').remove();
				}						
			}		

	} else { // Landscape
//	console.log('Aspekt veci od 1' + CurentAspect);
		}

		

		if (GetCurent('a') <= Aspect) {
		// alert('!');
			} else {
		// alert('!');		
				}

								
	} else {
		
		}

SideHeadFullView();
SetModalDimensions();
SetAvatarContainer();
SetLoginWidget ();

LayoutChange();

}

//Run function when browser resizes
$(window).resize( rule );
//Initial call 

rule();

$("#tooglebut").click(function(){
  $("body").toggleClass("closed-side");
  rule();
});	


//setTimeout(LayoutChange,300);

});