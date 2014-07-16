(function($) {
    $.fn.textfit = function(o){
        /* author: Greg Russell */
        /* defaults */
        var d = {
            'verticalAlign' : 'top',
            'verticalAlignOffset' : 0,
            'width' : 'parent',
            'height' : 'parent',
            'font' : 'inherit',
            'textAlign' : 'left'
        };
        
        if(o){ $.extend(d, o); }

        /* build canvas */
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        
        /* cycle */
        return this.each(function() {
            
            /* get width */
            var css = {};
            var top;
            var left;
            var p = $(this).parent();
            var pwidth = p.width();
            var pheight = p.height();
            var width = (d.width == 'parent') ? ''+pwidth : ''+d.width;
            var height = (d.height == 'parent') ? ''+pheight : ''+d.height;
            
            width = parseInt(width);
            height = parseInt(height);

            /* font */
            font = (d.font == 'inherit') ? $(this).css('font-family') : d.font;
            
            console.log(font);
            
            var metric = { 'width' : width + 1 };
            var i = height * 2;
            
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            /* find appropriate font-size */
            while(metric.width > width){
                ctx.font = (i) + 'px ' + font;
                metric = ctx.measureText($(this).text());
                if(metric.width > width){
                    i--;
                }
            }

            /* vertical alignment */
            var offset = parseInt(d.verticalAlignOffset);
            switch(d.verticalAlign){
                case 'top' :
                    top = 0;
                    break;
                case 'bottom':
                    top = (height - i) + offset;
                    break;
                case 'center':
                default:
                    var top = ~~((height - i) / 2) + offset;
                    break;
            }

            /* text align */
            switch(d.textAlign){
                case 'right' :
                    left = pwidth - width;
                    break;
                case 'center':
                    left = ~~((pwidth - width) / 2);
                    break;
                case 'left':
                default:
                    var left = 0;
                    break;
            }
            
            /* css */
            css['display'] = 'block';
            css['width'] = width+'px';
            css['font-family'] = font;
            css['font-size'] = i+'px';
            css['line-height'] = i+'px';
            css['position'] = 'relative';
            css['top'] = top+'px'
            css['left'] = left+'px';
            
            /* do it to it */
            $(this).css(css);
        });
    };
})(jQuery);
