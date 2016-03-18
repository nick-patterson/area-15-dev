// ====================================================//
// ==========   VIDEO PLAYER   ========================//
// ====================================================//

function FifteenFourVideoPlayer(userConfig) {

	var self = this,
		config;

	config = {
		name: 'Area 15 Video Player',
		container: $('.MMVP-video'),
	};

	$.extend(true, config, userConfig);

	this.name = config.name;

	this.container = config.container;

	this.video = '';

	this.isUserActive = '';

	this.init = function() {
		self.container.find('video').removeAttr('controls');
		self.video = modal.current.find('video')[0];
		self.isUserActive = true;
		self.playPause.init();
		self.progress.init();
		self.volume.init();
		self.contextMenu();
		self.autoHideControls.init();
		self.keyboardShortcuts.init();

		if (document.fullscreenEnabled || 
			document.webkitFullscreenEnabled || 
			document.mozFullScreenEnabled ||
			document.msFullscreenEnabled
			) {
			self.fullscreen.init();
		}
	};

	this.DOMReset = function() {
		config.container = $(config.container.selector);
		self.init();
	};

	this.playPause = {

		playVideo: '',

		pauseVideo: '',

		init: function() {
			self.container.find('.MMVP-video-controls-play-pause').on('click', function(){
				if (self.video.paused) {
					self.video.play();
				}
				else {
					self.video.pause();
				}	
			});

			modal.videoPlayer.playPause.playVideo = function() {
				self.container.find('.MMVP-video-controls-play-pause').addClass('MMVP-play-controls-play-pause-pause-state');
				self.autoHideControls.changeUserActivity();
				self.autoHideControls.setActivityCheck();
			};

			modal.videoPlayer.playPause.pauseVideo = function() {
				self.container.find('.MMVP-video-controls-play-pause').removeClass('MMVP-play-controls-play-pause-pause-state');
				window.clearInterval(self.autoHideControls.activityCheck);
				window.clearTimeout(self.autoHideControls.inactivityTimeout);
				self.container.find('.modal-video-inner-container').removeClass('MMVP-inactive');
			};

			self.video.addEventListener('play', self.playPause.playVideo, false);
			self.video.addEventListener('pause', self.playPause.pauseVideo, false);

		},
	};

	this.progress = {

		updateProgressIndicator: '',
		updateProgressBar: '',
		updateProgress: '',

		init: function() {

			var duration = self.video.duration;

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

			self.progress.updateProgressIndicator = function() {
				self.container.find('.MMVP-video-progress-indicator').html('<span class="MMVP-video-current-time">' + modal.videoPlayer.video.currentTime.toHHMMSS() + '</span> / ' + duration.toHHMMSS());
			};

			self.progress.updateProgressBar = function() {
				var progressPercentage = (self.video.currentTime / duration) * 100;
				if (progressPercentage > 100) {
					progressPercentage = 100;
				}
				else if (progressPercentage < 0) {
					progressPercentage = 0;
				}
				self.container.find('.MMVP-video-progress-bar').css('width', progressPercentage + '%');
			};

			self.progress.updateProgress = function() {
				self.progress.updateProgressIndicator();
				self.progress.updateProgressBar();
			};

			self.video.addEventListener('timeupdate', self.progress.updateProgress, false);

			function toRuntimePercentage(percentage) {
				if (percentage < 0) {
					percentage = 0;
				}
				else if (percentage > 100) {
					percentage = 100;
				}

				var newTime = modal.videoPlayer.video.duration * (percentage / 100);
				self.video.currentTime = newTime;
				self.progress.updateProgress();
			}

			self.container.find('.MMVP-video-progress-bar-interaction').on('mousedown', function(event){
				var offset = self.container.find('.MMVP-video-progress-bar-container').offset();
				var width = self.container.find('.MMVP-video-progress-bar-container').width();
				var percentage = (event.pageX - offset.left) / (width) * 100;
				toRuntimePercentage(percentage);
			});

			self.container.find('.MMVP-video-progress-grabber-interaction').on('mousedown', function(event){
				event.stopPropagation();
				event.preventDefault();
				var wasVideoPaused = true;
				if(!self.video.paused) {
					self.video.pause();
					wasVideoPaused = false;
				}

				self.container.find('.MMVP-video-progress-bar').css('transition', '0s');

				var offset = self.container.find('.MMVP-video-progress-bar-container').offset(),
					left = event.pageX - offset.left,
					containerHeight = self.container.find('.MMVP-video-progress-bar-container').width(),
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
					self.container.find('.MMVP-video-progress-bar').css('transition', '');
					if (!wasVideoPaused) {
						self.video.play();
					}
				});
			});

			self.progress.updateProgress();

		}
			
	};

	this.volume = {

		checkVolume: function(volume) {
			var volumeButton = self.container.find('.MMVP-video-controls-volume');
			if (volume > 0) {
				if (volume > 100) {
					volume = 100;
				}
				if (self.video.muted) {
					self.video.muted = false;
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
				self.video.muted = true;
				volumeButton.addClass('MMVP-video-controls-volume-muted');
			}

			return volume;
		},

		changeVolumeSlider: function(newVolumePercentage) {
			var containerHeight = self.container.find('.MMVP-volume-slider-container').height(),
				top = ((100 - newVolumePercentage) / 100) * containerHeight,
				fixedVolumePercentage = self.volume.checkVolume(newVolumePercentage);		
			self.container.find('.MMVP-volume-slider-grabber-interaction').css('top', top);
			self.video.volume = fixedVolumePercentage / 100;
		},

		init: function() {

			function slideVolume() {
				$(window).on('mousemove.volumeMousemove', function(event){
					event.preventDefault();
					var offset = self.container.find('.MMVP-volume-slider-container').offset(),
						top = event.pageY - offset.top,
						containerHeight = self.container.find('.MMVP-volume-slider-container').height();

					if(top > -1 && top < containerHeight) {
						var newVolumePercentage = Math.floor(99 - ((top / containerHeight) * 100));
						self.volume.changeVolumeSlider(newVolumePercentage);
					}
				});

				$(window).on('mouseup.volumeMouseup', function(){
					$(window).off('mousemove.volumeMousemove');
					$(window).off('mouseup.volumeMouseup');
				});
			}

			self.container.find('.MMVP-video-controls-volume').on('mousedown', function(){
				var currentVol = self.video.volume;
				if (!self.video.muted) {
					self.volume.checkVolume(0);
				}
				else if(self.video.muted && self.video.volume === 0) {
					self.volume.changeVolumeSlider(50);
				}
				else {
					self.volume.checkVolume(currentVol * 100);
					self.video.volume = currentVol;
				}
			});

			self.container.find('.MMVP-volume-slider-box').on('mousedown', function(event){
				event.preventDefault();
				var offset = self.container.find('.MMVP-volume-slider-container').offset(),
					top = event.pageY - offset.top,
					containerHeight = self.container.find('.MMVP-volume-slider-container').height();
				if(top > -1 && top < containerHeight) {
					var newVolumePercentage = Math.floor(99 - ((top / containerHeight) * 100));
					self.volume.changeVolumeSlider(newVolumePercentage, false);
				}
				else if (top <= -1) {
					self.volume.changeVolumeSlider(100);
				}
				else if (top >= containerHeight) {
					self.volume.changeVolumeSlider(0);
				}
				slideVolume();
			});	

			self.container.find('.MMVP-video-controls').on({
				mouseenter: function(event) {
					window.clearInterval(self.autoHideControls.activityCheck);
					window.clearTimeout(self.autoHideControls.inactivityTimeout);
				},
				mousemove: function(event) {
					if (self.autoHideControls.inactivityTimeout) {
						window.clearInterval(self.autoHideControls.activityCheck);
						window.clearTimeout(self.autoHideControls.inactivityTimeout);
						self.autoHideControls.inactivityTimeout = false;
					}
				},
				mouseleave: function(event){
					if (!self.video.paused) {
						self.autoHideControls.setActivityCheck();
					}
			}});
		}		
	};

	this.fullscreen = {

		fullscreenChange: '',

		init: function() {
			var videoContainer = self.container.find('.modal-video-inner-container')[0];
			self.container.find('.MMVP-video-controls-fullscreen-toggle').on('click', function(){
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

			self.fullscreen.fullscreenChange = function() {
				if (document.fullscreenElement === null ||
					document.webkitFullscreenElement === null ||
					document.mozFullScreenElement === null ||
					document.msFullscreenElement === null
					) {
					self.container.find('.MMVP-video-controls-fullscreen-toggle').removeClass('MMVP-fullscreen-toggle-fullscreen-state');
				}
				else {
					self.container.find('.MMVP-video-controls-fullscreen-toggle').addClass('MMVP-fullscreen-toggle-fullscreen-state');
				}
			};

			document.addEventListener('fullscreenchange', self.fullscreen.fullscreenChange);
			document.addEventListener('webkitfullscreenchange', self.fullscreen.fullscreenChange);
			document.addEventListener('mozfullscreenchange', self.fullscreen.fullscreenChange);
			document.addEventListener('MSFullscreenChange', self.fullscreen.fullscreenChange);
		},
	};

	this.contextMenu = function() {
		var video = self.video;
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

			var videoContainer = self.container.find('.modal-video-inner-container'),
				inactivityTimeout;

			self.autoHideControls.activityCheck = window.setInterval(function(){

				if (self.autoHideControls.userActivity) {
					self.autoHideControls.userActivity = false;
					if (!self.isUserActive) {
						self.isUserActive = true;
						videoContainer.removeClass('MMVP-inactive');
					}

					if (self.autoHideControls.inactivityTimeout) {
						window.clearTimeout(self.autoHideControls.inactivityTimeout);
					}

					self.autoHideControls.inactivityTimeout =	window.setTimeout(function() {
						if (!self.autoHideControls.userActivity) {
							self.isUserActive = false;
							videoContainer.addClass('MMVP-inactive');
						}
					}, 5000);
				}

			}, 250);
		},

		init: function() {

			self.autoHideControls.changeUserActivity = function() {
				if (!self.autoHideControls.userActivity) {
					self.autoHideControls.userActivity = true;
				}
			};

			self.video.addEventListener('mousemove', self.autoHideControls.changeUserActivity);
		}
	};

	this.keyboardShortcuts = {

		processKeyboardShortcuts: function(event) {

			event.preventDefault();

			switch (event.which) {
				case 32:
					if (self.video.paused) {
						self.video.play();
					}
					else {
						self.video.pause();
					}
				break;
				case 77:
				if (!self.video.muted) {
					self.video.muted = true;
					self.container.find('.MMVP-video-controls-volume').addClass('MMVP-video-controls-volume-muted');
				}
				else {
					self.video.muted = false;
					self.container.find('.MMVP-video-controls-volume').removeClass('MMVP-video-controls-volume-muted');
				}
			}
			self.autoHideControls.changeUserActivity();
		},

		init: function() {
			$(document).on('keydown', self.keyboardShortcuts.processKeyboardShortcuts);
		}
	};

	this.reset = function() {
		if (self.video) {
			self.video.pause();
			self.container.find('.MMVP-video-progress-grabber-interaction').off('mousedown');
			self.container.find('.MMVP-video-progress-bar-interaction').off('mousedown');
			self.container.find('.MMVP-volume-slider-box').off('mousedown');
			self.container.find('.MMVP-video-controls').off('mouseenter mousemove mouseleave');
			self.container.find('.MMVP-video-controls-volume').off('click');
			self.container.find('.MMVP-video-controls-play-pause').off('click');
			self.container.find('.MMVP-video-controls-fullscreen-toggle').off('click');
			self.video.removeEventListener('play', self.playPause.playVideo);
			self.video.removeEventListener('pause', self.playPause.pauseVideo);
			self.video.removeEventListener('timeupdate', self.progress.updateProgress);
			self.video.removeEventListener('mousemove', self.autoHideControls.timer);
			window.clearInterval(self.autoHideControls.activityCheck);
			document.removeEventListener('fullscreenchange', self.fullscreen.fullscreenChange);
			document.removeEventListener('webkitfullscreenchange', self.fullscreen.fullscreenChange);
			document.removeEventListener('mozfullscreenchange', self.fullscreen.fullscreenChange);
			document.removeEventListener('MSFullscreenChange', self.fullscreen.fullscreenChange);
			$(document).off('keydown', self.keyboardShortcuts.processKeyboardShortcuts);
		}
	};
}