// ====================================================//
// ==========   MAIN CLASSES   ========================//
// ====================================================//

function Area15Slider(userConfig) {

	var thisSlider = this,
		config;

	this.index = 1;

	config = {
		name: 'Area 15 Slider',
		slide: $('.slide'),
		getNextPosition: function(){return $(thisSlider.slide[thisSlider.index - 1]).position();},
		getCurrentSlide: function(){return $(thisSlider.slide[thisSlider.index - 1]);},
		container: $('.slider-container'),
		navControl: $('.nav-control'),
		hasProgress: false,
		slideTime: 1.25,
	};

	$.extend(true, config, userConfig);

	this.name = config.name;
	this.slide = config.slide;
	this.current = $(thisSlider.slide[0]);
	this.slides = config.slide.length;
	this.container = config.container;
	this.navControl = config.navControl;
	this.slideTime = config.slideTime;

	if(config.hasProgress) {
		thisSlider.progress = {
			percentage: 0,
			updateProgress: function() {
				$('.nav-progress-number').html(slider.progress.percentage + '%');
			},
		};
	}

	this.endpointReset = function() {
		TweenMax.to(thisSlider.container, 0.35, {x: 0, ease: Power1.easeOut});
	};

	this.init = function() {
		this.moveSlide();
	};

	this.moveSlide = function() {

		thisSlider.navControl.on('click', function(event){

			var nextPos,
				prevPos,
				slideMoveLength,
				sliderCont = thisSlider.container,
				newProgress,
				progressIndicatorCont,
				progressIndicator;

			if (config.hasProgress) {
				newProgress = thisSlider.progress.percentage;
				progressIndicatorCont = $('.nav-progress-indicator-container');
				progressIndicator = $('.nav-progress-indicator');
			}

			if ($(this).hasClass('nav-previous')) {

				if (thisSlider.index == 1) {
					return TweenMax.to(sliderCont, 0.35, {x: "+=75px", ease: Power2.easeIn, onComplete: thisSlider.endpointReset});
				}
				else {
					thisSlider.index = thisSlider.index - 1;
					nextPos = config.getNextPosition();
					slideMoveLength = nextPos.left * 1;
					if (config.hasProgress) {
						newProgress = ((thisSlider.index - 1) / (thisSlider.slides - 1)) * 100;
					}
				}
			}

			else {

				if (thisSlider.index == thisSlider.slides) {
					return TweenMax.to(sliderCont, 0.35, {x: "-=75px", ease: Power2.easeIn, onComplete: thisSlider.endpointReset});
				}

				else {
					thisSlider.index = thisSlider.index + 1;
					nextPos = config.getNextPosition();
					slideMoveLength = nextPos.left * 1;
					if (config.hasProgress) {
						newProgress = ((thisSlider.index - 1) / (thisSlider.slides - 1)) * 100;
					}
				}
			}

			if (config.hasProgress) {
				TweenMax.to(progressIndicatorCont, 1.1, {x: newProgress + "%", ease: Back.easeOut.config(1)});
			}

			thisSlider.current = config.getCurrentSlide();

			TweenMax.to(sliderCont, thisSlider.slideTime, {scrollTo: {x: slideMoveLength}, ease: Power1.easeOut, force3D: true, immediateRender: true});

			$(window).resize(function(event){
				nextPos = config.getNextPosition();
				slideMoveLength = nextPos.left * 1;
				TweenMax.set(sliderCont, {scrollTo: {x: slideMoveLength}, ease: Power1.easeOut});
			});

		});
	};

	this.loadNextScene = '';
}


// ====================================================//
// ==========   MAIN OBJECTS   ========================//
// ====================================================//

var slider = new Area15Slider({name: 'Main Slider', hasProgress: true});

var modal = {

	current: '',

	init: function() {

		// LOAD ALL WEBGL MODELS

		modal.loadModels.init();

		// SET UP MODAL SLIDER OBJECT

		var modalSlider = new Area15Slider({
	     		name: 'Modal Slider',
	     		navControl: $('.modal-nav-control'),
				slideTime: 0.8
		});

		modal.slider = modalSlider;
		modal.slider.init();

		// SET UP MODAL VIDEO PLAYER OBJECT

		var modalVideoPlayer = new FifteenFourVideoPlayer({
			name: 'Modal Video Player'
		});

		modal.videoPlayer = modalVideoPlayer;

		// LAUNCH MODAL & UPDATE VARS

	    $('.js-modal').on('click', function(event) {

	     	event.preventDefault();

	     	modal.current = $($(this).data('target'));

	     	modalSlider.slide = modal.current.find('.modal-slide');
	     	modalSlider.slides = modalSlider.slide.length;
	     	modalSlider.current = $(modalSlider.slide[modalSlider.index - 1]);
	     	modalSlider.container = modal.current.find('.modal-slide-container');
			modalSlider.navControl = modal.current.find('.modal-nav-control');

			if(modal.slider.slides > 1) {
				modal.current.find('.modal-nav-control').css('display', 'inline');
			}

			if (modal.current.find('.MMVP-video').length) {
				modal.videoPlayer.container = modal.current.find('.MMVP-video');
				modal.videoPlayer.init();
			}

			// WEB GL PREP

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

						var canvas, scene, camera, light, spotlightSide, spotlightFront, spotlightBottom, controls, mouse, raycaster, renderer, loader, model, boundingBox;

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

						loader = new THREE.JSONLoader();

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

						$(window).resize(function(event){
							var canvasWidth = modal.slider.canvas.width(),
								canvasHeight = modal.slider.canvas.height();
							camera.aspect = canvasWidth / canvasHeight;
							camera.updateProjectionMatrix();
		    				renderer.setSize(canvasWidth, canvasHeight);
		    				render();
						});
					}
				};

				if (modalSlider.loadNextScene.init && modal.current.find('.modal-model-container').length) {
					modalSlider.loadNextScene.init();
				}

			}

			modal.slider.reset = function() {
				if (modal.slider.loadNextScene) {
					modal.slider.loadNextScene.controls.dispose();
					modal.slider.loadNextScene.controls = null;
					modal.slider.loadNextScene.scene = null;
				}
				modal.slider.index = 1;
				modal.slider.current = '';
				modal.slider.slides = '';
				TweenMax.set(modal.current.find('.modal-slide-container'), {scrollTo: {x: 0}});
			};


	    	modal.current.addClass('is-staged');
	    	window.setTimeout(function(){
	    		modal.current.addClass('is-visible');
	    	},1);
	    });

	    $('.modal__box').on('click', function(event) {
	      	event.stopPropagation();
	    });

	    $('.js-close-modal').on('click', function(event) {
	      	event.preventDefault();
	      	modal.closeModal();
	    });

	},

	closeModal: function() {
		modal.current.removeClass('is-visible');
	    window.setTimeout(function(){
	      	modal.current.removeClass('is-staged');
	      	modal.slider.reset();
	      	modal.videoPlayer.reset();
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

function FifteenFourVideoPlayer(userConfig) {

	var thisPlayer = this,
		config;

	config = {
		name: 'Area 15 Video Player',
		container: $('.MMVP-video')
	};

	$.extend(true, config, userConfig);

	this.name = config.name;

	this.container = config.container;

	this.video = '';

	this.isUserActive = '';

	this.init = function() {
		thisPlayer.container.find('video').removeAttr('controls');
		thisPlayer.video = modal.current.find('video')[0];
		thisPlayer.isUserActive = true;
		thisPlayer.playPause.init();
		thisPlayer.progress.init();
		thisPlayer.volume.init();
		thisPlayer.contextMenu();
		thisPlayer.autoHideControls.init();
		thisPlayer.keyboardShortcuts.init();

		if (document.fullscreenEnabled || 
			document.webkitFullscreenEnabled || 
			document.mozFullScreenEnabled ||
			document.msFullscreenEnabled
			) {
			thisPlayer.fullscreen.init();
		}
	};

	this.playPause = {

		playVideo: '',

		pauseVideo: '',

		init: function() {
			thisPlayer.container.find('.MMVP-video-controls-play-pause').on('click', function(){
				if (thisPlayer.video.paused) {
					thisPlayer.video.play();
				}
				else {
					thisPlayer.video.pause();
				}	
			});

			modal.videoPlayer.playPause.playVideo = function() {
				thisPlayer.container.find('.MMVP-video-controls-play-pause').addClass('MMVP-play-controls-play-pause-pause-state');
				thisPlayer.autoHideControls.changeUserActivity();
				thisPlayer.autoHideControls.setActivityCheck();
			};

			modal.videoPlayer.playPause.pauseVideo = function() {
				thisPlayer.container.find('.MMVP-video-controls-play-pause').removeClass('MMVP-play-controls-play-pause-pause-state');
				window.clearInterval(thisPlayer.autoHideControls.activityCheck);
				window.clearTimeout(thisPlayer.autoHideControls.inactivityTimeout);
				thisPlayer.container.find('.modal-video-inner-container').removeClass('MMVP-inactive');
			};

			thisPlayer.video.addEventListener('play', thisPlayer.playPause.playVideo, false);
			thisPlayer.video.addEventListener('pause', thisPlayer.playPause.pauseVideo, false);

		},
	};

	this.progress = {

		updateProgressIndicator: '',
		updateProgressBar: '',
		updateProgress: '',

		init: function() {

			var duration = thisPlayer.video.duration;

			Number.prototype.toHHMMSS = function () {
				var sec_num = this,
					hours   = Math.floor(sec_num / 3600),
					minutes = Math.floor((sec_num - (hours * 3600)) / 60),
					seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60)),
					time;

				if (hours   < 10) {hours   = "0" + hours;}
				if (minutes < 10) {minutes = "0" + minutes;}
				if (seconds < 10) {seconds = "0" + seconds;}

				if (hours > 0) {
				   	time    = hours + ':' + minutes + ':' + seconds;
				}
				else {
				    time    = minutes + ':' + seconds;
				}
				return time;
			};

			thisPlayer.progress.updateProgressIndicator = function() {
				thisPlayer.container.find('.MMVP-video-progress-indicator').html('<span class="MMVP-video-current-time">' + modal.videoPlayer.video.currentTime.toHHMMSS() + '</span> / ' + duration.toHHMMSS());
			};

			thisPlayer.progress.updateProgressBar = function() {
				var progressPercentage = (thisPlayer.video.currentTime / duration) * 100;
				if (progressPercentage > 100) {
					progressPercentage = 100;
				}
				else if (progressPercentage < 0) {
					progressPercentage = 0;
				}
				thisPlayer.container.find('.MMVP-video-progress-bar').css('width', progressPercentage + '%');
			};

			thisPlayer.progress.updateProgress = function() {
				thisPlayer.progress.updateProgressIndicator();
				thisPlayer.progress.updateProgressBar();
			};

			thisPlayer.video.addEventListener('timeupdate', thisPlayer.progress.updateProgress, false);

			function toRuntimePercentage(percentage) {
				if (percentage < 0) {
					percentage = 0;
				}
				else if (percentage > 100) {
					percentage = 100;
				}

				var newTime = modal.videoPlayer.video.duration * (percentage / 100);
				thisPlayer.video.currentTime = newTime;
				thisPlayer.progress.updateProgress();
			}

			thisPlayer.container.find('.MMVP-video-progress-bar-interaction').on('mousedown', function(event){
				var offset = thisPlayer.container.find('.MMVP-video-progress-bar-container').offset();
				var width = thisPlayer.container.find('.MMVP-video-progress-bar-container').width();
				var percentage = (event.pageX - offset.left) / (width) * 100;
				toRuntimePercentage(percentage);
			});

			thisPlayer.container.find('.MMVP-video-progress-grabber-interaction').on('mousedown', function(event){
				event.stopPropagation();
				event.preventDefault();
				var wasVideoPaused = true;
				if(!thisPlayer.video.paused) {
					thisPlayer.video.pause();
					wasVideoPaused = false;
				}

				thisPlayer.container.find('.MMVP-video-progress-bar').css('transition', '0s');

				var offset = thisPlayer.container.find('.MMVP-video-progress-bar-container').offset(),
					left = event.pageX - offset.left,
					containerHeight = thisPlayer.container.find('.MMVP-video-progress-bar-container').width(),
					percentage = (left / containerHeight) * 100;

				toRuntimePercentage(percentage);

				$(window).on('mousemove', function(event){
					event.preventDefault();
					left = event.pageX - offset.left;
					percentage = (left / containerHeight) * 100;
					toRuntimePercentage(percentage);
				});

				$(window).on('mouseup', function(){
					$(window).off('mousemove');
					thisPlayer.container.find('.MMVP-video-progress-bar').css('transition', '');
					if (!wasVideoPaused) {
						thisPlayer.video.play();
					}
				});
			});

			thisPlayer.progress.updateProgress();

		}
			
	};

	this.volume = {

		checkVolume: function(volume) {
			var volumeButton = thisPlayer.container.find('.MMVP-video-controls-volume');
			if (volume > 0) {
				if (volume > 100) {
					volume = 100;
				}
				if (thisPlayer.video.muted) {
					video.muted = false;
					volumeButton.removeClass('MMVP-video-controls-volume-muted');
				}

				if (volume >= 66) {
					volumeButton.removeClass('MMVP-video-controls-volume-muted MMVP-video-controls-volume-quiet MMVP-video-controls-volume-normal');
				}

				if (volume >= 33 && volume < 66 && !volumeButton.hasClass('MMVP-video-controls-volume-normal')) {
					volumeButton.removeClass('MMVP-video-controls-volume-muted MMVP-video-controls-volume-quiet MMVP-video-controls-volume-normal');
					volumeButton.addClass('MMVP-video-controls-volume-normal');
				}
								
				if (volume < 33 && volume > 0 && !volumeButton.hasClass('MMVP-video-controls-volume-quiet')) {
					volumeButton.removeClass('MMVP-video-controls-volume-muted MMVP-video-controls-volume-normal');
					volumeButton.addClass('MMVP-video-controls-volume-quiet');
				}
			}						
			else if (volume <= 0) {
				volume = 0;
				thisPlayer.video.muted = true;
				volumeButton.addClass('MMVP-video-controls-volume-muted');
			}

			return volume;
		},

		changeVolumeSlider: function(newVolumePercentage) {
			var containerHeight = thisPlayer.container.find('.MMVP-volume-slider-container').height(),
				top = ((100 - newVolumePercentage) / 100) * containerHeight,
				fixedVolumePercentage = thisPlayer.volume.checkVolume(newVolumePercentage);		
			thisPlayer.container.find('.MMVP-volume-slider-grabber-interaction').css('top', top);
			thisPlayer.video.volume = fixedVolumePercentage / 100;
		},

		init: function() {
			thisPlayer.container.find('.MMVP-video-controls-volume').on('click', function(){
				var currentVol = thisPlayer.video.volume;
				if (!thisPlayer.video.muted) {
					thisPlayer.volume.checkVolume(0);
				}
				else if(thisPlayer.video.muted && thisPlayer.video.volume === 0) {
					thisPlayer.volume.changeVolumeSlider(50);
				}
				else {
					thisPlayer.volume.checkVolume(currentVol * 100);
					thisPlayer.video.volume = currentVol;
				}
			});

			thisPlayer.container.find('.MMVP-volume-slider-grabber-interaction').on('mousedown', function(event){
				$(window).on('mousemove', function(event){
					event.preventDefault();
					var offset = thisPlayer.container.find('.MMVP-volume-slider-container').offset(),
						top = event.pageY - offset.top,
						containerHeight = thisPlayer.container.find('.MMVP-volume-slider-container').height();

					if(top > -1 && top < containerHeight) {
						var newVolumePercentage = Math.floor(99 - ((top / containerHeight) * 100));
						thisPlayer.volume.changeVolumeSlider(newVolumePercentage);
					}
				});

				$(window).on('mouseup', function(){
					$(window).off('mousemove');
				});
			});

			thisPlayer.container.find('.MMVP-volume-slider-box').on('click', function(event){
				event.preventDefault();
				var offset = thisPlayer.container.find('.MMVP-volume-slider-container').offset(),
					top = event.pageY - offset.top,
					containerHeight = thisPlayer.container.find('.MMVP-volume-slider-container').height();
				if(top > -1 && top < containerHeight) {
					var newVolumePercentage = Math.floor(99 - ((top / containerHeight) * 100));
					thisPlayer.volume.changeVolumeSlider(newVolumePercentage, false);
				}
				else if (top <= -1) {
					thisPlayer.volume.changeVolumeSlider(100);
				}
				else if (top >= containerHeight) {
					thisPlayer.volume.changeVolumeSlider(0);
				}
			});	

			thisPlayer.container.find('.MMVP-video-controls').on({
				mouseenter: function(event) {
					window.clearInterval(thisPlayer.autoHideControls.activityCheck);
					window.clearTimeout(thisPlayer.autoHideControls.inactivityTimeout);
				},
				mousemove: function(event) {
					event.stopPropagation();
					if (thisPlayer.autoHideControls.inactivityTimeout) {
						window.clearInterval(thisPlayer.autoHideControls.activityCheck);
						window.clearTimeout(thisPlayer.autoHideControls.inactivityTimeout);
						thisPlayer.autoHideControls.inactivityTimeout = false;
					}
				},
				mouseleave: function(event){
					if (!thisPlayer.video.paused) {
						thisPlayer.autoHideControls.setActivityCheck();
					}
			}});
		}		
	};

	this.fullscreen = {

		fullscreenChange: '',

		init: function() {
			var videoContainer = thisPlayer.container.find('.modal-video-inner-container')[0];
			thisPlayer.container.find('.MMVP-video-controls-fullscreen-toggle').on('click', function(){
				if (document.fullscreenElement === null ||
					document.webkitFullscreenElement === null ||
					document.mozFullScreenElement === null ||
					document.msFullscreenElement === null
					) {
					if (videoContainer.requestFullscreen) {
						videoContainer.requestFullscreen();
					} else if (videoContainer.webkitRequestFullscreen) {
						videoContainer.webkitRequestFullscreen();
					} else if (videoContainer.mozRequestFullScreen) {
						videoContainer.mozRequestFullScreen();
					} else if (videoContainer.msRequestFullscreen) {
						videoContainer.msRequestFullscreen();
					}
				}
				else {
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.msExitFullscreen) {
						document.msExitFullscreen();
					}
				}	
			});

			thisPlayer.fullscreen.fullscreenChange = function() {
				if (document.fullscreenElement === null ||
					document.webkitFullscreenElement === null ||
					document.mozFullScreenElement === null ||
					document.msFullscreenElement === null
					) {
					thisPlayer.container.find('.MMVP-video-controls-fullscreen-toggle').removeClass('MMVP-fullscreen-toggle-fullscreen-state');
				}
				else {
					thisPlayer.container.find('.MMVP-video-controls-fullscreen-toggle').addClass('MMVP-fullscreen-toggle-fullscreen-state');
				}
			};

			document.addEventListener('fullscreenchange', thisPlayer.fullscreen.fullscreenChange);
			document.addEventListener('webkitfullscreenchange', thisPlayer.fullscreen.fullscreenChange);
			document.addEventListener('mozfullscreenchange', thisPlayer.fullscreen.fullscreenChange);
			document.addEventListener('MSFullscreenChange', thisPlayer.fullscreen.fullscreenChange);
		},
	};

	this.contextMenu = function() {
		var video = thisPlayer.video;
		video.addEventListener('contextmenu', function(event){
			event.preventDefault();
		}, false);
	};

	this.autoHideControls = {

		userActivity: '',
		changeUserActivity: '',
		activityCheck: '',
		inactivityTimeout: '',

		setActivityCheck: function() {

			var videoContainer = thisPlayer.container.find('.modal-video-inner-container'),
				inactivityTimeout;

			thisPlayer.autoHideControls.activityCheck = window.setInterval(function(){

				if (thisPlayer.autoHideControls.userActivity) {
					thisPlayer.autoHideControls.userActivity = false;
					if (!thisPlayer.isUserActive) {
						thisPlayer.isUserActive = true;
						videoContainer.removeClass('MMVP-inactive');
					}

					if (thisPlayer.autoHideControls.inactivityTimeout) {
						window.clearTimeout(thisPlayer.autoHideControls.inactivityTimeout);
					}

					thisPlayer.autoHideControls.inactivityTimeout =	window.setTimeout(function() {
						if (!thisPlayer.autoHideControls.userActivity) {
							thisPlayer.isUserActive = false;
							videoContainer.addClass('MMVP-inactive');
						}
					}, 5000);
				}

			}, 250);
		},

		init: function() {

			thisPlayer.autoHideControls.changeUserActivity = function() {
				if (!thisPlayer.autoHideControls.userActivity) {
					thisPlayer.autoHideControls.userActivity = true;
				}
			};

			thisPlayer.video.addEventListener('mousemove', thisPlayer.autoHideControls.changeUserActivity);
		}
	};

	this.keyboardShortcuts = {

		processKeyboardShortcuts: function(event) {

			event.preventDefault();

			switch (event.which) {
				case 32:
					if (thisPlayer.video.paused) {
						thisPlayer.video.play();
					}
					else {
						thisPlayer.video.pause();
					}
				break;
				case 77:
				if (!thisPlayer.video.muted) {
					thisPlayer.video.muted = true;
					thisPlayer.container.find('.MMVP-video-controls-volume').addClass('MMVP-video-controls-volume-muted');
				}
				else {
					thisPlayer.video.muted = false;
					thisPlayer.container.find('.MMVP-video-controls-volume').removeClass('MMVP-video-controls-volume-muted');
				}
			}
			thisPlayer.autoHideControls.changeUserActivity();
		},

		init: function() {
			$(document).on('keydown', thisPlayer.keyboardShortcuts.processKeyboardShortcuts);
		}
	};

	this.reset = function() {
		if (thisPlayer.video) {
			$(window).off('mouseup');
			thisPlayer.video.pause();
			thisPlayer.container.find('.MMVP-video-progress-grabber-interaction').off('mousedown');
			thisPlayer.container.find('.MMVP-video-progress-bar-interaction').off('mousedown');
			thisPlayer.container.find('.MMVP-volume-slider-container').off('click');
			thisPlayer.container.find('.MMVP-video-controls').off('mouseenter mousemove mouseleave');
			thisPlayer.container.find('.MMVP-video-controls-volume').off('click');
			thisPlayer.container.find('.MMVP-video-controls-play-pause').off('click');
			thisPlayer.container.find('.MMVP-video-controls-fullscreen-toggle').off('click');
			thisPlayer.video.removeEventListener('play', thisPlayer.playPause.playVideo);
			thisPlayer.video.removeEventListener('pause', thisPlayer.playPause.pauseVideo);
			thisPlayer.video.removeEventListener('timeupdate', thisPlayer.progress.updateProgress);
			thisPlayer.video.removeEventListener('mousemove', thisPlayer.autoHideControls.timer);
			window.clearInterval(thisPlayer.autoHideControls.activityCheck);
			document.removeEventListener('fullscreenchange', thisPlayer.fullscreen.fullscreenChange);
			document.removeEventListener('webkitfullscreenchange', thisPlayer.fullscreen.fullscreenChange);
			document.removeEventListener('mozfullscreenchange', thisPlayer.fullscreen.fullscreenChange);
			document.removeEventListener('MSFullscreenChange', thisPlayer.fullscreen.fullscreenChange);
			$(document).off('keydown', thisPlayer.keyboardShortcuts.processKeyboardShortcuts);
		}
	};
}

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
		},250);
	}
};

var tooltips = {

	current: '',

	title: '',

	computeMousePosition: function(pageX, pageY) {
		var mouseLeft = pageX - 0;
		var mouseTop = pageY - 0;

		tooltips.mousePos.x = mouseLeft;
		tooltips.mousePos.y = mouseTop;
	},

	init: function() {
		$('.js-tooltip').hover(
			function(event) {
				tooltips.current = $(this);
				tooltips.title = tooltips.current.data('title');
				$('.tooltip-text').html(tooltips.title);
				$('.tooltip-text').addClass('tooltip-reveal');
				TweenMax.to('.tooltip', 0.35, {autoAlpha: 1});

			},
			function(event) {
				$('.tooltip-text').removeClass('tooltip-reveal');
				TweenMax.to('.tooltip', 0.35, {autoAlpha: 0});
		});

		$('.js-tooltip').on('mousemove', function(event) {
			var pageX = event.pageX;
			var pageY = event.pageY;
			$('.tooltip').css({'left': pageX, 'top': pageY - 25});
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

});








