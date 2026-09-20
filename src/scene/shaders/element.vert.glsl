// Vertex shader for every element in the scene (rods and nodes share it).
// Three.js injects `instanceMatrix` for an InstancedMesh, so all the per-element
// placement work already happened on the CPU in Elements.js.

attribute float aSeed;      // stable per-element randomness
attribute float aHighlight; // 0..1, raised when its service card is hovered
attribute float aDim;       // 0..1, how far this element steps back

uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewNormal; // needed for screen-space refraction
varying vec3 vWorld;
varying float vSeed;
varying float vHighlight;
varying float vDim;
varying float vAxis;

void main() {
  vSeed = aSeed;
  vHighlight = aHighlight;
  vDim = aDim;
  vAxis = position.y; // -0.5..0.5 along a rod, used for the length gradient

  vec4 instanced = instanceMatrix * vec4(position, 1.0);

  // A highlighted element leans toward the camera. Small on purpose: the eye
  // should register "that one" without seeing it jump.
  instanced.z += aHighlight * 0.5;

  vec4 world = modelMatrix * instanced;
  vWorld = world.xyz;

  // Instance scale is uniform (the rod's aspect is baked into its geometry),
  // so rotating the normal by the instance matrix is enough — no inverse needed.
  vec3 n = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vNormal = n;
  vViewNormal = normalize(mat3(viewMatrix) * n);

  gl_Position = projectionMatrix * viewMatrix * world;
}
