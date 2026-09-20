// Isolates the accent for bloom.
//
// A normal luminance threshold is useless here: the background is off-white and
// would bloom instead of the elements. So we threshold on *saturation* — the
// accent is the only chromatic thing in the whole frame.

uniform sampler2D uScene;
varying vec2 vUv;

void main() {
  vec3 c = texture2D(uScene, vUv).rgb;
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  float sat = mx - mn;
  float w = smoothstep(0.10, 0.34, sat);
  gl_FragColor = vec4(c * w, 1.0);
}
