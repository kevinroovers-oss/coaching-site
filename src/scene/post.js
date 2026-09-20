import * as THREE from 'three';
import fullscreenVert from './shaders/fullscreen.vert.glsl';
import brightFrag from './shaders/brightpass.frag.glsl';
import blurFrag from './shaders/blur.frag.glsl';
import compositeFrag from './shaders/composite.frag.glsl';

// A hand-rolled post chain instead of three/examples/EffectComposer.
// Small passes, no addon imports, and it keeps roughly 30 kB out of the bundle.
// Everything here is deliberately under the threshold of notice.
//
// It also owns the backdrop buffer the glass material refracts: a blurred,
// low-resolution render of the swarm that tells each element roughly how much
// matter is behind it.

const QUAD = new THREE.PlaneGeometry(2, 2);

function pass(fragmentShader, uniforms) {
  const material = new THREE.ShaderMaterial({
    vertexShader: fullscreenVert,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(QUAD, material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  return { scene, material, uniforms };
}

export class Post {
  constructor(renderer, { bloom = 0.85, grain = 0.028, vignette = 0.5, background = 0xf4f3f0 } = {}) {
    this.renderer = renderer;
    this.camera = new THREE.Camera(); // the fullscreen vert ignores it entirely
    this.background = new THREE.Color(background);

    const rtOpts = {
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
    };
    this.sceneTarget = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    this.bloomA = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, depthBuffer: false });
    this.bloomB = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, depthBuffer: false });

    // Backdrop: eighth-resolution, then blurred twice. It is never seen
    // directly, only sampled, so it can be very small and very soft.
    this.backdropA = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    this.backdropB = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, depthBuffer: false });

    this.bright = pass(brightFrag, { uScene: { value: this.sceneTarget.texture } });
    this.blur = pass(blurFrag, {
      uTex: { value: null },
      uTexel: { value: new THREE.Vector2() },
      uDirection: { value: new THREE.Vector2(1, 0) },
    });
    this.composite = pass(compositeFrag, {
      uScene: { value: this.sceneTarget.texture },
      uBloom: { value: this.bloomB.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uBloomStrength: { value: bloom },
      uGrain: { value: grain },
      uVignette: { value: vignette },
    });
  }

  setSize(width, height, pixelRatio) {
    const w = Math.max(1, Math.floor(width * pixelRatio));
    const h = Math.max(1, Math.floor(height * pixelRatio));
    this.sceneTarget.setSize(w, h);
    // Bloom runs at a quarter of each axis: sixteen times fewer pixels, and the
    // blur is wide enough that nobody can tell.
    const bw = Math.max(1, Math.floor(w / 4));
    const bh = Math.max(1, Math.floor(h / 4));
    this.bloomA.setSize(bw, bh);
    this.bloomB.setSize(bw, bh);
    this.composite.uniforms.uResolution.value.set(w, h);
    this._bloomTexel = new THREE.Vector2(1 / bw, 1 / bh);

    const dw = Math.max(1, Math.floor(w / 8));
    const dh = Math.max(1, Math.floor(h / 8));
    this.backdropA.setSize(dw, dh);
    this.backdropB.setSize(dw, dh);
    this._backdropTexel = new THREE.Vector2(1 / dw, 1 / dh);
  }

  // One separable blur step. `dir` is (1,0) or (0,1).
  _blurStep(sourceTexture, texel, target, dx, dy) {
    this.blur.uniforms.uTex.value = sourceTexture;
    this.blur.uniforms.uTexel.value.copy(texel);
    this.blur.uniforms.uDirection.value.set(dx, dy);
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.blur.scene, this.camera);
  }

  // Renders the scene small and soft. The glass material samples the result to
  // work out what is behind it — dense parts of the swarm read as foggy, lone
  // elements stay clear. Returns the texture to bind.
  renderBackdrop(scene, camera) {
    const r = this.renderer;
    r.setRenderTarget(this.backdropA);
    r.setClearColor(this.background, 1);
    r.clear();
    r.render(scene, camera);
    // Two wide steps: the softness is the point, not the detail.
    this._blurStep(this.backdropA.texture, this._backdropTexel, this.backdropB, 1, 0);
    this._blurStep(this.backdropB.texture, this._backdropTexel, this.backdropA, 0, 1);
    return this.backdropA.texture;
  }

  render(scene, camera, time) {
    const r = this.renderer;

    r.setRenderTarget(this.sceneTarget);
    r.clear();
    r.render(scene, camera);

    // Brightpass -> A
    r.setRenderTarget(this.bloomA);
    r.render(this.bright.scene, this.camera);

    // Blur horizontally A -> B, then vertically B -> A
    this._blurStep(this.bloomA.texture, this._bloomTexel, this.bloomB, 1, 0);
    this._blurStep(this.bloomB.texture, this._bloomTexel, this.bloomA, 0, 1);

    this.composite.uniforms.uBloom.value = this.bloomA.texture;
    this.composite.uniforms.uTime.value = time;
    r.setRenderTarget(null);
    r.render(this.composite.scene, this.camera);
  }

  dispose() {
    this.sceneTarget.dispose();
    this.bloomA.dispose();
    this.bloomB.dispose();
    this.backdropA.dispose();
    this.backdropB.dispose();
    this.bright.material.dispose();
    this.blur.material.dispose();
    this.composite.material.dispose();
  }
}
