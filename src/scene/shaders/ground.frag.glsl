// The contact shadow.
//
// A real shadow map over a few hundred scattered rods gives you a field of
// little dashes, which reads as dirt rather than as light. So the floor is one
// soft elliptical pool instead: it grounds the swarm, scales with it, and costs
// a single transparent quad.

uniform float uOpacity;
uniform float uSoftness;
varying vec2 vUv;

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float d = length(p);
  float a = smoothstep(1.0, 0.0, d);
  a = pow(a, uSoftness) * uOpacity;
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
}
