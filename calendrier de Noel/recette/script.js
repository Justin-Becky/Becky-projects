const stepsData = [
  {title: 'Préchauffer le four', detail: '180°C — 10 min'},
  {title: 'Mélanger beurre et sucre', detail: '2 min'},
  {title: 'Ajouter œuf et vanille', detail: '1 min'},
  {title: 'Ajouter farine', detail: '30 sec'},
  {title: 'Façonner et enfourner', detail: '10-12 min'}
];

const steps = document.getElementById('steps');
stepsData.forEach((s, i) => {
  const el = document.createElement('div');
  el.className = 'step';
  el.innerHTML = `<div><div class="meta">${i+1}. ${s.title}</div><div class="sub">${s.detail}</div></div><div><button data-i="${i}">Fait</button></div>`;
  steps.appendChild(el);
});

steps.addEventListener('click', e => {
  if (e.target.matches('button')) {
    const card = e.target.closest('.step');
    card.classList.toggle('completed');
    e.target.textContent = card.classList.contains('completed') ? 'Annuler' : 'Fait';
  }
});

// Timer
let countdownTimer = null;
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const minsInput = document.getElementById('mins');
const display = document.getElementById('countdown');

function format(s){ return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }

startBtn.addEventListener('click', () => {
  clearInterval(countdownTimer);
  let total = Math.max(0, parseInt(minsInput.value || 0)) * 60;
  if (total === 0) { display.textContent = '00:00'; return; }
  display.textContent = format(total);
  countdownTimer = setInterval(() => {
    total--;
    display.textContent = format(total);
    if (total <= 0) { clearInterval(countdownTimer); navigator.vibrate?.(200); }
  }, 1000);
});
stopBtn.addEventListener('click', () => { clearInterval(countdownTimer); });
