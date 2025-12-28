const paper = document.getElementById('paper');

let startY = 0;
let moved = false;

paper.addEventListener('pointerdown', (e) => {
  startY = e.clientY || e.touches?.[0]?.clientY || 0;
  moved = false;
});

paper.addEventListener('pointermove', (e) => {
  const y = e.clientY || e.touches?.[0]?.clientY || 0;
  if (Math.abs(y - startY) > 10) {
    moved = true; // on considère que c’est un scroll
  }
});

paper.addEventListener('pointerup', () => {
  if (!moved) {
    paper.classList.toggle('open');
  }
});
