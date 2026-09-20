// Final pass. Everything here is meant to be felt, not seen:
// a hint of bloom on the accent, a light vignette, fine animated grain that
// doubles as dithering against banding in the background gradient.

uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec2 uResolution;
uniform float uTime;
uniform float uBloomStrength;
uniform float uGrain;
uniform float uVignette;

varying vec2 vUv;

// Interleaved gradient noise: temporally stable per pixel, no texture needed.
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

void main() {
  vec3 col = texture2D(uScene, vUv).rgb;
  col += texture2D(uBloom, vUv).rgb * uBloomStrength;

  // Vignette: a slow darkening at the corners, never a visible ring.
  vec2 q = vUv - 0.5;
  q.x *= uResolution.x / uResolution.y;
  float v = 1.0 - dot(q, q) * uVignette;
  col *= clamp(v, 0.0, 1.0);

  // Grain. The +time term keeps it alive; the amplitude is below the point
  // where you would call it an effect.
  float n = ign(gl_FragCoord.xy + fract(uTime) * 137.0) - 0.5;
  col += n * uGrain;

  gl_FragColor = vec4(col, 1.0);
}
