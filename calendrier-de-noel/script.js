const days = document.querySelectorAll('.day');
const surpriseBox = document.getElementById('surprise');

// Tableau des surprises
const surprises = {
  1: "compteur/index.html",
  2: "🎁 t’emballer dans mes bras, c'est le meilleur de tous les cadeauz 👩‍❤️‍👨",
  3: "🎬 C'est enfin le temps d'écouter le Grinch🍿",
  4: "💜 Je t’aime plus chaque jour💜",
  5: "attrape-flocon/index.html",
  6: "🧣🌨️ Promets‑moi des promenades sous la neige, main dans la main. 🌨️🧣",
  7: "❄️🌟 Tu es mon miracle de Noël le plus doux. 🌟❄️",
  8: "casse-tete/index.html",
  9: "🎁 Je t’offre mon amour, emballé de mille étoiles. ✨",
  10: "🍪🎀 Préparons des biscuits et des souvenirs ensemble, aujourd’hui et toujours. 🎀🍪",
  11: "coupon/index.html",
  12: "🎄 Chaque instant avec toi est un cadeau précieux. 🎄",
  13: "lanterne/index.html",
  14: "🏠 Je veux décorer notre futur avec des sourires et des promesses. 💫",
  15: "🌟 Tu es mon plus beau cadeau.",
  16: "lettre/index.html",
  17: "recette/index.html",
  18: "⭐ Chaque étoile me rappelle un moment partagé avec toi. ⭐",
  19: "",
  20: "carte-de-noel/index.html",
  21: "",
  22: "😂 Ton rire est la plus belle chanson de Noël. 🎶",
  23: "sapin/index.html",
  24: "💜 Joyeux Noël Becky, avec tout mon amour – Justin."
};

days.forEach(day => {
  day.addEventListener('click', () => {
  const number = day.getAttribute('data-day');
  const message = surprises[number];
  if (number === "20" || number === "23" || number === "8" || number === "1" || number === "5" || number === "11" || number === "13" || number === "16" || number === "17") {
    // Ouvre la carte dans une nouvelle page
    window.open(message, "_blank");
  }
  else {
      if (surpriseBox.classList.contains('hidden')) {
    surpriseBox.textContent = message;
    surpriseBox.style.backgroundColor = '#ffffff';
    surpriseBox.classList.remove('hidden'); // affiche
    } else {
    surpriseBox.textContent = '';
    surpriseBox.style.backgroundColor = 'transparent';
    surpriseBox.classList.add('hidden'); // cache
    }
    }
    
});
});
