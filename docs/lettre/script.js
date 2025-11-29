const paper = document.getElementById('paper');

function togglePaper() {
  paper.classList.toggle('open');
}

// Un seul événement, universel
paper.addEventListener('pointerdown', () => {
  // toggle uniquement si on n’est pas déjà en train de scroller
  if (!paper.classList.contains('open')) {
    togglePaper();
  }
});
