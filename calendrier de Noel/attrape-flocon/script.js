const game = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
let score = 0;

// Position de la souris
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Générer un flocon
function createFlake() {
  const flake = document.createElement('div');
  flake.classList.add('flake');
  flake.textContent = "❄️";
  flake.style.left = Math.floor(Math.random() * (window.innerWidth - 30)) + 'px';
  flake.style.top = '0px';
  game.appendChild(flake);

  let fall = setInterval(() => {
    let top = parseInt(flake.style.top || 0);
    if (top < window.innerHeight - 30) {
      flake.style.top = (top + 5) + 'px';
    } else {
      clearInterval(fall);
      flake.remove();
    }

    // Collision avec la souris (zone autour du curseur)
    const flakeRect = flake.getBoundingClientRect();
    if (
      mouseX >= flakeRect.left &&
      mouseX <= flakeRect.right &&
      mouseY >= flakeRect.top &&
      mouseY <= flakeRect.bottom
    ) {
      score++;
      scoreDisplay.textContent = "Score : " + score;
      clearInterval(fall);
      flake.remove();
    }
  }, 30);
}

// Flocons toutes les secondes
setInterval(createFlake, 250);
