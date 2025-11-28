const btn = document.getElementById('toggle');
const textEl = document.getElementById('text');
const source = document.getElementById('source');
const letter = document.getElementById('letter');

let playing = false;
let charIndex = 0;
let timer = null;

// typing animation that reveals one character at a time and scrolls paper slightly
function typeStart() {
  const text = source.value || '';
  textEl.style.opacity = 1;
  charIndex = 0;
  textEl.textContent = '';
  const speed = 30;
  clearInterval(timer);
  timer = setInterval(() => {
    if (charIndex >= text.length) {
      clearInterval(timer);
      playing = false;
      return;
    }
    textEl.textContent += text[charIndex++];
    // gentle vertical movement to simulate unrolling
    const progress = charIndex / Math.max(1, text.length);
    letter.style.transform = `translateY(${ -40 * progress }px)`;
  }, speed);
}

btn.addEventListener('click', () => {
  if (playing) { clearInterval(timer); playing = false; letter.style.transform = ''; textEl.style.opacity = 0; return; }
  playing = true;
  typeStart();
});
