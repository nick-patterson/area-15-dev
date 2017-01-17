// ====================================================//
// ==========   SLIDER   ==============================//
// ====================================================//

function Area15Slider(userConfig) {

	var self = this,
		config;

	this.index = 1;

	config = {
		name: 'Area 15 Slider',
		slide: $('.slide'),
		getNextPosition: function(){return $(self.slide[self.index - 1]).position();},
		getCurrentSlide: function(){return $(self.slide[self.index - 1]);},
		container: $('.slider-container'),
		navControl: $('.nav-control'),
		hasProgress: false,
		slideTime: 1.25,
	};

	$.extend(true, config, userConfig);

	if(config.hasProgress) {
		self.progress = {
			percentage: 0,
			updateProgress: function() {
				$('.nav-progress-number').html(slider.progress.percentage + '%');
			},
		};
	}

	this.endpointReset = function() {
		TweenMax.to(self.container, 0.35, {x: 0, ease: Power1.easeOut});
	};

	this.init = function() {

		self.name = config.name;
		self.slide = config.slide;
		self.current = $(self.slide[0]);
		self.slides = config.slide.length;
		self.container = config.container;
		self.navControl = config.navControl;
		self.slideTime = config.slideTime;

		self.events();
	};

	this.events = function() {

		self.navControl.on('click', function(event){
			if ($(this).hasClass('nav-previous')) {
				self.moveSlide('previous');
			}
			else {
				self.moveSlide('next');
			}
		});
	};

	this.DOMReset = function() {

		config.slide = $(config.slide.selector);
		config.container = $(config.container.selector);
		config.navControl = $(config.navControl.selector);
		self.init();
	};

	this.moveSlide = function(direction) {

		var nextPos,
			prevPos,
			slideMoveLength,
			sliderCont = self.container,
			newProgress,
			progressIndicatorCont,
			progressIndicator;

		if (config.hasProgress) {
			newProgress = self.progress.percentage;
			progressIndicatorCont = $('.nav-progress-indicator-container');
			progressIndicator = $('.nav-progress-indicator');
		}

		if (direction === 'previous') {

			if (self.index == 1) {
				return TweenMax.to(sliderCont, 0.35, {x: "+=75px", ease: Power2.easeIn, onComplete: self.endpointReset});
			}
			else {
				self.index = self.index - 1;
				nextPos = config.getNextPosition();
				slideMoveLength = nextPos.left * 1;
				if (config.hasProgress) {
					newProgress = ((self.index - 1) / (self.slides - 1)) * 100;
				}
			}
		}

		else {

			if (self.index == self.slides) {
				return TweenMax.to(sliderCont, 0.35, {x: "-=75px", ease: Power2.easeIn, onComplete: self.endpointReset});
			}

			else {
				self.index = self.index + 1;
				nextPos = config.getNextPosition();
				slideMoveLength = nextPos.left * 1;
				if (config.hasProgress) {
					newProgress = ((self.index - 1) / (self.slides - 1)) * 100;
				}
			}
		}

		if (config.hasProgress) {
			TweenMax.to(progressIndicatorCont, 1.1, {x: newProgress + "%", ease: Back.easeOut.config(1)});
		}

		self.current = config.getCurrentSlide();

		TweenMax.to(sliderCont, self.slideTime, {scrollTo: {x: slideMoveLength}, ease: Power1.easeOut, force3D: true, immediateRender: true});

		$(window).resize(function(event){
			nextPos = config.getNextPosition();
			slideMoveLength = nextPos.left * 1;
			TweenMax.set(sliderCont, {scrollTo: {x: slideMoveLength}, ease: Power1.easeOut});
		});
	};

	this.loadNextScene = '';
}