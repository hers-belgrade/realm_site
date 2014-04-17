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