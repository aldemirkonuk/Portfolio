import * as THREE from 'three'
import { gsap } from 'gsap'

const PI2 = Math.PI / 2

/* Six face colors — earthy Rubik palette spec'd in the build doc */
const FACE_COLORS = {
  F: "#8FA888",  // sage         — CH.00 Entry
  R: "#C8A878",  // tan          — CH.01 Who
  U: "#E8E2D0",  // off-white    — CH.02 Work
  L: "#6B5A3F",  // warm brown   — CH.03 Craft
  D: "#B89540",  // muted mustard— CH.04 Contact
  B: "#2D4A3A",  // pine deep    — CH.05 GitHub
};

const FACE_LABELS = {
  F: "CH.00", R: "CH.01", U: "CH.02", L: "CH.03", D: "CH.04", B: "CH.05",
};

/* Chapter index → face key. Linear scroll order: Entry, Who, Work, Craft, Contact.
   GitHub (B) lives at index 5 for the "discover by reaching back" beat. */
const CHAPTER_TO_FACE = ["F", "R", "U", "L", "D", "B"];

/* Each face: orientation that brings it to camera (cubeGroup quaternion target). */
const FACE_PRESENT_EULER = {
  F: [0,  0,         0],
  R: [0, -PI2,       0],
  L: [0,  PI2,       0],
  U: [PI2, 0,        0],
  D: [-PI2, 0,       0],
  B: [0,  Math.PI,   0],
};

/* FIXED scramble sequence (5 moves, one per chapter transition).
   The cube boots in the solved state, then plays this scramble forward at
   load time so the user sees "the cube was perfect, now it isn't."
   Each chapter transition forward UNDOES one of these moves (in reverse
   order, so chapter 0→1 undoes the LAST scramble move, etc.). By the
   time the user reaches CH.05, all five moves are undone → cube is solved.

   Move chosen so each scrolled transition involves a different face. */
const SCRAMBLE_SEQUENCE = [
  { face: "U", dir:  1 },  // undone by transition 4→5
  { face: "R", dir: -1 },  // undone by transition 3→4
  { face: "F", dir:  1 },  // undone by transition 2→3
  { face: "L", dir: -1 },  // undone by transition 1→2
  { face: "D", dir:  1 },  // undone by transition 0→1
];

/* Helper: which scramble index does this transition consume/produce?
   Transition fromIdx → toIdx (assume |to-from|=1):
     forward  (to = from+1): undo SCRAMBLE_SEQUENCE[SCRAMBLE.length - to]
     backward (to = from-1): redo SCRAMBLE_SEQUENCE[SCRAMBLE.length - from]
*/
function scrambleMoveForTransition(fromIdx, toIdx) {
  const len = SCRAMBLE_SEQUENCE.length;
  if (toIdx > fromIdx) {
    const idx = len - toIdx;
    if (idx < 0 || idx >= len) return null;
    const m = SCRAMBLE_SEQUENCE[idx];
    return { face: m.face, dir: -m.dir };  // undo
  } else if (toIdx < fromIdx) {
    const idx = len - fromIdx;
    if (idx < 0 || idx >= len) return null;
    const m = SCRAMBLE_SEQUENCE[idx];
    return { face: m.face, dir: m.dir };   // redo
  }
  return null;
}

/* ─── helpers ──────────────────────────────────────────── */
function colorIsLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150;
}

function makeStickerTexture(color, label) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");

  // inner cubie body
  ctx.fillStyle = "#181612";
  ctx.fillRect(0, 0, 256, 256);

  // rounded sticker
  const pad = 18, w = 256 - pad * 2, r = 30;
  ctx.fillStyle = color;
  roundedRect(ctx, pad, pad, w, w, r);
  ctx.fill();

  // matte grain
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 240; i++) {
    const x = pad + Math.random() * w;
    const y = pad + Math.random() * w;
    ctx.fillStyle = Math.random() > 0.5
      ? "rgba(255,255,255,.6)"
      : "rgba(0,0,0,.6)";
    ctx.fillRect(x, y, 1.3, 1.3);
  }
  ctx.globalAlpha = 1;

  // subtle inset shadow on sticker
  const grad = ctx.createRadialGradient(128, 128, 60, 128, 128, 130);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,.18)");
  ctx.fillStyle = grad;
  roundedRect(ctx, pad, pad, w, w, r);
  ctx.fill();

  // label (center stickers only)
  if (label) {
    const isLight = colorIsLight(color);
    ctx.fillStyle = isLight ? "rgba(27,60,48,.85)" : "rgba(237,234,224,.94)";
    ctx.font = '500 36px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 128, 134);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* axis config per face */
const FACE_AXIS = {
  R: { axis: "x", layer:  1, sense:  1 },
  L: { axis: "x", layer: -1, sense: -1 },
  U: { axis: "y", layer:  1, sense:  1 },
  D: { axis: "y", layer: -1, sense: -1 },
  F: { axis: "z", layer:  1, sense:  1 },
  B: { axis: "z", layer: -1, sense: -1 },
};

/* ─── RubikCube class ─────────────────────────────────── */
class RubikCube {
  constructor(canvas) {
    this.canvas = canvas;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting — soft top key, gentle ambient
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const key = new THREE.DirectionalLight(0xffffff, 0.55);
    key.position.set(3, 6, 4);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8b890, 0.18);
    fill.position.set(-4, -2, 2);
    this.scene.add(fill);

    this.cubeGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);

    this.cubies = [];
    this.buildCube();

    this.busy = false;        // a tween is running (twist OR reorient)
    this.activeTween = null;
    this.idleTween = null;    // breathe loop scale

    // baseline scale that "looks right" — the spec calls for ~0.34 viewport
    // but we let the renderer fill its host and tune scale here
    this.baseScale = 1.0;
    this.cubeGroup.scale.setScalar(this.baseScale);

    this.resize();
    this._onResize = () => this.resize();
    window.addEventListener("resize", this._onResize);

    this._animate = this._animate.bind(this);
    this._animate();
  }

  /* ── geometry ────────────────────────────── */
  buildCube() {
    const size = 0.94;
    const geo = new THREE.BoxGeometry(size, size, size);
    // a tiny outer bevel via slight edge highlight (cheap)
    const innerMat = new THREE.MeshLambertMaterial({ color: 0x161412 });

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // BoxGeometry material order: [+X, -X, +Y, -Y, +Z, -Z]
          const mats = [
            this._stickerMat("R", x ===  1, [y, z], innerMat),
            this._stickerMat("L", x === -1, [y, z], innerMat),
            this._stickerMat("U", y ===  1, [x, z], innerMat),
            this._stickerMat("D", y === -1, [x, z], innerMat),
            this._stickerMat("F", z ===  1, [x, y], innerMat),
            this._stickerMat("B", z === -1, [x, y], innerMat),
          ];
          const m = new THREE.Mesh(geo, mats);
          m.position.set(x, y, z);
          this.cubies.push(m);
          this.cubeGroup.add(m);
        }
      }
    }
  }

  _stickerMat(face, isOuter, otherCoords, innerMat) {
    if (!isOuter) return innerMat;
    const isCenter = otherCoords[0] === 0 && otherCoords[1] === 0;
    const label = isCenter ? FACE_LABELS[face] : null;
    return new THREE.MeshLambertMaterial({
      map: makeStickerTexture(FACE_COLORS[face], label),
    });
  }

  /* ── render loop + sizing ────────────────── */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.renderer.setSize(rect.width, rect.height, false);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
  }

  _animate() {
    this._raf = requestAnimationFrame(this._animate);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener("resize", this._onResize);
  }

  /* ── twist mechanics ─────────────────────── */
  /* dir: +1 = CW looking down the face's outward normal; -1 = CCW
     dir is multiplied by the face's "sense" so notation behaves like
     real Rubik's regardless of which axis it's on. */
  twist(face, dir = 1, duration = 0.9, ease = "back.inOut(1.4)") {
    if (this.busy) return Promise.resolve();
    const cfg = FACE_AXIS[face];
    if (!cfg) return Promise.resolve();

    const targetAngle = PI2 * dir * cfg.sense;
    const layerCubies = this.cubies.filter(
      (c) => Math.round(c.position[cfg.axis]) === cfg.layer
    );

    // Re-parent the 9 cubies under a temporary pivot, animate that pivot.
    const pivot = new THREE.Group();
    this.cubeGroup.add(pivot);
    layerCubies.forEach((c) => pivot.attach(c));

    this.busy = true;
    return new Promise((resolve) => {
      this.activeTween = gsap.to(pivot.rotation, {
        [cfg.axis]: targetAngle,
        duration,
        ease,
        onComplete: () => {
          // Bake transform back into cubies, snap their grid positions,
          // and dispose the pivot. After this the layer membership query
          // (Math.round(position[axis])) keeps working.
          layerCubies.forEach((c) => this.cubeGroup.attach(c));
          this.cubeGroup.remove(pivot);
          layerCubies.forEach((c) => {
            c.position.x = Math.round(c.position.x);
            c.position.y = Math.round(c.position.y);
            c.position.z = Math.round(c.position.z);
          });
          this.busy = false;
          this.activeTween = null;
          resolve();
        },
      });
    });
  }

  /* Apply a twist *instantly* (zero-duration) — used for scrambling so the
     user only sees the final scrambled state, then watches it solve. */
  applyInstant(face, dir) {
    const cfg = FACE_AXIS[face];
    if (!cfg) return;
    const targetAngle = PI2 * dir * cfg.sense;
    const layerCubies = this.cubies.filter(
      (c) => Math.round(c.position[cfg.axis]) === cfg.layer
    );
    const pivot = new THREE.Group();
    this.cubeGroup.add(pivot);
    layerCubies.forEach((c) => pivot.attach(c));
    pivot.rotation[cfg.axis] = targetAngle;
    pivot.updateMatrixWorld(true);
    layerCubies.forEach((c) => this.cubeGroup.attach(c));
    this.cubeGroup.remove(pivot);
    layerCubies.forEach((c) => {
      c.position.x = Math.round(c.position.x);
      c.position.y = Math.round(c.position.y);
      c.position.z = Math.round(c.position.z);
    });
  }

  /* ── scripted scramble + solve ───────────── */

  /* Apply the fixed scramble instantly (no animation) — used in the rare
     case we need to boot already-scrambled (e.g. reduced motion). */
  applyScrambleInstant() {
    SCRAMBLE_SEQUENCE.forEach((m) => this.applyInstant(m.face, m.dir));
  }

  /* Animated boot sequence: cube starts solved, then plays the scramble
     forward at a sharp pace so the user perceives a deliberate scramble. */
  async animatedScramble(durationPerMove = 0.32, ease = "back.inOut(1.4)") {
    for (let i = 0; i < SCRAMBLE_SEQUENCE.length; i++) {
      const { face, dir } = SCRAMBLE_SEQUENCE[i];
      await this.twist(face, dir, durationPerMove, ease);
    }
  }

  /* ── whole-cube reorient (Phase B) ───────── */
  reorient(face, duration = 0.85, ease = "back.inOut(1.4)") {
    const [ex, ey, ez] = FACE_PRESENT_EULER[face];
    const target = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(ex, ey, ez, "XYZ")
    );
    const start = this.cubeGroup.quaternion.clone();

    return new Promise((resolve) => {
      const obj = { t: 0 };
      gsap.to(obj, {
        t: 1,
        duration,
        ease,
        onUpdate: () => {
          this.cubeGroup.quaternion.copy(start).slerp(target, obj.t);
        },
        onComplete: () => {
          this.cubeGroup.quaternion.copy(target);
          resolve();
        },
      });
    });
  }

  /* ── breathe loop while idle ─────────────── */
  startBreathing() {
    if (this.idleTween) return;
    this.idleTween = gsap.to(this.cubeGroup.scale, {
      x: this.baseScale * 1.022,
      y: this.baseScale * 1.022,
      z: this.baseScale * 1.022,
      duration: 1.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }
  stopBreathing() {
    if (!this.idleTween) return;
    this.idleTween.kill();
    this.idleTween = null;
    this.cubeGroup.scale.setScalar(this.baseScale);
  }

  /* ── full chapter transition (twist[s] + reorient) ────────────
     Plays the layer twist(s) for fromIdx → toIdx, then a single
     final reorient. Durations are tweakable via opts so the scroll
     queue can speed up when the user is many chapters behind. */
  async goToChapter(fromIdx, toIdx, opts = {}) {
    if (fromIdx === toIdx) return;
    const twistDur    = opts.twistDur    ?? 0.75;
    const reorientDur = opts.reorientDur ?? 0.65;
    const ease        = opts.ease        ?? "back.inOut(1.4)";
    this.stopBreathing();

    const step = toIdx > fromIdx ? 1 : -1;
    let cur = fromIdx;
    while (cur !== toIdx) {
      const next = cur + step;
      const m = scrambleMoveForTransition(cur, next);
      if (m) {
        await this.twist(m.face, m.dir, twistDur, ease);
      }
      cur = next;
    }

    await this.reorient(CHAPTER_TO_FACE[toIdx], reorientDur, ease);
    this.startBreathing();
  }
}

export { RubikCube, FACE_COLORS, FACE_LABELS, CHAPTER_TO_FACE }
