const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const anim = document.getElementById('animation');

let currentIndex = 1; // commence à anim1.webp
const totalAnimations = 15;

yesBtn.addEventListener('click', () => {
  document.getElementById('app').innerHTML = `
    <h1>Je le savais, you still love me, je t'aime aussi mon amour 💕</h1>
    <div class="animation">
      <img id="anim" src="animation/8.webp" alt="Animation love" />
    </div>
  `;
  // ⚡ Re‑sélectionner l’image
  animation = document.getElementById('animation');
});


noBtn.addEventListener('click', () => {
  currentIndex++;
  if (currentIndex > totalAnimations) {
    currentIndex = 1;
  }
  animation.src = `animation/${currentIndex}.webp`;

  // Dimensions visibles de la fenêtre
  const maxX = window.innerWidth - noBtn.offsetWidth;
  const maxY = window.innerHeight - noBtn.offsetHeight;

  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);

  noBtn.style.position = "absolute";
  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;
});
