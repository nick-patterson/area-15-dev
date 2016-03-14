/**
 * @author Phantasm 

 * Zoom Blur Shader

 * based on glfx.js Zoom Blur shader
 * https://github.com/evanw/glfx.js
 */

THREE.ZoomBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"center": { type: "v2", value: new THREE.Vector2( 0, -100 ) },
		"strength": { type: "f", value: 0.3 },
		"resolution": { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },

	},

	vertexShader: [
		"uniform vec2 center;",
		"uniform float strength;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"uniform sampler2D tDiffuse;",

		"void main() {",

		"}"

	].join( "\n" ),

	fragmentShader: [
		"uniform vec2 center;",
		"uniform float strength;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"uniform sampler2D tDiffuse;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"vec2 toCenter = center - vUv * resolution;",
			"vec2 inc = toCenter * strength / resolution;",
			"float boost = 2.0;",

			"inc = center / resolution - vUv;",
			
			"sum += texture2D( tDiffuse, ( vUv - inc * 4. ) ) * 0.051;",
			"sum += texture2D( tDiffuse, ( vUv - inc * 3. ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, ( vUv - inc * 2. ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, ( vUv - inc * 1. ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, ( vUv + inc * 0. ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, ( vUv + inc * 1. ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, ( vUv + inc * 2. ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, ( vUv + inc * 3. ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, ( vUv + inc * 4. ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"		

	].join( "\n" )

};