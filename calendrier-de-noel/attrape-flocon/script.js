const game = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
let score = 0;

// Position du curseur ou du doigt
let posX = 0;
let posY = 0;

// Souris (ordinateur)
document.addEventListener('mousemove', e => {
  posX = e.clientX;
  posY = e.clientY;
});

// Tactile (mobile)
document.addEventListener('touchmove', e => {
  posX = e.touches[0].clientX;
  posY = e.touches[0].clientY;
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

    // Collision avec souris ou doigt
    const flakeRect = flake.getBoundingClientRect();
    if (
      posX >= flakeRect.left &&
      posX <= flakeRect.right &&
      posY >= flakeRect.top &&
      posY <= flakeRect.bottom
    ) {
      score++;
      scoreDisplay.textContent = "Score : " + score;
      clearInterval(fall);
      flake.remove();
    }
  }, 30);
}

// Flocons toutes les 300ms
setInterval(createFlake, 300);
