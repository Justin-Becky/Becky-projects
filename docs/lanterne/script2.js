const c = document.getElementById('c2'); const ctx2 = c.getContext('2d');
function fit(){ c.width = innerWidth; c.height = innerHeight; } addEventListener('resize', fit); fit();

const particles = [];
function spawnLanterns(n, text){
  for(let i=0;i<n;i++){
    particles.push({
      x: innerWidth/2 + (Math.random()-0.5)*200,
      y: innerHeight + 80,
      vx: (Math.random()-0.5)*0.6,
      vy: -1.8 - Math.random()*0.9,
      size: 36 + Math.random()*28,
      life: 1,
      text
    });
  }
}

function step(dt){
  ctx2.clearRect(0,0,c.width,c.height);
  // sky
  const g = ctx2.createLinearGradient(0,0,c.width,c.height);
  g.addColorStop(0,'#ffdbe6'); g.addColorStop(1,'#151026');
  ctx2.fillStyle = g; ctx2.fillRect(0,0,c.width,c.height);

  for (let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    // environment: subtle wind field using sin + time
    const t = performance.now()/2000;
    const wind = Math.sin((p.y*0.002)+t) * 0.35;
    p.vx += wind * 0.002 * dt;
    p.vy += -0.0004 * dt; // slow lift
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= 0.00012 * dt;

    // draw glow
    const grad = ctx2.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size*1.8);
    grad.addColorStop(0, 'rgba(255,220,200,0.95)');
    grad.addColorStop(1, 'rgba(255,220,200,0)');
    ctx2.fillStyle = grad;
    ctx2.beginPath(); ctx2.arc(p.x, p.y, p.size*1.8, 0, Math.PI*2); ctx2.fill();

    // body
    ctx2.fillStyle = 'rgba(255,240,230,0.98)';
    ctx2.beginPath(); ctx2.ellipse(p.x, p.y, p.size*0.9, p.size, 0, 0, Math.PI*2); ctx2.fill();

    // text
    ctx2.fillStyle = '#6a2a3a';
    ctx2.font = `${Math.max(10, p.size/3)}px serif`;
    ctx2.textAlign = 'center';
    ctx2.fillText(p.text, p.x, p.y+4);

    if (p.life <= 0 || p.y < -200) particles.splice(i,1);
  }
  requestAnimationFrame(() => step(16));
}
step(16);

// UI
document.getElementById('launch2').addEventListener('click', () => {
  const t = (document.getElementById('wish2').value || '❤').slice(0,20);
  const n = parseInt(document.getElementById('count').value || 3, 10);
  spawnLanterns(n, t);
});
