/**
 * @author Phantasm 

 * Zoom Blur Shader

 * based on glfx.js Zoom Blur shader
 * https://github.com/evanw/glfx.js
 */

THREE.ZoomBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tSize":    { type: "v2", value: new THREE.Vector2( 600, 600 ) },
		"tCoord":    { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"center": { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
		"strength": { type: "f", value: 0.3 },

	},

	vertexShader: [

		'uniform sampler2D tDiffuse;',
        'uniform vec2 center;',
        'uniform float strength;',
        'uniform vec2 tSize;',
        'varying vec2 tCoord;',
        'float random(vec3 scale, float seed) {',
        	'return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);',
    	'}',
		"varying vec2 vUv;",

		"void main() {",

		"}"

	].join( "\n" ),

	/*fragmentShader: [
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

	].join( "\n" )*/

	fragmentShader: [
		'uniform sampler2D tDiffuse;',
        'uniform vec2 center;',
        'uniform float strength;',
        'uniform vec2 tSize;',
        'varying vec2 tCoord;',
        'float random(vec3 scale, float seed) {',
        	'return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);',
    	'}',

        'void main() {',
            'vec4 color = vec4(0.0);',
            'float total = 0.0;',
            'vec2 toCenter = center - tCoord * tSize;',

            'float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);',

            'for (float t = 0.0; t <= 40.0; t++) {',
               ' float percent = (t + offset) / 40.0;',
                'float weight = 4.0 * (percent - percent * percent);',
                'vec4 sample = texture2D(tDiffuse, tCoord + toCenter * percent * strength / tSize);',

                'sample.rgb *= sample.a;',

                'color += sample * weight;',
               'total += weight;',
            '}',

            'gl_FragColor = color / total;',
 
            'gl_FragColor.rgb /= gl_FragColor.a + 0.00001;',
        '}'
	].join( "\n" )

};