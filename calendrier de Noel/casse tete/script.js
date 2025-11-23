const puzzle = document.getElementById('puzzle');
const shuffleBtn = document.getElementById('shuffle');

const ROWS = 3, COLS = 3;
const positions = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    positions.push(`-${c*100}px -${r*100}px`);
  }
}

let pieces = [];
let dragged = null;

// Créer les pièces (une seule fois) avec position correcte
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    const pos = `-${col*100}px -${row*100}px`;
    piece.style.backgroundPosition = pos;
    piece.setAttribute('data-correct', pos);
    piece.draggable = true;

    // Drag & drop handlers
    piece.addEventListener('dragstart', () => { dragged = piece; });
    piece.addEventListener('dragover', (e) => { e.preventDefault(); });
    piece.addEventListener('drop', () => {
      if (dragged && dragged !== piece) {
        const temp = piece.style.backgroundPosition;
        piece.style.backgroundPosition = dragged.style.backgroundPosition;
        dragged.style.backgroundPosition = temp;
        checkVictory();
      }
    });

    puzzle.appendChild(piece);
    pieces.push(piece);
  }
}

// Fisher-Yates shuffle util
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mélanger les pièces (associe positions mélangées aux pièces)
// Assure que le puzzle n'est pas accidentellement résolu après le shuffle initial
function shufflePieces() {
  let attempts = 0;
  do {
    const shuffled = shuffleArray(positions);
    pieces.forEach((piece, i) => {
      piece.style.backgroundPosition = shuffled[i];
    });
    attempts++;
  } while (pieces.every(p => p.style.backgroundPosition === p.getAttribute('data-correct')) && attempts < 10);
}

// Événements UI
if (shuffleBtn) {
  shuffleBtn.addEventListener('click', shufflePieces);
}

// Mélange automatique au chargement (et garantit que la modale est masquée au départ)
document.addEventListener('DOMContentLoaded', () => {
  const v = document.getElementById('victory');
  if (v) v.classList.add('hidden');
  // si tu veux compter uniquement le shuffle manuel, commente la ligne suivante
  shufflePieces();
});



