var xrayScene = {

	init: function() {

		var canvas, scene, camera, surface, geom, loader, material, texture, composer, renderer;

		canvas = $('canvas');

		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(45, canvas.width() / canvas.height(), 0.1, 10000);

		camera.position.z = (canvas.height() / 2) / (Math.tan((Math.PI * 22.5) / 180));

		geom = new THREE.BoxGeometry(canvas.width(),canvas.height(),0);

		loader = new THREE.TextureLoader();

		loader.load('img/ted.png', function(texture) {
			material = new THREE.MeshBasicMaterial({color: 0xffffff, map: texture});
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( 1, 1 );

			surface = new THREE.Mesh(geom, material);

			scene.add(surface);
		    render();
		},
		function(xhr) {
			console.log('progress');
		},
		function(xhr) {
			console.log('load');
		}
		);

		renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas[0], antialias: true});
		renderer.setSize(canvas.width(), canvas.height());

		composer = new THREE.EffectComposer( renderer );

		var renderPass = new THREE.RenderPass( scene, camera );

		var copyPass = new THREE.ShaderPass( THREE.CopyShader );

		var zoomBlurEffect = new THREE.ShaderPass( THREE.ZoomBlurShader );
		zoomBlurEffect.renderToScreen = true;

		//var dotScreenEffect = new THREE.ShaderPass( THREE.DotScreenShader );
		//dotScreenEffect.uniforms.scale.value = 8;
		//dotScreenEffect.renderToScreen = true;

		composer.addPass( renderPass );
		composer.addPass( copyPass );
		composer.addPass( zoomBlurEffect );
		//composer.addPass( dotScreenEffect );

		function render() {
			composer.render( scene, camera );
			//composer.render();
			//renderer.render();
		}

	}

};

$(window).load(function(event) {
	xrayScene.init();
});