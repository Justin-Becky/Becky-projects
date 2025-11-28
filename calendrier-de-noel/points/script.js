// script.js — version stable : la grosse sphère se transforme directement en texte

let scene, renderer, particles;
let cameraPersp, cameraOrtho, activeCamera;
let modeTexte = false;

const texte = "I Love you Becky";

init();

function init() {
  scene = new THREE.Scene();

  // Caméra perspective (sphère)
  cameraPersp = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  fitPerspectiveCameraToRadius(cameraPersp, Math.min(window.innerWidth, window.innerHeight) * 0.28, 1.15);

  // Caméra orthographique (texte)
  cameraOrtho = createOrthoCamera();
  activeCamera = cameraPersp;

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("scene"),
    antialias: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Particules
  const particleCount = 6000; // augmente si perf OK
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.28;
  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: "red",
    size: 1.2,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.95
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  setMaterialForCamera(false);

  animate();

  window.addEventListener("click", toggleMorph);
  window.addEventListener("resize", onResize);
}

function animate() {
  requestAnimationFrame(animate);
  if (!modeTexte) {
    particles.rotation.y += 0.002;
    particles.rotation.x += 0.001;
  }
  renderer.render(scene, activeCamera);
}

function onResize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  cameraPersp.aspect = window.innerWidth / window.innerHeight;
  cameraPersp.updateProjectionMatrix();

  cameraOrtho = createOrthoCamera();
  if (modeTexte) activeCamera = cameraOrtho;

  const newRadius = Math.min(window.innerWidth, window.innerHeight) * 0.28;
  fitPerspectiveCameraToRadius(cameraPersp, newRadius, 1.15);

  setMaterialForCamera(modeTexte);
}

function createOrthoCamera() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -1000, 1000);
  cam.position.set(0, 0, 10);
  cam.lookAt(0, 0, 0);
  cam.zoom = 1;
  cam.updateProjectionMatrix();
  return cam;
}

function toggleMorph() {
  if (!modeTexte) {
    morphToText();
    modeTexte = true;
  } else {
    morphToSphere();
    modeTexte = false;
  }
}

// Canevas texte DPI-aware, centré, sampling dense
function createTextPoints(text) {
  const cssW = Math.floor(window.innerWidth * 0.92);
  const cssH = Math.floor(window.innerHeight * 0.75);
  const DPR = Math.max(1, window.devicePixelRatio || 1);

  const canvas = document.createElement("canvas");
  canvas.width  = Math.max(1, Math.floor(cssW * DPR));
  canvas.height = Math.max(1, Math.floor(cssH * DPR));

  const ctx = canvas.getContext("2d");
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Taille de police pour tenir en largeur
  const targetW = cssW * 0.9;
  let low = 24, high = Math.floor(cssH * 0.8), fontSize = Math.floor(cssH * 0.5);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ctx.font = `bold ${mid}px Arial`;
    const w = ctx.measureText(text).width;
    if (w <= targetW) { fontSize = mid; low = mid + 1; } else { high = mid - 1; }
  }
  ctx.font = `bold ${fontSize}px Arial`;

  // Dessin centré
  ctx.fillText(text, cssW / 2, cssH / 2);

  // Sampling dense
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const base = [];
  const step = Math.max(1, Math.floor(1 * DPR));
  for (let yy = 0; yy < canvas.height; yy += step) {
    for (let xx = 0; xx < canvas.width; xx += step) {
      const idx = (yy * canvas.width + xx) * 4;
      if (img[idx + 3] > 128) {
        const x = xx / DPR - cssW / 2;
        const y = -(yy / DPR - cssH / 2);
        base.push([x, y]);
      }
    }
  }
  if (base.length === 0) base.push([0, 0]);
  return base;
}

function computeBoundsXY(pts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const x = pts[i][0], y = pts[i][1];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

function normalizeToViewportXY(pts, margin = 0.92) {
  const { minX, maxX, minY, maxY, width, height } = computeBoundsXY(pts);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const scaleW = (vpW * margin) / (width || 1);
  const scaleH = (vpH * margin) / (height || 1);
  const scale = Math.min(scaleW, scaleH);
  const out = new Array(pts.length);
  for (let i = 0; i < pts.length; i++) {
    out[i] = [(pts[i][0] - cx) * scale, (pts[i][1] - cy) * scale];
  }
  return { pts: out, scale };
}

// Mélange Fisher-Yates
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
}

// Construit la cible 1:1 pour toutes les particules (sans petits amas)
function buildFullTargetFromXY(normPts, positionsLength) {
  const particleCount = positionsLength / 3;
  const pts = normPts.slice(); // copie
  // S’assurer d’avoir au moins autant de points que de particules
  if (pts.length < particleCount) {
    // dupliquer avec légère dispersion progressive
    const baseLen = pts.length;
    const jitterMax = Math.max(1.5, Math.min(window.innerWidth, window.innerHeight) * 0.01);
    for (let i = 0; pts.length < particleCount; i++) {
      const b = pts[i % baseLen];
      const t = pts.length / particleCount;
      const r = jitterMax * (0.15 + 0.85 * t);
      const a = Math.random() * Math.PI * 2;
      const rad = Math.sqrt(Math.random()) * r;
      pts.push([b[0] + Math.cos(a) * rad, b[1] + Math.sin(a) * rad]);
    }
  }
  // Mélanger pour éviter clustering
  shuffleInPlace(pts);

  // Remplir Float32Array 1:1
  const full = new Float32Array(positionsLength);
  for (let i = 0; i < particleCount; i++) {
    const p = pts[i];
    const fi = i * 3;
    full[fi]     = p[0];
    full[fi + 1] = p[1];
    full[fi + 2] = 0;
  }
  return full;
}

function applyMorphInterpolated(targetFull, duration = 1.4) {
  const positions = particles.geometry.attributes.position.array;
  const start = new Float32Array(positions.length);
  start.set(positions);

  const obj = { t: 0 };
  gsap.killTweensOf(obj);
  gsap.to(obj, {
    t: 1,
    duration,
    ease: "power2.inOut",
    onUpdate: () => {
      const t = obj.t;
      for (let i = 0; i < positions.length; i++) {
        positions[i] = start[i] + (targetFull[i] - start[i]) * t;
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }
  });
}

function morphToText() {
  // 1) points texte (XY)
  const baseXY = createTextPoints(texte);
  // 2) normaliser au viewport
  const { pts: normXY, scale } = normalizeToViewportXY(baseXY, 0.92);

  // 3) ajuster caméra ortho si le texte est agrandi
  cameraOrtho = createOrthoCamera();
  cameraOrtho.zoom = (scale > 1) ? (1 / scale) : 1;
  cameraOrtho.updateProjectionMatrix();
  activeCamera = cameraOrtho;

  // 4) construire cible 1:1
  const targetFull = buildFullTargetFromXY(normXY, particles.geometry.attributes.position.array.length);

  // 5) material pour ortho
  setMaterialForCamera(true);

  // 6) morpher
  particles.rotation.set(0, 0, 0);
  applyMorphInterpolated(targetFull, 1.4);
}

function morphToSphere() {
  const positions = particles.geometry.attributes.position.array;
  const particleCount = positions.length / 3;
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.28;

  const target = new Float32Array(positions.length);
  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    target[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
    target[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    target[i * 3 + 2] = radius * Math.cos(phi);
  }

  activeCamera = cameraPersp;
  setMaterialForCamera(false);
  applyMorphInterpolated(target, 1.4);
}

function setMaterialForCamera(isOrtho) {
  const mat = particles.material;
  if (isOrtho) {
    mat.sizeAttenuation = false;
    mat.size = Math.max(1.0, window.innerWidth * 0.0025);
  } else {
    mat.sizeAttenuation = true;
    mat.size = Math.max(0.6, Math.min(2.2, window.innerWidth * 0.0012));
  }
  mat.needsUpdate = true;
}

function fitPerspectiveCameraToRadius(camera, radius, margin = 1.15) {
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const requiredDist = (radius * margin) / Math.tan(fov / 2);
  camera.position.z = requiredDist;
  camera.updateProjectionMatrix();
}
