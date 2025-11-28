const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const wish = document.getElementById('wish');
const btn = document.getElementById('launch');
let W, H;
function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
addEventListener('resize', resize); resize();

const lanterns = [];
function Lantern(x,y, text){
  this.x = x; this.y = y; this.vx = (Math.random()-0.5)*0.4; this.vy = -1.2 - Math.random()*0.6;
  this.alpha = 1; this.text = text; this.size = 40 + Math.random()*12;
}
Lantern.prototype.update = function(dt){
  this.x += this.vx * dt;
  this.y += this.vy * dt;
  this.vx += (Math.random()-0.5)*0.001*dt;
  this.vy -= 0.0002*dt; // slight lift
  this.alpha = Math.max(0, this.alpha - 0.00006*dt);
}
Lantern.prototype.draw = function(ctx){
  ctx.save();
  ctx.globalAlpha = this.alpha;
  ctx.fillStyle = 'rgba(255,200,180,0.95)';
  ctx.beginPath();
  ctx.ellipse(this.x, this.y, this.size*0.8, this.size, 0,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#7a2a3a';
  ctx.font = `${Math.max(10, this.size/3)}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText(this.text, this.x, this.y+4);
  ctx.restore();
}

let last = performance.now();
function loop(t){
  const dt = t - last; last = t;
  ctx.clearRect(0,0,W,H);
  // sky gradient
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#ffdbe6'); g.addColorStop(1,'#4b2b4a');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  for (let i=0;i<lanterns.length;i++){
    const L = lanterns[i];
    L.update(dt);
    L.draw(ctx);
    if (L.alpha <= 0 || L.y + L.size < -50) lanterns.splice(i--,1);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

btn.addEventListener('click', () => {
  const text = (wish.value || '♥').slice(0,20);
  // spawn at bottom center
  const l = new Lantern(W/2 + (Math.random()-0.5)*120, H + 60, text);
  lanterns.push(l);
});
