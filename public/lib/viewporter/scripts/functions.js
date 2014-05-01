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