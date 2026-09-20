// Formations: where every element wants to be, per section.
//
// Each formation is a pure function (i, n, seedRng, out) that writes a target
// position, a target direction (rods are cylinders along +Y and get rotated to
// match) and a scale multiplier. Nothing here touches Three.js, so formations
// stay readable and easy to tune.
//
// The shared index space runs 0..n-1 across both rods and nodes, so a formation
// can reason about the whole swarm at once.

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

// Deterministic per-element randomness: same layout on every reload.
export function hash(i, salt = 0) {
  let x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function set(out, x, y, z, dx, dy, dz, s) {
  out.x = x; out.y = y; out.z = z;
  out.dx = dx; out.dy = dy; out.dz = dz;
  out.s = s;
  return out;
}

function normalise(out) {
  const l = Math.hypot(out.dx, out.dy, out.dz) || 1;
  out.dx /= l; out.dy /= l; out.dz /= l;
  return out;
}

// ---------------------------------------------------------------------------
// 1. DRIFT — hero. Loose parts. No order yet, but not noise either: a soft
//    shell so the silhouette still reads as one object from a distance.
// ---------------------------------------------------------------------------
function drift(i, n, out) {
  const a = hash(i, 1) * TAU;
  const b = Math.acos(2 * hash(i, 2) - 1);
  // Shell radii kept tight: the silhouette has to sit inside the frame with
  // air around it, or the hero reads as static instead of as loose parts.
  const r = 2.5 + Math.pow(hash(i, 3), 0.7) * 2.3;
  const x = Math.sin(b) * Math.cos(a) * r * 0.98;
  const y = Math.cos(b) * r * 0.86;
  const z = Math.sin(b) * Math.sin(a) * r * 0.95;
  return normalise(set(out, x, y, z,
    hash(i, 4) - 0.5, hash(i, 5) - 0.5, hash(i, 6) - 0.5,
    0.8 + hash(i, 7) * 0.55));
}

// ---------------------------------------------------------------------------
// 2. CLUSTER — about. The first time the parts hold together: a woven sphere.
//    Rods lie tangent to the surface so it reads as a weave, not a hedgehog.
// ---------------------------------------------------------------------------
function cluster(i, n, out) {
  const t = (i + 0.5) / n;
  const y = 1 - t * 2;
  const rad = Math.sqrt(Math.max(0, 1 - y * y));
  const th = GOLDEN * i;
  // Two shells, so the cluster has depth instead of being a hollow skin.
  const shell = i % 3 === 0 ? 1.55 : 2.55;
  const r = shell + hash(i, 11) * 0.22;
  const px = Math.cos(th) * rad * r;
  const py = y * r;
  const pz = Math.sin(th) * rad * r;
  // Tangent = cross(surface normal, world up), twisted a little per element.
  const tw = hash(i, 12) * TAU;
  return normalise(set(out, px, py, pz,
    -Math.sin(th) * Math.cos(tw) + Math.cos(tw * 0.5) * 0.15,
    Math.sin(tw) * 0.85,
    Math.cos(th) * Math.cos(tw),
    0.9 + hash(i, 13) * 0.35));
}

// ---------------------------------------------------------------------------
// 3. STRATA — principle one, "structure first". Horizontal layers. The most
//    architectural formation on the site: flat, level, deliberately rigid.
// ---------------------------------------------------------------------------
function strata(i, n, out) {
  const layers = 5;
  const l = i % layers;
  const k = Math.floor(i / layers);
  const per = Math.ceil(n / layers);
  const cols = Math.ceil(Math.sqrt(per) * 1.6);
  const cx = k % cols;
  const cz = Math.floor(k / cols);
  const rows = Math.ceil(per / cols);
  const x = (cx / Math.max(1, cols - 1) - 0.5) * 7.2 + (hash(i, 21) - 0.5) * 0.35;
  const z = (cz / Math.max(1, rows - 1) - 0.5) * 5.4 + (hash(i, 22) - 0.5) * 0.35;
  const y = (l - (layers - 1) / 2) * 1.3;
  // Rods lie flat, pointing along the layer, with a slight shear per level.
  return normalise(set(out, x, y, z,
    1, 0, (l - 2) * 0.12 + (hash(i, 23) - 0.5) * 0.1,
    0.75 + hash(i, 24) * 0.3));
}

// ---------------------------------------------------------------------------
// 4. ORBITS — principle two, "leaders who run it themselves". Four separate
//    centres, each holding its own ring. No single middle any more.
// ---------------------------------------------------------------------------
function orbits(i, n, out) {
  const centres = 4;
  const c = i % centres;
  const k = Math.floor(i / centres);
  const per = Math.ceil(n / centres);
  // Two by two rather than a row of four: a row is far too wide to sit beside
  // a column of text, and four rings on a ring of their own just overlap.
  const cxx = ((c % 2) - 0.5) * 3.7;
  const cyy = (Math.floor(c / 2) - 0.5) * -3.0;
  const czz = c % 2 === 0 ? 0.8 : -0.8;
  // Each centre gets two nested rings so it has a little mass of its own.
  const ringR = (k % 2 === 0 ? 0.85 : 1.3) + hash(i, 31) * 0.1;
  const a = (k / per) * TAU * 2 + c;
  const tilt = 0.35 + c * 0.12;
  const x = cxx + Math.cos(a) * ringR;
  const y = cyy + Math.sin(a) * ringR * Math.cos(tilt);
  const z = czz + Math.sin(a) * ringR * Math.sin(tilt);
  return normalise(set(out, x, y, z,
    -Math.sin(a), Math.cos(a) * Math.cos(tilt), Math.cos(a) * Math.sin(tilt),
    0.7 + hash(i, 32) * 0.28));
}

// ---------------------------------------------------------------------------
// 5. SPIRAL — principle three, "start with what works". One arm growing from
//    a dense core outward. Elements get larger as the arm opens up.
// ---------------------------------------------------------------------------
function spiral(i, n, out) {
  const t = (i % n) / n;
  const turns = 2.6;
  const a = t * TAU * turns;
  // One arm only. Two arms read as a fan from the front, which loses the idea.
  const r = 0.55 + Math.pow(t, 0.85) * 3.3;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  const y = (t - 0.5) * 4.6;
  // Tangent of the helix: around the axis, plus the climb.
  return normalise(set(out, x, y, z,
    -Math.sin(a) * r, 4.6 / (TAU * turns), Math.cos(a) * r,
    0.6 + t * 0.7));
}

// ---------------------------------------------------------------------------
// 6. NETWORK — services. Six hubs, one per service, connected by members.
//    Elements 0..5 ARE the hubs: the UI highlights them on card hover, which
//    is what makes the 2D/3D link tangible.
// ---------------------------------------------------------------------------
export const HUB_COUNT = 6;

// Hub anchor points, hand-placed so the graph reads clearly from the camera.
const HUBS = [
  [-3.7, 1.35, -0.4],
  [-1.7, -1.3, 0.75],
  [0.2, 1.75, 0.3],
  [2.0, -0.3, -0.7],
  [3.8, 1.1, 0.45],
  [0.9, -1.95, -0.15],
];
// Which hubs are wired to which. Every hub has at least two connections.
export const EDGES = [
  [0, 1], [0, 2], [1, 2], [1, 5], [2, 3], [3, 4], [3, 5], [2, 4], [4, 5], [0, 5],
];

function network(i, n, out) {
  if (i < HUB_COUNT) {
    const [x, y, z] = HUBS[i];
    return normalise(set(out, x, y, z, 0, 1, 0, 1.9));
  }
  const j = i - HUB_COUNT;
  const e = EDGES[j % EDGES.length];
  const step = Math.floor(j / EDGES.length);
  const perEdge = Math.ceil((n - HUB_COUNT) / EDGES.length);
  const [ax, ay, az] = HUBS[e[0]];
  const [bx, by, bz] = HUBS[e[1]];
  // Spread members along the edge, avoiding the hub itself at either end.
  const t = (step + 0.5 + (hash(i, 41) - 0.5) * 0.22) / perEdge;
  const tt = 0.1 + t * 0.8;
  const sag = Math.sin(tt * Math.PI) * 0.34; // gentle bow, so lines aren't dead straight
  const dx = bx - ax, dy = by - ay, dz = bz - az;
  return normalise(set(out,
    ax + dx * tt + (hash(i, 42) - 0.5) * 0.12,
    ay + dy * tt - sag,
    az + dz * tt + (hash(i, 43) - 0.5) * 0.12,
    dx, dy, dz,
    0.55 + hash(i, 44) * 0.2));
}

// ---------------------------------------------------------------------------
// 7. LATTICE — credentials. A plain upright grid. Quiet on purpose: this
//    section is a list, and the scene should not compete with it.
// ---------------------------------------------------------------------------
function lattice(i, n, out) {
  const rows = 4;
  const cols = Math.ceil(n / rows);
  const r = i % rows;
  const c = Math.floor(i / rows);
  const x = (c / Math.max(1, cols - 1) - 0.5) * 6.8;
  const y = (r - (rows - 1) / 2) * 1.5;
  const z = Math.sin(c * 0.6) * 0.5 - 0.3;
  return normalise(set(out, x, y, z, 0, 1, 0, 0.7 + hash(i, 51) * 0.2));
}

// ---------------------------------------------------------------------------
// 8. RING — contact. Everything on one circle, evenly spaced, tangent. The
//    only perfectly symmetrical formation. The camera pulls back and stops.
// ---------------------------------------------------------------------------
function ring(i, n, out) {
  const band = i % 2;
  const per = Math.ceil(n / 2);
  // Step around the circle with a stride co-prime to `per`, so consecutive
  // indices land far apart. Without this the nodes arrive in visible clumps.
  const k = (Math.floor(i / 2) * 37) % per;
  const a = (k / per) * TAU;
  const r = band === 0 ? 3.15 : 3.95;
  const x = Math.cos(a) * r;
  const y = Math.sin(a) * r;
  const z = band === 0 ? 0.35 : -0.35;
  return normalise(set(out, x, y, z, -Math.sin(a), Math.cos(a), 0,
    band === 0 ? 0.95 : 0.7));
}

// ---------------------------------------------------------------------------

export const FORMATIONS = {
  drift:   { fn: drift,   drift: 1.0,  looseness: 1.0 },
  cluster: { fn: cluster, drift: 0.42, looseness: 0.55 },
  strata:  { fn: strata,  drift: 0.16, looseness: 0.25 },
  orbits:  { fn: orbits,  drift: 0.3,  looseness: 0.4 },
  spiral:  { fn: spiral,  drift: 0.24, looseness: 0.35 },
  network: { fn: network, drift: 0.18, looseness: 0.3 },
  lattice: { fn: lattice, drift: 0.1,  looseness: 0.18 },
  ring:    { fn: ring,    drift: 0.05, looseness: 0.1 },
};

// The order the site walks through. `at` is scroll progress (0..1) of the
// whole page at which this formation is fully formed.
export const TIMELINE = [
  { key: 'drift',   at: 0.00, section: 'hero' },
  { key: 'cluster', at: 0.16, section: 'about' },
  { key: 'strata',  at: 0.31, section: 'principles' },
  { key: 'orbits',  at: 0.40, section: 'principles' },
  { key: 'spiral',  at: 0.49, section: 'principles' },
  { key: 'network', at: 0.66, section: 'services' },
  { key: 'lattice', at: 0.82, section: 'credentials' },
  { key: 'ring',    at: 0.96, section: 'contact' },
];
