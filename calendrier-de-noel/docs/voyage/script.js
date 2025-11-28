// Compte à rebours vers le départ du 13 janvier à 08:10 (heure locale de l'appareil).
// Construction robuste de la date pour iOS/Safari (évite les problèmes de parsing).
// Si ton départ est en 2026: change YEAR ci-dessous à 2026.
const YEAR = 2026; // mets 2026 si c'est janvier 2026, sinon 2025
const DEPART = new Date(YEAR, 0, 13, 8, 10, 0, 0); // Janvier = 0

const daysCountEl = document.getElementById('daysCount');
const metaTextEl = document.getElementById('metaText');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const departTextEl = document.getElementById('departText');

function formatDepart(d) {
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function updateCountdown() {
  const now = new Date();
  let diff = DEPART.getTime() - now.getTime();

  if (isNaN(DEPART.getTime())) {
    daysCountEl.textContent = "Erreur de date";
    metaTextEl.textContent = "Vérifie l'année dans script.js";
    return;
  }

  // Affiche la date cible en haut
  departTextEl.textContent = formatDepart(DEPART);

  if (diff <= 0) {
    daysCountEl.textContent = "C'est le grand départ !";
    metaTextEl.textContent = "Bon voyage 🌴✈️";
    daysEl.textContent = "0";
    hoursEl.textContent = "0";
    minutesEl.textContent = "0";
    secondsEl.textContent = "0";
    return;
  }

  const MS_SEC = 1000;
  const MS_MIN = MS_SEC * 60;
  const MS_HOUR = MS_MIN * 60;
  const MS_DAY = MS_HOUR * 24;

  const days = Math.floor(diff / MS_DAY);
  diff -= days * MS_DAY;

  const hours = Math.floor(diff / MS_HOUR);
  diff -= hours * MS_HOUR;

  const minutes = Math.floor(diff / MS_MIN);
  diff -= minutes * MS_MIN;

  const seconds = Math.floor(diff / MS_SEC);

  daysEl.textContent = String(days);
  hoursEl.textContent = String(hours);
  minutesEl.textContent = String(minutes);
  secondsEl.textContent = String(seconds);

  daysCountEl.textContent = `${days} jours`;
  metaTextEl.textContent = `Départ prévu le ${formatDepart(DEPART)}`;
}

// Lancement après chargement du DOM (grâce à defer dans index.html)
updateCountdown();
setInterval(updateCountdown, 1000);
