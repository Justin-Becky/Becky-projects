document.getElementById('sendBtn').addEventListener('click', () => {
  const message = document.getElementById('message').value.trim();

  // Paramètres aléatoires
  const dur = (Math.random() * 4 + 6).toFixed(2) + 's';       // 6–10s
  const swayDur = (Math.random() * 2 + 3).toFixed(2) + 's';   // 3–5s
  const amp = Math.round(Math.random() * 15 + 10) + 'px';     // 10–25px
  const scale = (Math.random() * 0.6 + 0.7).toFixed(2);       // 0.7–1.3
  const startLeft = (Math.random() * 80 + 10).toFixed(2) + '%';

  // Conteneur extérieur (monte)
  const lanternWrapper = document.createElement('div');
  lanternWrapper.className = 'lantern-wrapper';
  lanternWrapper.style.left = startLeft;
  lanternWrapper.style.setProperty('--dur', dur);

  // Conteneur intérieur (oscille + taille variable)
  const motion = document.createElement('div');
  motion.className = 'lantern-motion';
  motion.style.setProperty('--amp', amp);
  motion.style.setProperty('--sway-dur', swayDur);
  motion.style.setProperty('--scale', scale);

  // Image
  const lanternImg = document.createElement('img');
  lanternImg.src = 'lanterne.png';
  lanternImg.className = 'lantern';

  // Ajoute le texte seulement si un message est écrit
  if (message) {
    const lanternText = document.createElement('div');
    lanternText.textContent = message;
    lanternText.className = 'lantern-text';
    motion.appendChild(lanternText);
  }

  // Assemblage
  motion.insertBefore(lanternImg, motion.firstChild);
  lanternWrapper.appendChild(motion);
  document.getElementById('lanternZone').appendChild(lanternWrapper);

  // Nettoyer le champ
  document.getElementById('message').value = '';
});
