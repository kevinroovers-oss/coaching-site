// What the glass sees behind itself.
//
// Rendered tiny and blurred twice, so it is a density field rather than a
// picture: it only has to answer "how much matter is behind this fragment,
// and roughly what colour". Cheap on purpose — it is never displayed.

uniform vec3 uBase;
uniform vec3 uBg;
uniform vec3 uAccent;
uniform float uIridescence;

varying vec3 vNormal;
varying vec3 vWorld;
varying float vSeed;
varying float vHighlight;
varying float vDim;

vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(0.0, dot(N, V)), 2.0);

  // Mostly the base colour, with a whisper of hue so a dense cluster glows
  // faintly from the inside instead of going flat grey. Any more than this and
  // the refraction turns the whole swarm pastel.
  vec3 col = mix(uBase, spectrum(fres * 0.8 + vSeed * 0.15), 0.18 * (0.4 + uIridescence));
  col = mix(col, uAccent, vHighlight * 0.8);
  col = mix(col, uBg, vDim * 0.72);
  gl_FragColor = vec4(col, 1.0);
}
