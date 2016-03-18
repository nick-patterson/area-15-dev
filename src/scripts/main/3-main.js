// ====================================================//
// ==========   MAIN OBJECTS   ========================//
// ====================================================//

var vaultVideoController = {

	viewIndex: 0,

	currentVideo: '',
	isMoving: false,

	setBeginningVideo: function(video) {
		vaultVideoController.currentVideo = video;
	},

	init: function() {

		function checkViewIndex(direction) {
			if(direction === 'previous') {
				if(vaultVideoController.viewIndex === 0){
					return 2;
				}
				else {
					return vaultVideoController.viewIndex - 1;
				}
			}
			else {
				if(vaultVideoController.viewIndex === 2){
					return 0;
				}
				else {
					return vaultVideoController.viewIndex + 1;
				}
			}
		}

		vaultVideoController.setBeginningVideo($('.main-vault-video-active'));

		$('.vault-nav-control').on('click', function(event) {

			if (vaultVideoController.isMoving) {
				return false;
			}

			if ($(this).hasClass('nav-previous')) {
				vaultVideoController.changeView(checkViewIndex('previous'));
			}

			else {
				vaultVideoController.changeView(checkViewIndex('next'));
			}
		});

		$('.vault-player-button').not('#mazmen-chamber-button').on('click', function(event) {

			if (vaultVideoController.isMoving) {
				return false;
			}

			var toView = $(this).data('to');
			if (toView === vaultVideoController.viewIndex) {
				var wiggle = new TimelineMax({onComplete: this.kill})
					.to([this, '#vault-player-indicator'], 0.05, {x: 3})
					.to([this, '#vault-player-indicator'], 1.5, {x: 0, ease: Elastic.easeOut.config(0.9,0.1)});
				return false;
			}

			else {
				vaultVideoController.changeView(toView);
			}
		});

	},

	changeView: function(end) {

		var videoContainer = $('#main-vault-video-container'),
			oldVideoElement = vaultVideoController.currentVideo[0],
			currentVideoElement = '',
			restoreUI = function(){
				console.log('restoreUI');
				vaultVideoController.isMoving = false;
				$('#vault-player-button-container').removeClass('disabled');
				$(oldVideoElement).removeClass('main-vault-video-staged');
				currentVideoElement.removeEventListener('ended', restoreUI);
			};

		// Disable UI
		vaultVideoController.isMoving = true;
		$('#vault-player-button-container').addClass('disabled');

		// Transition UI to correct marker
		$('.vault-player-button[data-to="' + vaultVideoController.viewIndex + '"]').removeClass('vault-player-button-active');
		$('.vault-player-button[data-to="' + end + '"]').addClass('vault-player-button-active');
		TweenMax.to('#vault-player-indicator', 0.65, {x: 100 * end + '%', force3D: true, ease: Power1.easeInOut});

		// Reset Active Video
		vaultVideoController.currentVideo.removeClass('main-vault-video-active');
		oldVideoElement.currentTime = 0;

		// Designate new active video
		vaultVideoController.currentVideo = videoContainer.find('.main-vault-video[data-start=' + vaultVideoController.viewIndex + '][data-end=' + end + ']');
		vaultVideoController.currentVideo.addClass('main-vault-video-staged main-vault-video-active');
		currentVideoElement = vaultVideoController.currentVideo[0];

		// Play new active video
		currentVideoElement.play();

		// Restore UI
		currentVideoElement.addEventListener('ended', restoreUI);

		// Update viewIndex
		vaultVideoController.viewIndex = end;
	}

};

var slider = new Area15Slider({name: 'Main Slider', hasProgress: true});

var modal = {

	current: '',

	initializingElement: '',

	events: function() {

		modal.initializingElement.on('click', function(event) {
			event.preventDefault();
			modal.launch($(this));
		});

		$('.modal__box').on('click', function(event) {
	      	event.stopPropagation();
	    });

	    $('.js-close-modal').on('click', function(event) {
	      	event.preventDefault();
	      	modal.closeModal();
	    });
	},

	init: function() {

		// Pre-load all webGL models

		modal.loadModels.init();

		// Define initializing element
		modal.initializingElement = $('.js-modal');

		modal.setupSlider();
		modal.events();

	},

	setupSlider: function() {

		// Set up modal slider
		var modalSlider = new Area15Slider({
	     	name: 'Modal Slider',
	     	navControl: $('.modal-nav-control'),
			slideTime: 0.8
		});

		modal.slider = modalSlider;
		modal.slider.init();
	},

	launch: function(initializer) {	

		// Update vars
	    modal.current = $(initializer.data('target'));

	    modal.slider.slide = modal.current.find('.modal-slide');
	    modal.slider.slides = modal.slider.slide.length;
	    modal.slider.current = $(modal.slider.slide[modal.slider.index - 1]);
	    modal.slider.container = modal.current.find('.modal-slide-container');
		modal.slider.navControl = modal.current.find('.modal-nav-control');

		if (modal.slider.slides > 1) {
			modal.current.find('.modal-nav-control').css('display', 'inline');
		}

		// Display Modal
		modal.current.addClass('is-staged is-visible');


		// Set up video player object
		if (modal.current.find('.MMVP-video').length) {
			var modalVideoPlayer = new FifteenFourVideoPlayer({
					name: 'Modal Video Player'
			});
			modal.videoPlayer = modalVideoPlayer;
			modal.videoPlayer.container = modal.current.find('.MMVP-video');
			modal.videoPlayer.init();
		}

		// Prep webGL
		if (modal.current.find('.modal-model-container').length) {

			modal.slider.loadNextScene = {

				scene: '',
				controls: '',
				currentModelPath: '',
				currentModelCameraPosition: '',
				currentModelPosition: '',

				init: function() {

					modal.slider.canvas = modal.slider.current.find('.modal-model-container');

					modal.slider.loadNextScene.currentModelPath = modal.slider.canvas.data('model-path');

					modal.slider.loadNextScene.currentModelCameraPosition = modal.slider.canvas.data('camera-position').split(' ');

					modal.slider.loadNextScene.currentModelPosition = modal.slider.canvas.data('model-position').split(' ');

					var canvas, scene, camera, light, spotlightSide, spotlightFront, spotlightBottom, controls, mouse, raycaster, renderer, model, boundingBox;

					canvas = modal.slider.canvas.find('canvas');
					modal.slider.loadNextScene.scene = new THREE.Scene();

					scene = modal.slider.loadNextScene.scene;

					camera = new THREE.PerspectiveCamera(45, modal.slider.canvas.width() / modal.slider.canvas.height(), 0.1, 10000);

					light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.5 );
					scene.add( light );

					spotlightSide = new THREE.SpotLight( 0xf0f8ff );
					spotlightSide.position.set( 5, 5, 0 );
					spotlightSide.castShadow = true;
					spotlightSide.shadowMapWidth = 1024;
					spotlightSide.shadowMapHeight = 1024;
					spotlightSide.shadowCameraNear = 500;
					spotlightSide.shadowCameraFar = 4000;
					spotlightSide.shadowCameraFov = 30;
					spotlightSide.intensity = 5;
					scene.add( spotlightSide );

					spotlightFront = spotlightSide.clone();
					spotlightFront.position.set(0, 6, 2);
					spotlightFront.intensity = 1;
					scene.add(spotlightFront);

					spotlightBottom = spotlightSide.clone();
					spotlightBottom.position.set(-8, -2, -4);
					spotlightBottom.color.setHex( 0x161726 );
					spotlightBottom.intensity = 5;
					scene.add(spotlightBottom);

					modal.slider.loadNextScene.controls = new THREE.OrbitControls(camera, modal.slider.canvas[0]);
					controls = modal.slider.loadNextScene.controls;
					controls.addEventListener('change', render);

					renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas[0], antialias: true});
					renderer.setSize(modal.slider.canvas.width(), modal.slider.canvas.height());

					function addModel() {

						function stringArrayToNumberArray(theArray) {
							for(var i in theArray) {
								theArray[i] = Number(theArray[i]);
							}

							return theArray;
						}

						var modelIndex = '',
							objectPosition = stringArrayToNumberArray(modal.slider.loadNextScene.currentModelPosition),
							cameraPosition = stringArrayToNumberArray(modal.slider.loadNextScene.currentModelCameraPosition);

						$('.modal-model-container').each(function(index){
							if ($(this).is(modal.slider.canvas)) {
								modelIndex = index;
								return;
							}
						});

						var mesh = modal.loadModels.models[modelIndex].mesh,
							edges = modal.loadModels.models[modelIndex].edges;

						scene.add(mesh);
						scene.add(edges);

						mesh.position.set(objectPosition[0], objectPosition[1], objectPosition[2]);
						edges.position.set(objectPosition[0], objectPosition[1], objectPosition[2]);

						boundingBox = new THREE.Box3().setFromObject(mesh);
						var zoomLimit = Math.max(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z);
						controls.minDistance = zoomLimit * 1.25;
						controls.maxDistance = zoomLimit * 5;
						camera.position.z = zoomLimit * 3;

						camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
						camera.lookAt(new THREE.Vector3(objectPosition[0], objectPosition[1], objectPosition[2]));

						function removeRenderingIndicator() {
							modal.slider.canvas.find('.webgl-rendering-indicator').removeClass('loading-in-progress');
							modal.slider.canvas.find('.webgl-rendering-indicator').addClass('loading-done');
						}

						TweenMax.to(canvas, 1.5, {autoAlpha: 1, ease: Power1.easeIn, delay: 2, onComplete: removeRenderingIndicator});

						animate();
					}

					function animate() {
						scene = modal.slider.loadNextScene.scene;
						controls = modal.slider.loadNextScene.controls;

						if (scene !== null) {
							controls.update();
							render();
						}
					}

					function render() {
						renderer.render(modal.slider.loadNextScene.scene, camera);
					}

					addModel();

					$(window).on('resize.webGLResize', function(event){
						var canvasWidth = modal.slider.canvas.width(),
							canvasHeight = modal.slider.canvas.height();
						camera.aspect = canvasWidth / canvasHeight;
						camera.updateProjectionMatrix();
		    			renderer.setSize(canvasWidth, canvasHeight);
		    			render();
					});
				}
			};

			if (modal.slider.loadNextScene.init && modal.current.find('.modal-model-container').length) {
				modal.slider.loadNextScene.init();
			}

		}

		modal.slider.reset = function() {
			if (modal.slider.loadNextScene) {
				modal.slider.loadNextScene.controls.dispose();
				modal.slider.loadNextScene.controls = null;
				modal.slider.loadNextScene.scene = null;
				$(window).off('resize.webGLResize');
				delete modal.slider.loadNextScene;
			}
			modal.slider.index = 1;
			modal.slider.current = '';
			modal.slider.slides = '';
			TweenMax.set(modal.current.find('.modal-slide-container'), {scrollTo: {x: 0}});
		};

	},

	DOMReset: function() {
		modal.initializingElement = $(modal.initializingElement.selector);
		modal.events();
		modal.init();
	},

	closeModal: function() {
		modal.current.removeClass('is-visible');
	    window.setTimeout(function(){
	      	modal.current.removeClass('is-staged');
	      	modal.slider.reset();
	      	if (modal.videoPlayer) {
	      		modal.videoPlayer.reset();
	      	}
	    }, 250);
	},

  	loadModels: {

		canvases: [],
		loaders: [],
		models: [],
		counter: 0,

		init: function() {
			$('.modal-model-container').each(function(index){
				modal.loadModels.canvases[index] = $(this);
				modal.loadModels.loaders[index] = new THREE.JSONLoader();
				var path = $(this).data('model-path');
				var loader = modal.loadModels.loaders[index];
				var callback = function(geometry,material){
					modal.loadModels.models[index] = {};
					var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: '#101010', side: THREE.DoubleSide, emissive: '#000000', specular: '#111111', shininess: 20, shading: THREE.SmoothShading, transparent: true, opacity: 0.8}));
					var edges = new THREE.EdgesHelper(mesh, 'rgb(200,200,200)');
					edges.material.transparency = true;
					edges.material.opacity = 0.8;
					edges.material.linewidth = 0.15;			
					mesh.position.set(0,-1,0);
					mesh.scale.set(0.1,0.1,0.1);
					modal.loadModels.models[index].mesh = mesh;
					modal.loadModels.models[index].edges = edges;
				};

				loader.load(path, callback);
				modal.loadModels.counter = modal.loadModels.counter++;

				if (modal.loadModels.counter == $('.modal-model-container').length) {
					//loadingScreen.init();
				}
			});
		}
	},
};


// ====================================================//
// ==========   UTILITY FUNCTIONS   ===================//
// ====================================================//


var uiActiveStates = {

	current: '',

	activeState: '',

	rotateRight: '',

	flicker: $('.js-ui-flicker'),

	init: function() {

		$('.js-ui-interactive').hover(function(){

			uiActiveStates.current = $(this);
			uiActiveStates.activeState = uiActiveStates.current.find('.js-ui-active');
			uiActiveStates.rotateRight = uiActiveStates.current.find('.js-ui-rotate-right');

				TweenMax.to(uiActiveStates.activeState, 0.65, {autoAlpha: 1});
				TweenMax.to(uiActiveStates.rotateRight, 0.65, {rotation: 45, ease: Power1.easeOut, force3D: true});
			},
			function() {
				TweenMax.to(uiActiveStates.activeState, 0.65, {autoAlpha: 0});
				TweenMax.to(uiActiveStates.rotateRight, 0.65, {rotation: 0, ease: Power1.easeOut, force3D: true});
		});

		uiActiveStates.animateFlicker();
	},

	animateFlicker: function() {
		uiActiveStates.flicker.each(function(index){
			var thisOne = $(this);
			var newTween = function() {
				var random = Math.random() * 4;
				TweenMax.to(thisOne, random, {autoAlpha: 1, yoyo: true, repeat: 1, onComplete: newTween});
			};
			newTween();
		});
	}
};

var loadingScreen = {

	init: function() {
		TweenMax.to('.loading-indicator, .area-15-logo', 2, {opacity: 1, onComplete: loadingScreen.runAnimationsOnce, delay: 0.5});
	},

	runAnimationsOnce: function() {
		TweenMax.to($('.slider-container'), 1, {scrollTo: {x: 3000}, force3D: true, yoyo: true, repeat: 1, onComplete: loadingScreen.clearScreen});
		//TweenMax.to($('.modal-slide-container'), 1, {scrollTo: {x: 500}, force3D: true, yoyo: true, repeat: 1, delay: 1});
	},

	clearScreen: function() {
		var loadingScreen = $('.loading-screen');
		loadingScreen.removeClass('is-visible');
		window.setTimeout(function(){
			loadingScreen.removeClass('is-staged');
			loadingScreen.addClass('is-hidden');
		},250);
	}
};

var tooltips = {

	current: '',

	title: '',

	init: function() {
		var tooltipDiv = $('.tooltip');
		$('.js-tooltip').on({
			mouseenter: function(event){
				tooltips.current = $(this);
				tooltips.title = tooltips.current.data('title');
				$('.tooltip-text').html(tooltips.title);
				tooltipDiv.addClass('tooltip-reveal');
			},
			mousemove: function(event){
				var pageX = event.pageX,
					pageY = event.pageY;
				TweenMax.set(tooltipDiv, {x: pageX - 15, y: pageY - 20, force3D: true});
			},
			mouseleave: function(event){
				tooltipDiv.removeClass('tooltip-reveal');
			}
		});
	}
};


// MAGNIFYING GLASS

var magnifyingGlass = {

	defaultGlassSize: 200,

	maxGlassSize: 400,

	minGlassSize: 150,

	currentGlassSize: 200,

	effects: {
		blur: 0,
		contrast: 100,
	},

	currentSpecimen: {
		image: '',
		offset: '',
		width: '',
		height: ''
	},

	enlargedSpecimen: {
		image: '',
		width: '',
		height:''
	},

	isVisible: false,

	isFirefox: false,

	init: function() {

		var magnifyingGlassDiv = $('.magnifying-glass'),
			magnifyingGlassImageDiv = magnifyingGlassDiv.find('.magnifying-glass-image'),
			magnifyingGlassBorderDiv = magnifyingGlassDiv.find('.magnifying-glass-border'),
			magnifyingGlassIcon = magnifyingGlassDiv.find('.magnifying-glass-icon'),
			innerClip = magnifyingGlassDiv.find('#inner-clip').find('circle'),
			outerClip = magnifyingGlassDiv.find('#outer-clip').find('circle'),
			outerScope = magnifyingGlassDiv.find('#outer-scope'),
			sights = magnifyingGlassDiv.find('#sights'),
			halfCircle = magnifyingGlassDiv.find('#half-circle'),
			guage = magnifyingGlassDiv.find('#guage'),
			ticks = magnifyingGlassDiv.find('#ticks'),
			tickLine = magnifyingGlassDiv.find('#tick-line'),
			indicator = magnifyingGlassDiv.find('#indicator'),
			innerScope = magnifyingGlassDiv.find('#inner-scope');

		// Set scale of magnifying glass to 0,0
		TweenMax.set(magnifyingGlassDiv, {scaleX: 0, scaleY: 0, scaleZ: 0, force3D: true});

		// Center magnifying glass to mouse cursor
		function centerToMouse(pageX, pageY){
			var offset = magnifyingGlass.currentSpecimen.image.offset(),
				proportionX = (pageX - offset.left) * (magnifyingGlass.enlargedSpecimen.width / magnifyingGlass.currentSpecimen.width * -1) + (magnifyingGlass.maxGlassSize / 2),
				proportionY = (pageY - offset.top) * (magnifyingGlass.enlargedSpecimen.height / magnifyingGlass.currentSpecimen.height * -1) + (magnifyingGlass.maxGlassSize / 2);

			TweenMax.set(magnifyingGlassDiv, {x: pageX - (magnifyingGlass.maxGlassSize / 2), y: pageY - (magnifyingGlass.maxGlassSize / 2), force3D: true});
			TweenMax.set(magnifyingGlassImageDiv, {backgroundPosition: proportionX + 'px ' + proportionY + 'px'});
		}

		// Handle sizing / layout of magnifying glass UI
		function setSize(){

			var halfCurrent = magnifyingGlass.currentGlassSize / 2,
				currentMinusDefault = magnifyingGlass.currentGlassSize - magnifyingGlass.defaultGlassSize,
				sightRotation = 0;

			if (currentMinusDefault >= 0) {
				sightRotation = (0.45 * magnifyingGlass.currentGlassSize) - 90;
			}

			// Clips
			TweenMax.to(innerClip, 0.1, {attr: {r: halfCurrent}, overwrite: true});
			TweenMax.to(outerClip, 0.1, {attr: {r: halfCurrent + 2}, overwrite: true});

			// Icon
			TweenMax.to(magnifyingGlassIcon, 0.1, {x: (currentMinusDefault / 2), force3D: true, overwrite: true});

			// Sights
			TweenMax.to(outerScope, 0.1, {attr: {r: halfCurrent + 8}, overwrite: true, delay: 0.01});
			TweenMax.to(halfCircle, 0.1, {scale: (magnifyingGlass.currentGlassSize / magnifyingGlass.defaultGlassSize), force3D: true, overwrite: true, delay: 0.01, transformOrigin: 'left center'});
			TweenMax.to(innerScope, 0.1, {attr: {r: halfCurrent - 8, delay: 0.01}, overwrite: 'concurrent'});
			TweenMax.set(sights, {rotation: sightRotation, force3D: true});

			// Guage
			function setGuage() {

				var guageLocation = 0,
					topCoordsInPercentage = -0.05 * currentMinusDefault + 40 + '%',
					bottomCoordsInPercentage = 100 - (-0.05 * currentMinusDefault + 40) + '%',
					centerCoordsInPercentage = (-0.11 * (magnifyingGlass.currentGlassSize - magnifyingGlass.minGlassSize)) + 57.5 + '%';

				if (currentMinusDefault < 0) {
					guageLocation = (currentMinusDefault / -2);
				}

				else if (currentMinusDefault > 0) {

					if (currentMinusDefault >= 125) {
						guageLocation = 50 - (magnifyingGlass.maxGlassSize * 30 / magnifyingGlass.currentGlassSize);
					}

					else {
						guageLocation = 50;
					}
				}

				TweenMax.to(guage, 0.25, {x: guageLocation, force3D: true, overwrite: true});
				TweenMax.to([ticks, tickLine], 0.1, {attr: {y1: topCoordsInPercentage, y2: bottomCoordsInPercentage}, overwrite: true});
				TweenMax.to(indicator, 0.1, {attr: {cy: centerCoordsInPercentage}, overwrite: true});

			}

			setGuage();
		}

		// Handle visual effects of magnifying glass image
		function setEffects(delta){

			var newEffects = {
				blur: Math.min(Math.max(Math.abs(delta / 1.5), 0), 7),
				contrast: 100 + Math.min(Math.max(Math.abs(delta * 8), 0), 200),
			};

			if (Math.abs(delta) < 5) {
				newEffects.blur = 0;
				newEffects.contrast = 100;
			}

			function updateHandler() {
				TweenMax.set(magnifyingGlassImageDiv, {'-webkit-filter': 'blur(' + magnifyingGlass.effects.blur + 'px)' + ' contrast(' + magnifyingGlass.effects.contrast + '%)', 'filter': 'blur(' + magnifyingGlass.effects.blur + 'px)' + ' contrast(' + magnifyingGlass.effects.contrast + '%)'});
			}

			function resetEffects() {
				if (Math.abs(delta) >= 5) {
					TweenMax.to(magnifyingGlass.effects, 0.225, {blur: 0, contrast: 100, overwrite: true, ease: Power1.easeInOut, onUpdate: updateHandler});
				}
			}

			TweenMax.to(magnifyingGlass.effects, 0.075, {blur: newEffects.blur, contrast: newEffects.contrast, overwrite: true, ease: Power1.easeInOut, onUpdate: updateHandler, onComplete: resetEffects});
		}

		// Check if browser uses shitty firefox mouse events
		$(window).one('DOMMouseScroll', function(event) {
			magnifyingGlass.isFirefox = true;
			console.log('firefox');
		});

		$('.js-magnify').on({
			mouseenter: function(){

				$(window).on('wheel.magnifyingGlassWheel', function(event){

					$('#sights').addClass('rotated');

					var delta = event.originalEvent.deltaY,
						wheelDeltaModifier = -1 * delta / 8;

					if (magnifyingGlass.isFirefox) {
						wheelDeltaModifier = -1 * delta;
					}

					var newGlassSize = Math.min(Math.max(magnifyingGlass.currentGlassSize += wheelDeltaModifier, 150), 400);

					magnifyingGlass.currentGlassSize = newGlassSize;

					setSize();

					setEffects(wheelDeltaModifier);					

				});

				TweenMax.to(magnifyingGlassDiv, 0.25, {scaleX: 1, scaleY: 1, scaleZ: 1, force3D: true, ease: Back.easeOut});

				magnifyingGlass.currentSpecimen.image = $(this);
				magnifyingGlass.currentSpecimen.offset = magnifyingGlass.currentSpecimen.image.offset();
				magnifyingGlass.currentSpecimen.width = magnifyingGlass.currentSpecimen.image.width();
				magnifyingGlass.currentSpecimen.height = magnifyingGlass.currentSpecimen.image.height();				
				magnifyingGlass.enlargedSpecimen.image = new Image();

				var src = magnifyingGlass.currentSpecimen.image[0].src;

				magnifyingGlass.enlargedSpecimen.image.src = src;
				magnifyingGlass.enlargedSpecimen.width = magnifyingGlass.enlargedSpecimen.image.width;
				magnifyingGlass.enlargedSpecimen.height = magnifyingGlass.enlargedSpecimen.image.height;

				magnifyingGlassImageDiv.css({
					width: magnifyingGlass.enlargedSpecimen.width + 'px',
					height: magnifyingGlass.enlargedSpecimen.height + 'px',
					backgroundImage: 'url(' + src + ')',
				});

				magnifyingGlassDiv.addClass('magnifying-glass-reveal');
			},
			mousemove: function(event){

				if (!magnifyingGlass.isVisible){
					magnifyingGlassDiv.addClass('magnifying-glass-reveal');
					magnifyingGlass.isVisible = true;
				}

				centerToMouse(event.pageX, event.pageY);				
			},
			mouseleave: function(event){
				$(window).off('wheel.magnifyingGlassWheel');
				magnifyingGlassDiv.removeClass('magnifying-glass-reveal');
				TweenMax.to(magnifyingGlassDiv, 0.25, {scaleX: 0, scaleY: 0, scaleZ: 0, force3D: true, ease: Back.easeIn});
				magnifyingGlass.currentGlassSize = magnifyingGlass.defaultGlassSize;
				setSize();
			}
		});
	}
};

var dynamicImageLoad = {

	checkAndReplace: function(element) {
		element.each(function(index){
			var thisOne, changeAttribute, highResSrc, lastSlashIndex, lastPeriodIndex, lowResSrc;
			thisOne = $(this);
			if ($(this).css('background-image') !== 'none') {
				changeAttribute = function(newSrc) {
					thisOne.css('background-image', newSrc);
				};
				highResSrc = $(this).css('background-image');
			}
			else {
				changeAttribute = function(newSrc) {
					thisOne.attr('src', newSrc);
				};
				highResSrc = $(this).attr('high-res-src');
			}
			lastSlashIndex = highResSrc.lastIndexOf('/');
			lastPeriodIndex = highResSrc.lastIndexOf('.');

			if (window.matchMedia('(-webkit-min-device-pixel-ratio: 1.5) and (min-resolution: 144dpi)').matches) {
				changeAttribute(highResSrc);
			}
			else {
				lowResSrc = highResSrc.slice(0,lastSlashIndex) + '/low-res' + highResSrc.slice(lastSlashIndex, lastPeriodIndex) + '-low-res' + highResSrc.slice(lastPeriodIndex, highResSrc.length);
				changeAttribute(lowResSrc);
			}
		});
	},

	init: function() {
		
		dynamicImageLoad.checkAndReplace($('img, .slide, .nav-progress-indicator, .scroll-teeth'));
	}
};

var vaultVideoSizing = {

	container: '',
	video: '',

	correctAspectRatio: function() {

		if (window.matchMedia('screen and (min-aspect-ratio:16/9)').matches) {
			vaultVideoSizing.video.removeClass('by-height');
			vaultVideoSizing.video.addClass('by-width');
		}

		else {
			vaultVideoSizing.video.removeClass('by-width');
			vaultVideoSizing.video.addClass('by-height');
		}
	},

	init: function() {
		vaultVideoSizing.container = $('#main-vault-video-container');
		vaultVideoSizing.video = vaultVideoSizing.container.find('video');

		vaultVideoSizing.correctAspectRatio();

		$(window).on('resize', function(event) {
			vaultVideoSizing.correctAspectRatio();
		});
	}
};


// ON READY

$(document).ready(function(event){

	dynamicImageLoad.init();
	//loadingScreen.init();

});


// ON LOAD

$(window).load(function(event){

	slider.init();
	modal.init();
	uiActiveStates.init();
	tooltips.init();
	magnifyingGlass.init();

	vaultVideoSizing.init();
	vaultVideoController.init();

});







