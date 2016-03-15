function Area15XRayEffect(image, destination) {

	// Extend scope
	var self = this;

	// Define image to apply X-Ray effect to
	this.image = {
		imageObject: image,
		width: image.width(),
		height: image.outerHeight(),
		aspectRatio: image.width() / image.height()
	};

	// Define virtual drawing canvas to dynamically create texture off screen
	this.virtualCanvas = document.createElement('canvas');
	this.virtualCanvasContext = '';

	// Define container to add new canvas
	this.destination = {
		destinationObject: destination,
		width: destination.width(),
		height: destination.height(),
		offset: destination.offset(),
		aspectRatio: destination.width() / destination.height()
	};

	// Initialize
	this.init = function() {

		// Set up virtual context
		self.virtualCanvasContext = self.virtualCanvas.getContext('2d');

		// Run functions
		self.prepTexture();
		self.setupWebGL();
	};

	// Prepare texture for webGL
	this.prepTexture = function() {

		// Update container vars
		self.destination.width =  self.destination.destinationObject.width();
		self.destination.height = self.destination.destinationObject.height();

		self.virtualCanvas.width = self.destination.width;
		self.virtualCanvas.height = self.destination.height;

		// Calculate new image dimensions
		var newImageHeight, newImageWidth;

		if (self.image.aspectRatio > 1) {
			newImageHeight = self.destination.width / self.image.aspectRatio;
			newImageWidth = self.destination.width;
		}

		else {
			newImageHeight = self.destination.height;
			newImageWidth = self.destination.height * self.image.aspectRatio;
		}

		// Draw prepped image on virtual canvas
		self.virtualCanvasContext.clearRect(0,0,self.destination.width,self.destination.height);
		self.virtualCanvasContext.fillStyle = '#000';
		self.virtualCanvasContext.fillRect(0,0,self.destination.width,self.destination.height);
		self.virtualCanvasContext.drawImage(self.image.imageObject[0], (self.destination.width / 2) - (newImageWidth / 2), 0, newImageWidth, newImageHeight);

	};

	// Run the webGL
	this.setupWebGL = function() {

		var scene, camera, geometry, texture, material, xRayMaterial, surface, xRaySurface, renderer;

		// Set up scene
		scene = new THREE.Scene();

		// Set up camera
		camera = new THREE.PerspectiveCamera(45, self.destination.width / self.destination.height, 0.1, 10000);
		camera.position.z = (self.destination.height / 2) / (Math.tan((Math.PI * 22.5) / 180));

		// Create 2D drawing surface geometry
		geometry = new THREE.BoxGeometry(self.destination.width,self.destination.height, 0);

		// Render prepped image as a texture
		texture = new THREE.Texture(self.virtualCanvas);
		texture.needsUpdate = true;

		// Create material from texture alone
		material = new THREE.MeshBasicMaterial({map: texture});
		material.transparent = true;
		material.opacity = 0.36;

		// Create X-Ray material from texture and zoom blur shader
		xRayMaterial = new THREE.ShaderMaterial(THREE.ZoomBlurShader);
		xRayMaterial.uniforms.tDiffuse.value = texture;
		xRayMaterial.uniforms.strength.value = 0.06;
		xRayMaterial.uniforms.resolution.value = new THREE.Vector2(self.destination.width, self.destination.height);

		// Create regular surface from geometry and material
		surface = new THREE.Mesh(geometry, material);
		surface.position.set(0, 0, 0.3);

		// Create X-Ray surface from geometry and material
		xRaySurface = new THREE.Mesh(geometry, xRayMaterial);

		// Add surfaces to scene
		scene.add(surface);
		scene.add(xRaySurface);

		// Set up renderer
		renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
		renderer.setSize(self.destination.width, self.destination.height);

		// Aoppend renderer to destination DOM element
		self.destination.destinationObject.append(renderer.domElement);

		// Render
		function render() {
			renderer.render(scene, camera);
		}

		// Change shader vars on mouse move
		function mouseDistort() {
			self.destination.destinationObject.on('mousemove', function(event) {
				xRayMaterial.uniforms.center.value = new THREE.Vector2(event.pageX - self.destination.offset.left, event.pageY - self.destination.offset.top);
				render();
			});
		}

		// Resize everything appropriately
		function resize() {
			$(window).on('resize.xRayResize', function(event) {
				self.prepTexture();
				camera.aspect = self.destination.width / self.destination.height;
				camera.updateProjectionMatrix();
				xRayMaterial.uniforms.resolution.value = new THREE.Vector2(self.destination.width, self.destination.height);
		    	renderer.setSize(self.destination.width, self.destination.height);
		    	render();
			});
		}

		// Function calls
		render();
		mouseDistort();
		resize();

	};
}

var modalXrayEffect = new Area15XRayEffect($('#ted'), $('#destination'));

$(window).load(function(event) {
	modalXrayEffect.init();
});