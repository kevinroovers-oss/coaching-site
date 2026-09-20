// Glass.
//
// Five things make a surface read as glass rather than as polished metal:
//   1. it lets what is behind it through, bent      (refraction)
//   2. it bends each colour a little differently    (dispersion)
//   3. it reflects its surroundings                 (environment)
//   4. it has one small hard highlight              (specular)
//   5. all of that gets stronger toward the edge    (fresnel)
//
// Point 3 is where the colour comes from, and it is the one that is easy to
// get wrong. Tinting each element its own hue turns the swarm into confetti;
// putting colour only on the rim is invisible on a rod four pixels wide. So
// the elements reflect a small procedural studio instead: warm above, cool
// below, one amber key and one teal fill. Elements pointing different ways
// catch different parts of it, which is exactly how real glass behaves — and
// it means the palette is four colours you can edit, not noise.
//
// Every dial is at the top of Elements.js.

#include noise.glsl

uniform vec3 uBase;    // the glass's own density colour
uniform vec3 uBg;      // background
uniform vec3 uAccent;
uniform vec3 uKeyDir;
uniform vec3 uFillDir;
uniform float uTime;
uniform float uPulse;  // easter egg: heartbeat, 0..1

// The reflected studio.
uniform vec3 uEnvHigh; // what the glass sees looking up
uniform vec3 uEnvLow;  // what it sees looking down
uniform vec3 uEnvKey;  // the warm light
uniform vec3 uEnvFill; // the cool one

uniform sampler2D uBackdrop; // blurred, low-res render of what is behind
uniform vec2 uResolution;
uniform float uRefraction;   // how far the backdrop lookup is displaced
uniform float uDispersion;   // how differently each channel is displaced
uniform float uIridescence;  // how much colour the glass carries overall
uniform float uTint;         // how much of its own density the glass keeps
uniform float uSpecular;

varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vWorld;
varying float vSeed;
varying float vHighlight;
varying float vDim;
varying float vAxis;

// Cosine palette (after Inigo Quilez): one smooth trip around the spectrum,
// no texture, no branching, and it never lands on a muddy colour.
vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

// The procedural studio the elements reflect. Two-band gradient plus two
// lights, which is all a convincing reflection needs at this scale.
vec3 environment(vec3 d, vec3 K, vec3 F) {
  float up = smoothstep(-0.7, 0.8, d.y);
  vec3 env = mix(uEnvLow, uEnvHigh, up);
  // Broad lobes on purpose. Narrow ones are physically tidier but most of the
  // surface then reflects the flat gradient and the whole swarm goes grey.
  env = mix(env, uEnvKey, pow(max(0.0, dot(d, K)), 2.2) * 1.0);
  env = mix(env, uEnvFill, pow(max(0.0, dot(d, F)), 1.8) * 0.9);
  return env;
}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 K = normalize(uKeyDir);
  vec3 F = normalize(uFillDir);

  float facing = max(0.0, dot(N, V));
  float fres = pow(1.0 - facing, 3.2);

  // --- 1 + 2. refraction with dispersion --------------------------------
  // Screen-space: displace the backdrop lookup along the surface normal as the
  // camera sees it, more steeply closer to the silhouette. Each channel gets
  // its own displacement, which is where glass's coloured edges come from.
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 off = vViewNormal.xy * uRefraction * (0.3 + fres * 1.6);
  vec3 refr;
  refr.r = texture2D(uBackdrop, uv - off * (1.0 + uDispersion)).r;
  refr.g = texture2D(uBackdrop, uv - off).g;
  refr.b = texture2D(uBackdrop, uv - off * (1.0 - uDispersion)).b;

  // How crowded it is behind this fragment: a dense cluster comes out foggy
  // and solid, a lone element stays almost clear.
  float behind = 1.0 - clamp(dot(refr, vec3(0.333)) / max(0.001, dot(uBg, vec3(0.333))), 0.0, 1.0);

  // --- lighting ----------------------------------------------------------
  float key = max(0.0, dot(N, K));
  float fill = max(0.0, dot(N, F));
  float light = 0.12 + key * 0.55 + fill * 0.25;

  // Slow gradient across the surface, so no two elements are ever identical.
  float g = noise3(vWorld * 0.38 + vec3(vSeed * 4.0, 0.0, uTime * 0.02));
  light += (g - 0.5) * 0.16;

  // --- 3. reflected environment ------------------------------------------
  // The reflection vector drifts very slowly with time, so a still scene is
  // never quite still — the same reason a real object never looks frozen.
  vec3 R = reflect(-V, N);
  R.xz += vec2(sin(uTime * 0.05 + vSeed * 6.28), cos(uTime * 0.04)) * 0.05;
  vec3 env = environment(normalize(R), K, F);

  // --- 4. specular -------------------------------------------------------
  // Tight and bright. This is what separates glass from matte plastic.
  vec3 H = normalize(K + V);
  float spec = pow(max(0.0, dot(N, H)), 44.0) * uSpecular * 1.5;
  float specFill = pow(max(0.0, dot(N, normalize(F + V))), 26.0) * uSpecular * 0.35;

  // --- put it together ---------------------------------------------------
  // Transmission, with absorption. Light crossing near the silhouette travels
  // further through the glass and comes out darker — that dark band just
  // inside the bright rim is the single most recognisable thing about glass on
  // a pale background, and without it a lone element vanishes into the page.
  float path = pow(1.0 - facing, 1.8);
  float absorb = clamp(uTint * (0.46 + behind * 0.34 + path * 0.78) * (1.1 - light * 0.45), 0.0, 1.0);
  vec3 trans = mix(refr, uBase, absorb);

  // Reflection takes over at the very edge, outside the dark band. This is the
  // Fresnel mix every transparent material is built on.
  float reflectivity = clamp(0.10 + fres * 0.95, 0.0, 0.92);
  vec3 col = mix(trans, env, reflectivity * (0.55 + uIridescence * 0.45));

  // The dispersion fringe. Wide enough to be visible on a rod a few pixels
  // across, which a true silhouette-only fringe never is.
  float fringe = pow(1.0 - facing, 3.6);
  vec3 sheen = spectrum(fres * 1.1 + vAxis * 0.3 + vSeed * 0.12 + uTime * 0.01);
  col = mix(col, sheen, fringe * uIridescence * 0.42);

  // Highlights stay mostly white — a coloured specular reads as a sticker —
  // but pick up a little of the environment they are reflecting.
  col += (spec + specFill) * mix(vec3(1.0), env * 1.4, 0.35);

  // Accent, only where the interface asks for it.
  float acc = vHighlight * (0.55 + fres * 0.45) + uPulse * 0.12;
  col = mix(col, uAccent, clamp(acc, 0.0, 1.0));

  // One global saturation dial at the very end. Averaging reflections over a
  // curved surface always pulls toward grey; this pushes back.
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(lum), col, 1.0 + uIridescence * 0.75);

  // Dimmed elements recede into the background rather than turning grey.
  col = mix(col, uBg, vDim * 0.72);

  gl_FragColor = vec4(col, 1.0);
}
