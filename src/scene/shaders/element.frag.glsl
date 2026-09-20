// Element surface. One matte near-black material, lit by a soft studio pair,
// with a fresnel edge so elements separate from the off-white background
// without an outline, and a slow noise gradient so it is never flat.

#include noise.glsl

uniform vec3 uBase;    // near-black element colour
uniform vec3 uBg;      // background, used as the "light" end of the ramp
uniform vec3 uAccent;
uniform vec3 uKeyDir;
uniform vec3 uFillDir;
uniform float uTime;
uniform float uPulse;  // easter egg: heartbeat, 0..1

varying vec3 vNormal;
varying vec3 vWorld;
varying float vSeed;
varying float vHighlight;
varying float vDim;
varying float vAxis;

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);

  vec3 K = normalize(uKeyDir);
  vec3 F = normalize(uFillDir);

  // Wrapped diffuse: the shadow side lifts instead of crushing to black, which
  // is what makes it read as studio light rather than a hard CG lamp.
  float key = max(0.0, dot(N, K));
  float fill = max(0.0, dot(N, F));
  float wrap = dot(N, K) * 0.5 + 0.5;
  float light = 0.04 + key * 0.80 + fill * 0.22 + wrap * 0.14;

  // Fresnel edge — the single most important detail in the material.
  float fres = pow(1.0 - max(0.0, dot(N, V)), 3.4);

  // Surface gradient. Drifts extremely slowly; you only notice it if you stare.
  float g = noise3(vWorld * 0.38 + vec3(vSeed * 4.0, 0.0, uTime * 0.02));
  float grad = (g - 0.5) * 0.22;

  // Rods pick up a touch of falloff along their own length.
  float axis = 1.0 - abs(vAxis) * 0.35;

  // A rod is mostly edge-on to the camera, so an unshaped fresnel washes the
  // whole thing pale. Curve the ramp and keep the rim term small.
  float ramp = pow(clamp(light * axis + grad, 0.0, 1.0), 1.35);
  vec3 col = mix(uBase, uBg, ramp * 0.38);
  col = mix(col, uBg, fres * 0.3);

  // Accent, only where the interface asks for it, concentrated on the edge.
  float acc = vHighlight * (0.5 + fres * 0.5) + uPulse * 0.1;
  col = mix(col, uAccent, clamp(acc, 0.0, 1.0));

  // Dimmed elements recede into the background rather than turning grey.
  col = mix(col, uBg, vDim * 0.68);

  gl_FragColor = vec4(col, 1.0);
}
