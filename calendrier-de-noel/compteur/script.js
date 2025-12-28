// Compteur fixe — départ : 2024-06-07T11:30:00 (heure locale)
const START = new Date('2024-06-07T11:30:00');

const daysCountEl = document.getElementById('daysCount');
const metaTextEl = document.getElementById('metaText');
const yearsEl = document.getElementById('years');
const monthsEl = document.getElementById('months');
const weeksEl = document.getElementById('weeks');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');

// utilitaires
function diffMs(a, b){ return b.getTime() - a.getTime(); }

// calcule années tronquées et mois tronqués, puis semaines/jours/heures/minutes sur le reste
function computeParts(start, now){
  const s = new Date(start.getTime());
  const n = new Date(now.getTime());

  // années tronquées
  let years = n.getFullYear() - s.getFullYear();
  if (
    n.getMonth() < s.getMonth() ||
    (n.getMonth() === s.getMonth() && n.getDate() < s.getDate()) ||
    (n.getMonth() === s.getMonth() && n.getDate() === s.getDate() && n.getHours() < s.getHours()) ||
    (n.getMonth() === s.getMonth() && n.getDate() === s.getDate() && n.getHours() === s.getHours() && n.getMinutes() < s.getMinutes())
  ) {
    years -= 1;
  }

  const afterYears = new Date(s.getFullYear() + years, s.getMonth(), s.getDate(), s.getHours(), s.getMinutes(), s.getSeconds(), s.getMilliseconds());

  // mois tronqués
  let months = (n.getFullYear() - afterYears.getFullYear()) * 12 + (n.getMonth() - afterYears.getMonth());
  if (
    n.getDate() < afterYears.getDate() ||
    (n.getDate() === afterYears.getDate() && n.getHours() < afterYears.getHours()) ||
    (n.getDate() === afterYears.getDate() && n.getHours() === afterYears.getHours() && n.getMinutes() < afterYears.getMinutes())
  ) {
    months -= 1;
  }

  const afterMonths = new Date(afterYears.getFullYear(), afterYears.getMonth() + months, afterYears.getDate(), afterYears.getHours(), afterYears.getMinutes(), afterYears.getSeconds(), afterYears.getMilliseconds());

  // durée restante en ms
  let remainingMs = n.getTime() - afterMonths.getTime();
  if (remainingMs < 0) remainingMs = 0;

  const MS_MIN = 60 * 1000;
  const MS_HOUR = MS_MIN * 60;
  const MS_DAY = MS_HOUR * 24;
  const MS_WEEK = MS_DAY * 7;

  const weeks = Math.floor(remainingMs / MS_WEEK);
  remainingMs -= weeks * MS_WEEK;

  const days = Math.floor(remainingMs / MS_DAY);
  remainingMs -= days * MS_DAY;

  const hours = Math.floor(remainingMs / MS_HOUR);
  remainingMs -= hours * MS_HOUR;

  const minutes = Math.floor(remainingMs / MS_MIN);
  // remainingMs -= minutes * MS_MIN; // pas nécessaire

  return { years, months, weeks, days, hours, minutes };
}

function formatDateWithTime(d){
  return d.toLocaleString(undefined, { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

// mise à jour UI
function updateUI(){
  const now = new Date();
  const parts = computeParts(START, now);

  // total days depuis le départ (jours complets)
  const msPerDay = 24*60*60*1000;
  const totalDays = Math.floor((now.getTime() - START.getTime()) / msPerDay);

  yearsEl.textContent = parts.years;
  monthsEl.textContent = parts.months;
  weeksEl.textContent = parts.weeks;
  daysEl.textContent = parts.days;
  hoursEl.textContent = parts.hours;
  minutesEl.textContent = parts.minutes;

  daysCountEl.textContent = String(totalDays);
  metaTextEl.textContent = `${formatDateWithTime(START)} • ${totalDays} jour${totalDays>1?'s':''} ensemble`;
}

// initialisation
updateUI();
// rafraîchissement silencieux chaque minute pour garder les minutes à jour
setInterval(updateUI, 60_000);
