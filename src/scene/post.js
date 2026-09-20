import * as THREE from 'three';
import fullscreenVert from './shaders/fullscreen.vert.glsl';
import brightFrag from './shaders/brightpass.frag.glsl';
import blurFrag from './shaders/blur.frag.glsl';
import compositeFrag from './shaders/composite.frag.glsl';

// A hand-rolled post chain instead of three/examples/EffectComposer.
// Four small passes, no addon imports, and it keeps roughly 30 kB out of the
// bundle. Everything here is deliberately under the threshold of notice.

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
  constructor(renderer, { bloom = 0.85, grain = 0.028, vignette = 0.5 } = {}) {
    this.renderer = renderer;
    this.camera = new THREE.Camera(); // the fullscreen vert ignores it entirely

    const rtOpts = {
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
    };
    this.sceneTarget = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    this.bloomA = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, depthBuffer: false });
    this.bloomB = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, depthBuffer: false });

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
  }

  render(scene, camera, time) {
    const r = this.renderer;

    r.setRenderTarget(this.sceneTarget);
    r.clear();
    r.render(scene, camera);

    // Brightpass -> A
    r.setRenderTarget(this.bloomA);
    r.render(this.bright.scene, this.camera);

    // Blur horizontally A -> B
    this.blur.uniforms.uTex.value = this.bloomA.texture;
    this.blur.uniforms.uTexel.value.copy(this._bloomTexel);
    this.blur.uniforms.uDirection.value.set(1, 0);
    r.setRenderTarget(this.bloomB);
    r.render(this.blur.scene, this.camera);

    // Blur vertically B -> A, then keep A as the bloom source
    this.blur.uniforms.uTex.value = this.bloomB.texture;
    this.blur.uniforms.uDirection.value.set(0, 1);
    r.setRenderTarget(this.bloomA);
    r.render(this.blur.scene, this.camera);

    this.composite.uniforms.uBloom.value = this.bloomA.texture;
    this.composite.uniforms.uTime.value = time;
    r.setRenderTarget(null);
    r.render(this.composite.scene, this.camera);
  }

  dispose() {
    this.sceneTarget.dispose();
    this.bloomA.dispose();
    this.bloomB.dispose();
    this.bright.material.dispose();
    this.blur.material.dispose();
    this.composite.material.dispose();
  }
}
