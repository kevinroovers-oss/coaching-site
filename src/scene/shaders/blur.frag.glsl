// Separable 9-tap gaussian. Run twice (horizontal, then vertical) at quarter
// resolution — cheap enough to be free, soft enough for the bloom we want.

uniform sampler2D uTex;
uniform vec2 uTexel;    // 1 / resolution of the source
uniform vec2 uDirection; // (1,0) then (0,1)
varying vec2 vUv;

const float W0 = 0.2270270270;
const float W1 = 0.3162162162;
const float W2 = 0.0702702703;
const float O1 = 1.3846153846;
const float O2 = 3.2307692308;

void main() {
  vec2 d = uTexel * uDirection;
  vec3 c = texture2D(uTex, vUv).rgb * W0;
  c += texture2D(uTex, vUv + d * O1).rgb * W1;
  c += texture2D(uTex, vUv - d * O1).rgb * W1;
  c += texture2D(uTex, vUv + d * O2).rgb * W2;
  c += texture2D(uTex, vUv - d * O2).rgb * W2;
  gl_FragColor = vec4(c, 1.0);
}
