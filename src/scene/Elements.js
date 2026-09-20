import * as THREE from 'three';
import { FORMATIONS, TIMELINE, HUB_COUNT, EDGES, hash } from './formations.js';
import { damp, smoothstep, clamp } from '../motion/easing.js';
import elementVert from './shaders/element.vert.glsl';
import elementFrag from './shaders/element.frag.glsl';

// Two geometries, one material, two draw calls for the whole swarm.
//   rods  — thin capsule-ish cylinders, the "members" of a structure
//   nodes — small faceted spheres, the joints
// The rod's aspect ratio is baked into its geometry so every instance matrix
// carries a UNIFORM scale, which keeps normals correct without an inverse.

const TMP_Q = new THREE.Quaternion();
const TMP_V = new THREE.Vector3();
const TMP_UP = new THREE.Vector3(0, 1, 0);
const TMP_M = new THREE.Matrix4();
const TMP_S = new THREE.Vector3();
const TMP_P = new THREE.Vector3();

export class Elements {
  constructor({ count, quality }) {
    this.count = count;
    this.group = new THREE.Group();

    // --- per-element identity -------------------------------------------
    this.isNode = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      // The first six elements are the service hubs and must be nodes.
      this.isNode[i] = i < HUB_COUNT ? 1 : hash(i, 9) < 0.26 ? 1 : 0;
    }
    this.rodIdx = [];
    this.nodeIdx = [];
    for (let i = 0; i < count; i++) {
      (this.isNode[i] ? this.nodeIdx : this.rodIdx).push(i);
    }

    // --- state ------------------------------------------------------------
    this.pos = new Float32Array(count * 3);
    this.dir = new Float32Array(count * 3);
    this.scl = new Float32Array(count).fill(1);
    this.tPos = new Float32Array(count * 3);
    this.tDir = new Float32Array(count * 3);
    this.tScl = new Float32Array(count).fill(1);

    // Per-element scatter direction: where it flies while a formation breaks
    // apart. Fixed per element so the dissolve is reproducible, not mushy.
    this.scatter = new Float32Array(count * 3);
    this.order = new Float32Array(count); // stagger position within a transition
    this.seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = hash(i, 71) * Math.PI * 2;
      const b = Math.acos(2 * hash(i, 72) - 1);
      const m = 1.1 + hash(i, 73) * 1.9;
      this.scatter[i * 3] = Math.sin(b) * Math.cos(a) * m;
      this.scatter[i * 3 + 1] = Math.cos(b) * m * 0.8;
      this.scatter[i * 3 + 2] = Math.sin(b) * Math.sin(a) * m;
      this.order[i] = hash(i, 77);
      this.seed[i] = hash(i, 78);
    }

    this.highlight = new Float32Array(count);
    this.dim = new Float32Array(count);
    this.targetHighlight = new Float32Array(count);
    this.targetDim = new Float32Array(count);

    this.pulse = 0;          // easter egg heartbeat, 0..1
    this.mouse = new THREE.Vector3();
    this.mouseStrength = 0;  // 0 on touch / reduced motion

    this._buildMeshes(quality);
    this._scratch = { x: 0, y: 0, z: 0, dx: 0, dy: 0, dz: 0, s: 1 };
    this._scratchB = { x: 0, y: 0, z: 0, dx: 0, dy: 0, dz: 0, s: 1 };

    // Seed the state with the opening formation so the first frame is already
    // the hero image, not a pop.
    this.apply(0, 0);
    this.pos.set(this.tPos);
    this.dir.set(this.tDir);
    this.scl.set(this.tScl);
  }

  _buildMeshes(quality) {
    const segs = quality === 'low' ? 5 : 7;
    const rodGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.86, segs, 1);
    const nodeGeo = new THREE.IcosahedronGeometry(0.1, quality === 'low' ? 0 : 1);

    this.uniforms = {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uBase: { value: new THREE.Color(0x1a1a1a) },
      uBg: { value: new THREE.Color(0xf4f3f0) },
      uAccent: { value: new THREE.Color(0xae460c) },
      uKeyDir: { value: new THREE.Vector3(0.55, 0.78, 0.5) },
      uFillDir: { value: new THREE.Vector3(-0.7, 0.1, 0.55) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: elementVert,
      fragmentShader: elementFrag,
      uniforms: this.uniforms,
    });
    this.material = material;

    this.rods = new THREE.InstancedMesh(rodGeo, material, this.rodIdx.length);
    this.nodes = new THREE.InstancedMesh(nodeGeo, material, this.nodeIdx.length);

    for (const mesh of [this.rods, this.nodes]) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false; // the swarm is always on screen
      this.group.add(mesh);
    }

    // Per-instance attributes the shader reads.
    this._attrs = new Map();
    for (const [mesh, list] of [[this.rods, this.rodIdx], [this.nodes, this.nodeIdx]]) {
      const n = list.length;
      const aSeed = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
      const aHighlight = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
      const aDim = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
      aHighlight.setUsage(THREE.DynamicDrawUsage);
      aDim.setUsage(THREE.DynamicDrawUsage);
      for (let k = 0; k < n; k++) aSeed.array[k] = this.seed[list[k]];
      mesh.geometry.setAttribute('aSeed', aSeed);
      mesh.geometry.setAttribute('aHighlight', aHighlight);
      mesh.geometry.setAttribute('aDim', aDim);
      this._attrs.set(mesh, { aHighlight, aDim, list });
    }
  }

  // ---------------------------------------------------------------------
  // Formation blending.
  //
  // `progress` is 0..1 over the whole page. We find the two formations it sits
  // between, then move every element from one to the other with a per-element
  // stagger. The scatter term peaks halfway through, which is what makes the
  // structure fall apart before it reassembles — the transitions are the point,
  // not the formations.
  // ---------------------------------------------------------------------
  apply(progress, dt) {
    const tl = TIMELINE;
    let k = 0;
    while (k < tl.length - 2 && progress >= tl[k + 1].at) k++;
    const a = tl[k];
    const b = tl[Math.min(k + 1, tl.length - 1)];
    const span = Math.max(1e-4, b.at - a.at);
    const t = clamp((progress - a.at) / span);

    const fa = FORMATIONS[a.key];
    const fb = FORMATIONS[b.key];
    this.currentKey = t < 0.5 ? a.key : b.key;

    const SPREAD = 0.42; // how much of the transition is taken up by staggering
    const n = this.count;
    const oa = this._scratch;
    const ob = this._scratchB;

    for (let i = 0; i < n; i++) {
      fa.fn(i, n, oa);
      fb.fn(i, n, ob);

      // Per-element timing inside the transition.
      const ti = clamp((t - this.order[i] * SPREAD) / (1 - SPREAD));
      const s = smoothstep(ti);
      const w = Math.sin(Math.PI * ti); // 0 -> 1 -> 0, peaks mid-flight

      const i3 = i * 3;
      const sc = w * 1.05;
      this.tPos[i3] = oa.x + (ob.x - oa.x) * s + this.scatter[i3] * sc;
      this.tPos[i3 + 1] = oa.y + (ob.y - oa.y) * s + this.scatter[i3 + 1] * sc;
      this.tPos[i3 + 2] = oa.z + (ob.z - oa.z) * s + this.scatter[i3 + 2] * sc;

      // Direction tumbles while it flies, then settles into the new alignment.
      let dx = oa.dx + (ob.dx - oa.dx) * s + this.scatter[i3] * w * 0.9;
      let dy = oa.dy + (ob.dy - oa.dy) * s + this.scatter[i3 + 1] * w * 0.9;
      let dz = oa.dz + (ob.dz - oa.dz) * s + this.scatter[i3 + 2] * w * 0.9;
      const l = Math.hypot(dx, dy, dz) || 1;
      this.tDir[i3] = dx / l;
      this.tDir[i3 + 1] = dy / l;
      this.tDir[i3 + 2] = dz / l;

      // Elements shrink a little while they are loose, which reads as depth.
      this.tScl[i] = (oa.s + (ob.s - oa.s) * s) * (1 - w * 0.22);
    }

    this.driftAmount = fa.drift + (fb.drift - fa.drift) * smoothstep(t);
  }

  // Damp current state toward the target and write the instance matrices.
  update(time, dt) {
    const n = this.count;
    const lam = 7.5;      // how hard the swarm chases its target
    const drift = this.driftAmount * 0.3;
    const pulseScale = 1 + this.pulse * 0.14;
    const pulsePush = this.pulse * 0.28;

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const sd = this.seed[i] * 6.2831;

      // Slow idle drift. Amplitude follows how loose the formation is, so the
      // hero breathes and the closing ring is almost perfectly still.
      const nx = Math.sin(time * 0.31 + sd) * drift;
      const ny = Math.sin(time * 0.27 + sd * 1.7) * drift;
      const nz = Math.cos(time * 0.23 + sd * 2.3) * drift;

      let tx = this.tPos[i3] + nx;
      let ty = this.tPos[i3 + 1] + ny;
      let tz = this.tPos[i3 + 2] + nz;

      // Heartbeat easter egg: everything breathes outward from the centre.
      if (pulsePush > 0.001) {
        const r = Math.hypot(tx, ty, tz) || 1;
        tx += (tx / r) * pulsePush;
        ty += (ty / r) * pulsePush;
        tz += (tz / r) * pulsePush;
      }

      // Cursor repulsion. Deliberately weak — you should only notice it if you
      // go looking for it.
      if (this.mouseStrength > 0.001) {
        const ddx = tx - this.mouse.x;
        const ddy = ty - this.mouse.y;
        const ddz = tz - this.mouse.z;
        const d2 = ddx * ddx + ddy * ddy + ddz * ddz;
        const f = (this.mouseStrength * 2.4) / (1 + d2 * 0.55);
        const inv = 1 / (Math.sqrt(d2) || 1);
        tx += ddx * inv * f;
        ty += ddy * inv * f;
        tz += ddz * inv * f;
      }

      this.pos[i3] = damp(this.pos[i3], tx, lam, dt);
      this.pos[i3 + 1] = damp(this.pos[i3 + 1], ty, lam, dt);
      this.pos[i3 + 2] = damp(this.pos[i3 + 2], tz, lam, dt);

      this.dir[i3] = damp(this.dir[i3], this.tDir[i3], lam * 0.75, dt);
      this.dir[i3 + 1] = damp(this.dir[i3 + 1], this.tDir[i3 + 1], lam * 0.75, dt);
      this.dir[i3 + 2] = damp(this.dir[i3 + 2], this.tDir[i3 + 2], lam * 0.75, dt);

      this.scl[i] = damp(this.scl[i], this.tScl[i], lam, dt);

      this.highlight[i] = damp(this.highlight[i], this.targetHighlight[i], 9, dt);
      this.dim[i] = damp(this.dim[i], this.targetDim[i], 9, dt);
    }

    this._writeMatrices(pulseScale);
    this.uniforms.uTime.value = time;
    this.uniforms.uPulse.value = this.pulse;
  }

  _writeMatrices(pulseScale) {
    for (const mesh of [this.rods, this.nodes]) {
      const { aHighlight, aDim, list } = this._attrs.get(mesh);
      const arr = mesh.instanceMatrix.array;
      for (let k = 0; k < list.length; k++) {
        const i = list[k];
        const i3 = i * 3;
        TMP_V.set(this.dir[i3], this.dir[i3 + 1], this.dir[i3 + 2]);
        if (TMP_V.lengthSq() < 1e-8) TMP_V.set(0, 1, 0);
        TMP_V.normalize();
        TMP_Q.setFromUnitVectors(TMP_UP, TMP_V);
        const s = this.scl[i] * pulseScale;
        TMP_S.set(s, s, s);
        TMP_P.set(this.pos[i3], this.pos[i3 + 1], this.pos[i3 + 2]);
        TMP_M.compose(TMP_P, TMP_Q, TMP_S);
        TMP_M.toArray(arr, k * 16);
        aHighlight.array[k] = this.highlight[i];
        aDim.array[k] = this.dim[i];
      }
      mesh.instanceMatrix.needsUpdate = true;
      aHighlight.needsUpdate = true;
      aDim.needsUpdate = true;
    }
  }

  // Called by the service cards. `hub` is 0..5, or null to clear.
  setHighlight(hub) {
    this.targetHighlight.fill(0);
    this.targetDim.fill(0);
    if (hub === null || hub === undefined) return;
    for (let i = 0; i < this.count; i++) {
      if (i === hub) this.targetHighlight[i] = 1;
      else if (i < HUB_COUNT) this.targetDim[i] = 0.55;
      else this.targetDim[i] = 0.62;
    }
    // Members on an edge that touches this hub keep their full ink instead of
    // being tinted toward the accent — a part-way mix over a grey base reads as
    // muddy brown. The relationship shows as contrast, not as colour.
    for (let i = HUB_COUNT; i < this.count; i++) {
      if (this._touchesHub(i, hub)) this.targetDim[i] = 0;
    }
  }

  // A member element belongs to edge (i - HUB_COUNT) % EDGES.length — the same
  // rule the network formation uses to place it.
  _touchesHub(i, hub) {
    const e = EDGES[(i - HUB_COUNT) % EDGES.length];
    return e[0] === hub || e[1] === hub;
  }

  dispose() {
    this.rods.geometry.dispose();
    this.nodes.geometry.dispose();
    this.material.dispose();
  }
}
