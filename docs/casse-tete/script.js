// script.js - puzzle 3x3 responsive, mobile-friendly
// DÉTAILS: conserve pointer/touch/clavier/resize, + change d'image entre fleure.png et slush.jpg

const puzzle = document.getElementById('puzzle');
const shuffleBtn = document.getElementById('shuffle');

const ROWS = 3;
const COLS = 3;

let pieces = [];
let activePiece = null;
let pointerId = null;


// Images disponibles
const images = ['fleure.png', 'slush.jpg'];

// Choisir une image aléatoire et l’appliquer
function changePuzzleImage() {
  const chosen = images[Math.floor(Math.random() * images.length)];
  document.documentElement.style.setProperty('--img-src', `url('${chosen}')`);
}

// Récupère la valeur CSS --gap en pixels
function getGapPx() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--gap') || '0px';
  return parseInt(raw.trim(), 10) || 0;
}

// Construit les positions background-position
const positions = [];
function buildPositions() {
  positions.length = 0;
  const gap = getGapPx();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = ((c / (COLS - 1)) * 100).toFixed(6);
      const y = ((r / (ROWS - 1)) * 100).toFixed(6);
      const posX = gap ? `calc(${x}% + ${c * gap}px)` : `${x}%`;
      const posY = gap ? `calc(${y}% + ${r * gap}px)` : `${y}%`;
      positions.push(`${posX} ${posY}`);
    }
  }
}

// Crée les pièces
function createPieces() {
  puzzle.innerHTML = '';
  pieces = [];
  buildPositions();

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const piece = document.createElement('div');
      piece.className = 'piece';

      const index = row * COLS + col;
      const pos = positions[index];
      piece.style.backgroundPosition = pos;
      piece.setAttribute('data-correct', pos);
      piece.setAttribute('data-index', index);

      // Drag fallback (évite l’image fantôme)
      piece.draggable = true;
      piece.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', '');
      });

      // Pointer events
      piece.addEventListener('pointerdown', onPointerDown);
      piece.addEventListener('pointermove', onPointerMove);
      piece.addEventListener('pointerup', onPointerUp);
      piece.addEventListener('pointercancel', onPointerCancel);
      piece.addEventListener('pointerenter', onPointerEnter);
      piece.addEventListener('pointerleave', onPointerLeave);

      // Touch fallback (anciens iOS)
      piece.addEventListener('touchstart', onTouchStart, { passive: false });
      piece.addEventListener('touchmove', onTouchMove, { passive: false });
      piece.addEventListener('touchend', onTouchEnd);
      piece.addEventListener('touchcancel', onTouchCancel);

      // Accessibilité clavier : swap avec Enter/Space
      piece.tabIndex = 0;
      piece.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!activePiece) {
            activePiece = piece;
            piece.classList.add('dragging');
          } else if (activePiece === piece) {
            activePiece.classList.remove('dragging');
            activePiece = null;
          } else {
            swapBackgrounds(activePiece, piece);
            activePiece.classList.remove('dragging');
            activePiece = null;
            checkVictory();
          }
        }
      });

      puzzle.appendChild(piece);
      pieces.push(piece);
    }
  }
}

// Mélange les pièces (et évite un état déjà résolu)
function shufflePieces() {
  if (!pieces || pieces.length === 0) return;

  const vals = pieces.map(p => p.style.backgroundPosition);

  for (let i = vals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [vals[i], vals[j]] = [vals[j], vals[i]];
  }

  pieces.forEach((piece, i) => {
    piece.style.backgroundPosition = vals[i];
  });

  // Réessaye si par hasard le puzzle est parfait
  let attempts = 0;
  while (pieces.every(p => p.style.backgroundPosition === p.getAttribute('data-correct')) && attempts < 20) {
    for (let i = vals.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [vals[i], vals[j]] = [vals[j], vals[i]];
    }
    pieces.forEach((piece, i) => piece.style.backgroundPosition = vals[i]);
    attempts++;
  }
}

// Vérifie la victoire
function checkVictory() {
  return pieces.every(p => p.style.backgroundPosition === p.getAttribute('data-correct'));
}

// Swap deux pièces
function swapBackgrounds(a, b) {
  const tmp = b.style.backgroundPosition;
  b.style.backgroundPosition = a.style.backgroundPosition;
  a.style.backgroundPosition = tmp;
}

/* ---------------- Pointer-based drag & drop ---------------- */

function onPointerDown(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();
  if (pointerId !== null) return;

  pointerId = e.pointerId;
  this.setPointerCapture(pointerId);

  activePiece = this;
  activePiece.classList.add('dragging');

  const rect = activePiece.getBoundingClientRect();
  activePiece._startClientX = e.clientX;
  activePiece._startClientY = e.clientY;
  activePiece._startLeft = rect.left;
  activePiece._startTop = rect.top;

  activePiece.style.transformOrigin = 'center center';
  activePiece.style.zIndex = 999;
}

function onPointerMove(e) {
  if (!activePiece || e.pointerId !== pointerId) return;
  e.preventDefault();

  const dx = e.clientX - activePiece._startClientX;
  const dy = e.clientY - activePiece._startClientY;

  activePiece.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.04)`;
}

function onPointerUp(e) {
  if (e.pointerId !== pointerId) return;

  try { this.releasePointerCapture(pointerId); } catch (err) {}

  const wasHidden = activePiece.style.visibility;
  activePiece.style.visibility = 'hidden';
  const target = document.elementFromPoint(e.clientX, e.clientY);
  activePiece.style.visibility = wasHidden;

  activePiece.classList.remove('dragging');
  activePiece.style.transform = '';
  activePiece.style.zIndex = '';
  pointerId = null;

  pieces.forEach(p => p.classList.remove('drop-target'));

  if (target && target.classList && target.classList.contains('piece') && target !== activePiece) {
    swapBackgrounds(activePiece, target);
    checkVictory();
  }

  activePiece = null;
}

function onPointerCancel(e) {
  if (e.pointerId !== pointerId) return;
  if (activePiece) {
    try { activePiece.releasePointerCapture(pointerId); } catch (err) {}
    activePiece.classList.remove('dragging');
    activePiece.style.transform = '';
    activePiece.style.zIndex = '';
  }
  pieces.forEach(p => p.classList.remove('drop-target'));
  pointerId = null;
  activePiece = null;
}

function onPointerEnter(e) {
  if (activePiece && this !== activePiece) this.classList.add('drop-target');
}
function onPointerLeave(e) {
  if (this !== activePiece) this.classList.remove('drop-target');
}

/* ---------------- Touch fallback (anciens iOS) ---------------- */

function onTouchStart(e) {
  if (e.touches.length > 1) return;
  e.preventDefault();

  const touch = e.changedTouches[0];
  if (pointerId !== null) return;

  pointerId = touch.identifier;
  activePiece = this;
  activePiece.classList.add('dragging');

  const rect = activePiece.getBoundingClientRect();
  activePiece._startClientX = touch.clientX;
  activePiece._startClientY = touch.clientY;
  activePiece._startLeft = rect.left;
  activePiece._startTop = rect.top;

  activePiece.style.transformOrigin = 'center center';
  activePiece.style.zIndex = 999;
}

function onTouchMove(e) {
  if (!activePiece) return;
  let touch = null;
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === pointerId) {
      touch = e.changedTouches[i];
      break;
    }
  }
  if (!touch) return;
  e.preventDefault();

  const dx = touch.clientX - activePiece._startClientX;
  const dy = touch.clientY - activePiece._startClientY;

  activePiece.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.04)`;

  pieces.forEach(p => {
    if (p === activePiece) return;
    const r = p.getBoundingClientRect();
    if (touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom) {
      p.classList.add('drop-target');
    } else {
      p.classList.remove('drop-target');
    }
  });
}

function onTouchEnd(e) {
  let touch = null;
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === pointerId) {
      touch = e.changedTouches[i];
      break;
    }
  }
  if (!touch) return;

  const wasHidden = activePiece.style.visibility;
  activePiece.style.visibility = 'hidden';
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  activePiece.style.visibility = wasHidden;

  activePiece.classList.remove('dragging');
  activePiece.style.transform = '';
  activePiece.style.zIndex = '';
  pieces.forEach(p => p.classList.remove('drop-target'));
  pointerId = null;

  if (target && target.classList && target.classList.contains('piece') && target !== activePiece) {
    swapBackgrounds(activePiece, target);
    checkVictory();
  }

  activePiece = null;
}

function onTouchCancel(e) {
  if (!activePiece) return;
  activePiece.classList.remove('dragging');
  activePiece.style.transform = '';
  activePiece.style.zIndex = '';
  pieces.forEach(p => p.classList.remove('drop-target'));
  pointerId = null;
  activePiece = null;
}

/* ---------------- Resize (mise à jour des cibles) ---------------- */

let resizeTimer;
function onResize() {
  const vw = Math.max(window.innerWidth, window.innerHeight);
  const canvasPercent = vw > 1200 ? 350 : 300;
  document.documentElement.style.setProperty('--img-canvas-percent', canvasPercent + '%');

  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    buildPositions();
    pieces.forEach((piece, i) => {
      if (positions[i]) {
        piece.setAttribute('data-correct', positions[i]);
      }
    });
  }, 80);
}

/* ---------------- Initialisation ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Alimente les variables CSS
  document.documentElement.style.setProperty('--cols', COLS);
  document.documentElement.style.setProperty('--rows', ROWS);

  // Choisir une image au hasard au chargement
  changePuzzleImage();

  createPieces();
  shufflePieces();

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      shufflePieces();
      changePuzzleImage(); // change aussi l’image
    });
    shuffleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        shufflePieces();
        changePuzzleImage();
      }
    });
  }

  window.addEventListener('resize', onResize);
  onResize();
});
