// OLD MAGNIFYING GLASS

/*var magnifyingGlass = {

	glassSize: 200,

	currentImage: '',

	smallImageWidth: '',

	smallImageHeight: '',

	largeImageObject: {
		image: '',
		width: '',
		height:''
	},

	mousePos: {
		x: '',
		y: ''
	},

	isVisible: false,

	init: function() {

		var magnifyingGlassDiv = $('.magnifying-glass');
			magnifyingGlassDivInternal = $('.magnifying-glass-internal');

		function centerToMouse(){
			var offset = magnifyingGlass.current.offset(),
				pageX = magnifyingGlass.mousePos.x,
				pageY = magnifyingGlass.mousePos.y,
				proportionX = (pageX - offset.left) * (magnifyingGlass.largeImageObject.width / magnifyingGlass.smallImageWidth * -1) + (magnifyingGlass.glassSize / 2),
				proportionY = (pageY - offset.top) * (magnifyingGlass.largeImageObject.height / magnifyingGlass.smallImageHeight * -1) + (magnifyingGlass.glassSize / 2);

			magnifyingGlassDiv.css({'left': pageX - (magnifyingGlass.glassSize / 2), 'top': pageY - (magnifyingGlass.glassSize / 2)});
			magnifyingGlassDivInternal.css('transform', 'translate3d(' + proportionX + 'px, ' + proportionY + 'px, 0px)');
		}

		$('.js-magnify').on({
			mouseenter: function(){

				$(window).on('mousewheel.magnifyingGlassWheel DOMMouseScroll.magnifyingGlassWheel', function(event){

					var delta = event.originalEvent.wheelDelta,
						wheelDeltaModifier = delta / 8;

					if (event.detail) {
						delta = event.detail * -1;
						wheelDeltaModifier = delta * 2;
					}

					var newGlassSize = Math.min(Math.max(magnifyingGlass.glassSize += wheelDeltaModifier, 150), 400);

					magnifyingGlassDiv.css({
						width: newGlassSize,
						height: newGlassSize
					});

					magnifyingGlass.glassSize = newGlassSize;
					centerToMouse();
				
				});

				magnifyingGlass.current = $(this);
				magnifyingGlass.smallImageWidth = magnifyingGlass.current.width();
				magnifyingGlass.smallImageHeight = magnifyingGlass.current.height();				
				magnifyingGlass.largeImageObject.image = new Image();

				var src = magnifyingGlass.current[0].src;

				magnifyingGlass.largeImageObject.image.src = src;
				magnifyingGlass.largeImageObject.width = magnifyingGlass.largeImageObject.image.width;
				magnifyingGlass.largeImageObject.height = magnifyingGlass.largeImageObject.image.height;

				magnifyingGlassDivInternal.css({
					width: magnifyingGlass.largeImageObject.width + 'px',
					height: magnifyingGlass.largeImageObject.height + 'px',
					backgroundImage: 'url(' + src + ')',
				});

				//magnifyingGlassDiv.css('background-image', 'url(' + src + ')');
				magnifyingGlassDiv.addClass('magnifying-glass-reveal');
			},
			mousemove: function(event){

				if (!magnifyingGlass.isVisible){
					magnifyingGlassDiv.addClass('magnifying-glass-reveal');
					magnifyingGlass.isVisible = true;
				}

				magnifyingGlass.mousePos.x = event.pageX;
				magnifyingGlass.mousePos.y = event.pageY;

				centerToMouse();				
			},
			mouseleave: function(event){
				$(window).off('mousewheel.magnifyingGlassWheel DOMMouseScroll.magnifyingGlassWheel');
				magnifyingGlassDiv.removeClass('magnifying-glass-reveal');
			}
		});
	}
};*/