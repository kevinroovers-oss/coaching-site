import * as THREE from 'three';
import { Elements } from './Elements.js';
import { Post } from './post.js';
import { TIMELINE } from './formations.js';
import { damp, smoothstep, clamp } from '../motion/easing.js';
import groundVert from './shaders/ground.vert.glsl';
import groundFrag from './shaders/ground.frag.glsl';

// Colour management is off on purpose: every surface on this site is lit by a
// shader we wrote ourselves, in display space. Letting three convert twice only
// makes the off-white drift.
THREE.ColorManagement.enabled = false;

// Camera and staging per formation.
//
// `group` moves the swarm sideways on wide screens so it sits opposite the text
// instead of behind it. On narrow screens it moves up instead, and `nScale`
// shrinks it to fit a portrait frame. On a wide screen the closing ring frames
// the contact details; a portrait frame cannot contain a block that tall, so
// there the ring sits above them like every other formation.
const VIEWS = {
  drift:   { cam: [0, 0.0, 16.5], look: [0, 0, 0],    group: [3.4, 0, 0],    rot: 0.00, nScale: 0.72, nY: 1.5 },
  cluster: { cam: [0, 0.2, 12.2], look: [0, 0, 0],    group: [3.0, 0, 0],    rot: 0.16, nScale: 0.82, nY: 2.85 },
  strata:  { cam: [0, 2.6, 13.2], look: [0, -0.7, 0], group: [2.9, -0.3, 0], rot: -0.20, nScale: 0.70, nY: 3.0 },
  orbits:  { cam: [0, 0.2, 12.6], look: [0, 0, 0],    group: [2.8, 0, 0],    rot: 0.26, nScale: 0.76, nY: 3.0 },
  spiral:  { cam: [0, 0.1, 14.0], look: [0, 0, 0],    group: [2.9, 0, 0],    rot: -0.10, nScale: 0.80, nY: 3.0 },
  steps:   { cam: [0, 0.0, 15.2], look: [0, 0, 0],    group: [2.5, 0, 0],    rot: 0.10, nScale: 0.74, nY: 3.0 },
  network: { cam: [0, 0.0, 14.5], look: [0, 0, 0],    group: [3.4, 0, 0],    rot: 0.05, nScale: 0.72, nY: 3.0 },
  lattice: { cam: [0, 0.0, 13.6], look: [0, 0, 0],    group: [2.9, 0, 0],    rot: 0.04, nScale: 0.74, nY: 3.0 },
  // The last view pulls back and stops. Nothing else happens after this.
  ring:    { cam: [0, 0.0, 18.5], look: [0, 0, 0],    group: [0, 0, 0],      rot: 0.00, nScale: 0.86, nY: 2.0 },
};

export class Scene {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.reducedMotion = !!options.reducedMotion;
    this.isTouch = !!options.isTouch;
    this.quality = options.quality || 'high';
    this.onFormation = options.onFormation || (() => {});

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.quality === 'high',
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0xf4f3f0, 1);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0, 16.5);

    this.elements = new Elements({
      count: options.count || (this.quality === 'high' ? 300 : 140),
      quality: this.quality,
      preset: options.glass,
    });
    this.scene.add(this.elements.group);

    this._buildGround();

    this.post = new Post(this.renderer, {
      background: 0xf4f3f0,
      // The glass throws colour of its own, so the bloom that used to be the
      // only saturated thing on screen now has plenty to catch. It earns less.
      bloom: 0.55,
      grain: 0.026,
      // Just enough to stop the corners from glaring. Any more and it reads as
      // an effect instead of as light.
      vignette: 0.13,
    });

    // --- driven state ---------------------------------------------------
    this.progress = 0;         // raw scroll progress, 0..1
    this.smoothProgress = 0;   // damped: the scene follows scroll, softly
    this.mouse = new THREE.Vector2();
    this.smoothMouse = new THREE.Vector2();
    this.pulse = 0;
    this.targetPulse = 0;
    this._heartbeatPhase = 0;
    this._camTarget = { pos: new THREE.Vector3(0, 0, 16.5), look: new THREE.Vector3() };
    this._lookAt = new THREE.Vector3();
    this._lastKey = null;
    this._time = 0;
    this._settle = 0;

    this.resize();
  }

  _buildGround() {
    // No lights and no shadow map in this scene: the elements are lit entirely
    // in their own shader, and the floor is the soft pool below.
    this.groundUniforms = {
      uOpacity: { value: 0.16 },
      uSoftness: { value: 2.6 },
    };
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader: groundVert,
        fragmentShader: groundFrag,
        uniforms: this.groundUniforms,
        transparent: true,
        depthWrite: false,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4.4;
    ground.scale.set(15, 9, 1);
    this.scene.add(ground);
    this.ground = ground;
  }

  // ---------------------------------------------------------------------

  setProgress(p) {
    this.progress = clamp(p);
    this._settle = 1.2;
  }

  setMouse(nx, ny) {
    if (this.isTouch || this.reducedMotion) return;
    this.mouse.set(nx, ny);
    this._settle = 1.2;
  }

  setHighlight(hub) {
    this.elements.setHighlight(hub);
    this._settle = 1.2;
  }

  setPulse(on) {
    this.targetPulse = on ? 1 : 0;
    this._settle = 1.2;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.narrow = w < 900;
    const dpr = Math.min(window.devicePixelRatio || 1, this.quality === 'high' ? 2 : 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Narrow screens need a wider lens or the formations crop badly.
    this.camera.fov = this.narrow ? 46 : 38;
    this.camera.updateProjectionMatrix();
    this.post.setSize(w, h, dpr);
    this.elements.uniforms.uResolution.value.set(
      Math.max(1, Math.floor(w * dpr)),
      Math.max(1, Math.floor(h * dpr))
    );
    this._settle = 1.2;
  }

  // Interpolate the staging between the two formations the scroll sits between.
  _view(progress) {
    const tl = TIMELINE;
    let k = 0;
    while (k < tl.length - 2 && progress >= tl[k + 1].at) k++;
    const a = VIEWS[tl[k].key];
    const b = VIEWS[tl[Math.min(k + 1, tl.length - 1)].key];
    const span = Math.max(1e-4, tl[Math.min(k + 1, tl.length - 1)].at - tl[k].at);
    const t = smoothstep(clamp((progress - tl[k].at) / span));

    const mix = (u, v) => u + (v - u) * t;
    const narrow = this.narrow;
    const zScale = narrow ? 1.15 : 1;
    return {
      camX: mix(a.cam[0], b.cam[0]),
      camY: mix(a.cam[1], b.cam[1]),
      camZ: mix(a.cam[2], b.cam[2]) * zScale,
      lookX: mix(a.look[0], b.look[0]),
      lookY: mix(a.look[1], b.look[1]),
      lookZ: mix(a.look[2], b.look[2]),
      // Narrow screens stack instead of sitting side by side: the scene rises
      // into the top of the viewport and the text takes the bottom.
      groupX: narrow ? 0 : mix(a.group[0], b.group[0]),
      groupY: (narrow ? mix(a.nY ?? 3.0, b.nY ?? 3.0) : 0) + mix(a.group[1], b.group[1]),
      scale: narrow ? mix(a.nScale ?? 1, b.nScale ?? 1) : 1,
      rot: mix(a.rot, b.rot),
    };
  }

  update(dt) {
    this._time += dt;
    const reduced = this.reducedMotion;

    // Scroll damping. This is what makes scrolling feel heavy: the scene never
    // arrives at the same moment the page does.
    this.smoothProgress = reduced
      ? this.progress
      : damp(this.smoothProgress, this.progress, 3.4, dt);

    this.elements.apply(this.smoothProgress, dt);

    if (this.elements.currentKey !== this._lastKey) {
      this._lastKey = this.elements.currentKey;
      this.onFormation(this._lastKey);
    }

    // Heartbeat easter egg: lub-dub, roughly 62 bpm.
    if (this.targetPulse > 0 || this.pulse > 0.001) {
      this._heartbeatPhase += dt * (62 / 60);
      const ph = this._heartbeatPhase % 1;
      const beat =
        Math.exp(-Math.pow((ph - 0.04) / 0.055, 2)) +
        0.62 * Math.exp(-Math.pow((ph - 0.24) / 0.07, 2));
      this.pulse = damp(this.pulse, this.targetPulse * beat, 24, dt);
    } else {
      this._heartbeatPhase = 0;
    }
    this.elements.pulse = reduced ? 0 : this.pulse;

    // Mouse: parallax on the camera, drift on the elements.
    if (!reduced && !this.isTouch) {
      this.smoothMouse.x = damp(this.smoothMouse.x, this.mouse.x, 2.6, dt);
      this.smoothMouse.y = damp(this.smoothMouse.y, this.mouse.y, 2.6, dt);
      this.elements.mouseStrength = 0.16;
      this.elements.mouse.set(
        this.smoothMouse.x * 6.5 - this.elements.group.position.x,
        this.smoothMouse.y * 3.6,
        2.5
      );
    } else {
      this.elements.mouseStrength = 0;
    }

    this.elements.update(this._time, dt);

    const v = this._view(this.smoothProgress);
    const px = v.camX + this.smoothMouse.x * 0.42;
    const py = v.camY + this.smoothMouse.y * 0.26;

    // The camera is damped harder than everything else, so it always arrives
    // last. That lag is most of the reason the motion reads as expensive.
    const camLambda = reduced ? 1e6 : 1.9;
    this.camera.position.x = damp(this.camera.position.x, px, camLambda, dt);
    this.camera.position.y = damp(this.camera.position.y, py, camLambda, dt);
    this.camera.position.z = damp(this.camera.position.z, v.camZ, camLambda, dt);
    this._lookAt.x = damp(this._lookAt.x, v.lookX, camLambda, dt);
    this._lookAt.y = damp(this._lookAt.y, v.lookY, camLambda, dt);
    this._lookAt.z = damp(this._lookAt.z, v.lookZ, camLambda, dt);
    this.camera.lookAt(this._lookAt);

    const g = this.elements.group;
    const gl = reduced ? 1e6 : 2.4;
    g.position.x = damp(g.position.x, v.groupX, gl, dt);
    g.position.y = damp(g.position.y, v.groupY, gl, dt);
    const gs = damp(g.scale.x, v.scale, gl, dt);
    g.scale.setScalar(gs);
    g.rotation.y = damp(g.rotation.y, v.rot + this.smoothMouse.x * 0.09, gl, dt);
    g.rotation.x = damp(g.rotation.x, this.smoothMouse.y * -0.05, gl, dt);

    // The contact pool travels with the swarm and fades out as the formation
    // tightens, so the closing ring floats free instead of sitting on a floor.
    this.ground.position.x = g.position.x;
    this.ground.position.z = g.position.z;
    this.groundUniforms.uOpacity.value = damp(
      this.groundUniforms.uOpacity.value,
      0.05 + this.elements.driftAmount * 0.14,
      2.2,
      dt
    );
  }

  render() {
    // The glass needs to know what is behind it before it can bend it, so the
    // swarm is drawn once cheaply into a small blurred buffer, then again for
    // real with that buffer bound. Two extra draw calls and two tiny blurs.
    this.ground.visible = false;
    this.elements.useBackdropMaterial(true);
    this.elements.uniforms.uBackdrop.value = this.post.renderBackdrop(this.scene, this.camera);
    this.elements.useBackdropMaterial(false);
    this.ground.visible = true;

    this.post.render(this.scene, this.camera, this._time);
  }

  // With reduced motion we stop running a loop and only redraw when something
  // actually changed, so the page costs nothing while it sits still.
  shouldRender(dt) {
    if (!this.reducedMotion) return true;
    this._settle -= dt;
    return this._settle > 0;
  }

  dispose() {
    this.elements.dispose();
    this.post.dispose();
    this.renderer.dispose();
  }
}
