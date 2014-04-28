$(document).ready( function(){
	
    //Get the canvas &
 /*
    var c = $('#casino');
    var ct = c.get(0).getContext('2d');
    var container = $(c).parent();
    var aspect = 0.741
 		var MaxSideWidth = 35;
*/

// include('/lib/viewporter/scripts/vars.js'); 

/*
		var Aspect = 488 / 659;
		var MaxSidebarWidth = 200;
		var SideBannerMinWidth = 120;
*/

function CanvasCalc (width, height, ActiveAspect) {
    if (ActiveAspect > aspect) {
			c.attr('width', Math.floor(width) );
			var aheight = width * aspect;
			c.attr('height', Math.floor(aheight) );
    	} else {
    	c.attr('height', Math.floor(height - 3) );
			var awidth = height / aspect;
			c.attr('width', Math.floor(awidth) );
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

		if ($(window).width() < 1224) { // resetuje sidebar na podrazumevane vrednosti.

	}


function CenteringCanvas(MaxSidepx, CanvasWidth, ViewporterWidth) {
	var difference = ViewporterWidth - CanvasWidth - MaxSidepx;
	var padding = difference/2;
	$('#checker-bl').css({
		'margin-left' : padding,
		width : CanvasWidth + MaxSidepx
		});
	$('#checker-tr').css({
		'margin-left' : CanvasWidth + padding,
		width : MaxSidepx
		});
}

function AddToogleButton() {
		$('#tooglebut').show();
/*
	if ($('#tooglebut').length == 0) {
		$('#checker-tr').prepend('<button id="tooglebut" type="button" class="toogle btn btn-primary"><span class="glyphicon glyphicon-align-justify"></span></button>');
	}
*/
}

function RemoveToogleButton() {
		$('#tooglebut').hide('slow',LayoutChange);
/*
		if ($('#tooglebut').length != 0) {
			$('#tooglebut').remove();
		}	
*/
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

function LayoutChange() {
		var e = document.createEvent('Event');
		e.initEvent('layoutChanged',true,true);
		document.dispatchEvent(e);	
	}

function rule() {

	ResetStyle();
	var CanvasHolderWidth = $('#checker-bl').width();
//	alert('!');
	if ($( "body" ).hasClass( "closed-side" )) {
		var CanvasHolderWidth = window.innerWidth;
		$("#checker-bl").css('width', CanvasHolderWidth);	
	}	
	
	var CanvasHolderHeight = $('#checker-bl').height();		
	var HoledrAspect = CanvasHolderHeight / CanvasHolderWidth;
	var ViewPorterWidth = $('div#viewporter').width();
	
	if (HoledrAspect > Aspect) {
		var PredCanvasWidth = CanvasHolderWidth;
		var PredCanvasHeight = CanvasHolderWidth * Aspect;
		} else {
		var PredCanvasWidth = CanvasHolderHeight / Aspect;
		var PredCanvasHeight = CanvasHolderHeight
	//	console.log('Predicted canvas width = ' + PredCanvasWidth);
	//	alert(PredCanvasWidth);
		}
$('#side-content').css('height',$(this).outerHeight());
$('#rightad').css('height',$(this).outerHeight());
	if (ViewPorterWidth >= 1224) {
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
	
	} else if ( (ViewPorterWidth < 1224) && (ViewPorterWidth >= 768) ) {				
		var MaxSideWidth = 250;
		var MinSideWidth = 100;
		var MinClosedSideWidth = 35;
		RemoveRightAd();	
		
		var ViewPorterHeight = window.innerHeight;
		var ViewPorterWidth	= window.innerWidth;
		var CurentAspect = window.innerHeight / window.innerWidth;

if (CurentAspect <= 1) { // Portrait

		var SideWidth = ViewPorterWidth - PredCanvasWidth;
		if ($( "body" ).hasClass( "closed-side" )) {
			if (SideWidth <= MinClosedSideWidth) {
				SideWidth = 0;			
			}
		}	

		$('#checker-tr').css({width: SideWidth});
		$('#side-content').css({width: SideWidth});
		if(PredCanvasHeight < ViewPorterHeight) {
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
	console.log('Aspekt veci od 1' + CurentAspect);
		}

		

		if (CurentAspect <= Aspect) {
		//	alert('!');
			} else {
		// alert('!');		
				}
								
	} else {
		
		}
	
	
/*
  } else if ( ($(window).width() < 1224) && ($(window).width() >= 768) ) {  
		ResetStyle();			
    var ActiveAspect = $(container).height()/$(container).width();
    var vpwidth = $(container).width();
    var vpheight = $(container).height();
		CanvasCalc(vpwidth, vpheight, ActiveAspect);  
  	
		var canvas = document.getElementById('casino');
		var CanvasWidth = canvas.width; // Širina canvas-a
 		var ViewporterWidth = $(window).width();
		var ContainerPercent = 100 * CanvasWidth / ViewporterWidth;
  	console.log(ContainerPercent);
		$('#checker-bl').css({
		width : ContainerPercent + '%'
		});
		$('#checker-tr').css({
		width : 100-ContainerPercent + '%'
		});		
*/	
}

//Run function when browser resizes
$(window).resize( rule );
//Initial call 
rule();

$("#tooglebut").click(function(){
	alert('!');
  $("body").toggleClass("closed-side");
  rule();
  LayoutChange();
});	


});
