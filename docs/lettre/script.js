const paper = document.getElementById('paper');

function togglePaper() {
  paper.classList.toggle('open');
}

// Clic desktop
document.body.addEventListener('click', togglePaper);

// Tap mobile
document.body.addEventListener('touchstart', togglePaper);
