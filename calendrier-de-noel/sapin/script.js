const workarea = document.getElementById('workarea');
const addButtons = [...document.querySelectorAll('[data-add]')];
const colorButtons = [...document.querySelectorAll('.color')];
const clearBtn = document.getElementById('clear');

let currentColor = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim();
let selected = null;

/* couleurs */
colorButtons.forEach(b=>b.addEventListener('click',()=>{
  currentColor = getComputedStyle(b).backgroundColor;
  colorButtons.forEach(x=>x.style.outline='none');
  b.style.outline = '2px solid rgba(255,255,255,.5)';
}));

/* ajout */
addButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const type = btn.dataset.add;
    const el = createItem(type, currentColor);
    workarea.appendChild(el);
    center(el);
    select(el);
  });
});

/* tout supprimer */
clearBtn.addEventListener('click', ()=>{
  [...workarea.querySelectorAll('.item')].forEach(e=>e.remove());
  deselect();
});

/* clic sur zone vide = désélection */
workarea.addEventListener('pointerdown', (e)=>{
  if(!e.target.closest('.item')) deselect();
});

/* backspace suppr */
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Backspace' && selected && selected.el && document.body.contains(selected.el)){
    e.preventDefault();
    selected.el.remove();
    deselect();
  }
});

/* création d'un élément */
function createItem(type, color){
  const el = document.createElement('div');
  el.className = `item ${type}`;
  el.style.setProperty('--c', color);
  el.style.setProperty('--thick', '1'); // valeur relative (1 = base)

  if(type === 'boule'){
    el.innerHTML = `<div class="cap"></div><div class="hook"></div>`;
    el.style.width = '64px'; el.style.height = '64px';
  } else if(type === 'garland'){
    el.innerHTML = `<svg viewBox="0 0 300 100"><path d="M10,30 C80,90 220,10 290,70" /></svg>`;
    el.style.width = '300px'; el.style.height = '100px';
  } else if(type === 'star'){
    el.innerHTML = `<svg viewBox="0 0 100 100"><polygon points="50,5 61,37 95,37 67,57 77,90 50,70 23,90 33,57 5,37 39,37"/></svg>`;
    el.style.width = '84px'; el.style.height = '84px';
  }

  // overlay sélection avec contrôles: arrière / avant / dupliquer / +/- épaisseur / supprimer
  const selection = document.createElement('div');
  selection.className = 'selection';
  selection.innerHTML = `
    <div class="box"></div>
    <div class="controls">
      <button class="ctrl" data-act="back">Arrière</button>
      <button class="ctrl" data-act="front">Avant</button>
      <button class="ctrl" data-act="dup">⎘</button>
      <button class="ctrl" data-act="thick-">−</button>
      <button class="ctrl" data-act="thick+">+</button>
      <button class="ctrl" data-act="delete">🗑</button>
    </div>
    <div class="handle nw" data-handle="nw"></div>
    <div class="handle ne" data-handle="ne"></div>
    <div class="handle sw" data-handle="sw"></div>
    <div class="handle se" data-handle="se"></div>
    <div class="handle n" data-handle="n" title="Épaisseur"></div>
    <div class="handle s" data-handle="s" title="Épaisseur"></div>
    <div class="handle w" data-handle="w"></div>
    <div class="handle e" data-handle="e"></div>
    <div class="handle rotate" data-handle="rotate" title="Rotation"></div>
  `;
  el.appendChild(selection);

  attachInteractions(el);
  return el;
}

/* sélection / désélection */
function select(el){
  [...workarea.querySelectorAll('.item.selected')].forEach(x=>x.classList.remove('selected'));
  el.classList.add('selected');
  selected = getState(el);
}
function deselect(){
  [...workarea.querySelectorAll('.item.selected')].forEach(x=>x.classList.remove('selected'));
  selected = null;
}

/* état courant */
function getState(el){
  const style = getComputedStyle(el);
  const tr = parseTransform(style.transform);
  return {
    el,
    x: el.offsetLeft,
    y: el.offsetTop,
    w: parseFloat(style.width),
    h: parseFloat(style.height),
    r: tr.r,
    s: tr.s,
    thick: parseFloat(style.getPropertyValue('--thick')) || 1
  };
}
function setState(st){
  st.el.style.left = `${st.x}px`;
  st.el.style.top = `${st.y}px`;
  st.el.style.width = `${st.w}px`;
  st.el.style.height = `${st.h}px`;
  st.el.style.transform = `rotate(${st.r}deg) scale(${st.s})`;
  st.el.style.setProperty('--thick', `${st.thick}`);
}

/* centrer */
function center(el){
  const r = workarea.getBoundingClientRect();
  const w = parseFloat(getComputedStyle(el).width);
  const h = parseFloat(getComputedStyle(el).height);
  el.style.left = (r.width/2 - w/2) + 'px';
  el.style.top  = (r.height/2 - h/2) + 'px';
}

/* interactions */
function attachInteractions(el){
  // sélectionner + drag (hors poignée)
  el.addEventListener('pointerdown', (e)=>{
    const isHandle = e.target.classList.contains('handle');
    if(!isHandle){
      select(el);
      startDrag(el, e);
    }
  });

  // poignées
  el.querySelectorAll('.handle').forEach(h=>{
    h.addEventListener('pointerdown', (e)=>{
      e.stopPropagation();
      select(el);
      const dir = h.dataset.handle;
      if(dir === 'n' || dir === 's'){
        startThicknessDrag(el, e, dir);
      } else if(dir === 'rotate'){
        startRotate(el, e);
      } else {
        startResize(el, e, dir);
      }
    });
  });

  // contrôles : arrière / avant / dupliquer / delete / thickness +/- 
  el.querySelectorAll('.ctrl').forEach(c=>{
    c.addEventListener('click', (e)=>{
      e.stopPropagation();
      const act = c.dataset.act;
      if(act === 'delete'){ el.remove(); if(selected && selected.el===el) deselect(); return; }
      if(act === 'dup'){ const clone = el.cloneNode(true); workarea.appendChild(clone); attachInteractions(clone); offsetClone(clone); select(clone); return; }
      if(act === 'front') bringForward(el);
      if(act === 'back') sendBackward(el);
      if(act === 'thick+') adjustThickness(el, +0.2);
      if(act === 'thick-') adjustThickness(el, -0.2);
    });
  });
}

function offsetClone(clone){
  clone.style.left = (clone.offsetLeft + 12) + 'px';
  clone.style.top  = (clone.offsetTop + 12) + 'px';
}

/* drag */
function startDrag(el, e){
  e.preventDefault();
  el.classList.add('dragging');
  const wr = workarea.getBoundingClientRect();
  const init = { x: el.offsetLeft, y: el.offsetTop, mx: e.clientX, my: e.clientY };
  const dupOnAlt = e.altKey;
  let target = el;

  if(dupOnAlt){
    const ghost = el.cloneNode(true);
    workarea.appendChild(ghost);
    attachInteractions(ghost);
    target = ghost;
    select(target);
  }

  function onMove(ev){
    const dx = ev.clientX - init.mx;
    const dy = ev.clientY - init.my;
    const w = parseFloat(getComputedStyle(target).width);
    const h = parseFloat(getComputedStyle(target).height);
    let nx = init.x + dx;
    let ny = init.y + dy;
    nx = clamp(nx, 0, wr.width - w);
    ny = clamp(ny, 0, wr.height - h);
    target.style.left = nx + 'px';
    target.style.top  = ny + 'px';
  }
  function onUp(){
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    el.classList.remove('dragging');
  }
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

/* redimensionnement */
function startResize(el, e, dir){
  e.preventDefault();
  const wr = workarea.getBoundingClientRect();
  const st = getState(el);
  const start = { mx: e.clientX, my: e.clientY, w: st.w, h: st.h, x: st.x, y: st.y };

  function onMove(ev){
    const dx = ev.clientX - start.mx;
    const dy = ev.clientY - start.my;
    let w = start.w, h = start.h, x = start.x, y = start.y;

    if(dir.includes('e')) w = start.w + dx;
    if(dir.includes('s')) h = start.h + dy;
    if(dir.includes('w')) { w = start.w - dx; x = start.x + dx; }
    if(dir.includes('n')) { h = start.h - dy; y = start.y + dy; }

    const minSize = 24;
    const maxW = wr.width;
    const maxH = wr.height;
    w = clamp(w, minSize, maxW);
    h = clamp(h, minSize, maxH);
    x = clamp(x, 0, wr.width - w);
    y = clamp(y, 0, wr.height - h);

    st.w = w; st.h = h; st.x = x; st.y = y;
    setState(st);
  }
  function onUp(){
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

/* épaississement via poignée n/s */
function startThicknessDrag(el, e, dir){
  e.preventDefault();
  const st = getState(el);
  const start = { my: e.clientY, thick: st.thick };

  function onMove(ev){
    const dy = ev.clientY - start.my;
    // s : +, n : -
    const delta = (dir === 's') ? dy : -dy;
    // sensibilité : 120px = ~ +2.0
    let next = start.thick + (delta / 120) * 2;
    next = Math.max(0.2, Math.min(6, next));
    st.thick = next;
    setState(st);
  }
  function onUp(){
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

/* ajuster épaisseur (val delta positive/negative) */
function adjustThickness(el, delta){
  const cur = parseFloat(getComputedStyle(el).getPropertyValue('--thick')) || 1;
  let next = cur + delta;
  next = Math.max(0.2, Math.min(6, next));
  el.style.setProperty('--thick', String(next));
}

/* Rotation via poignée */
function startRotate(el, e){
  e.preventDefault();
  const wr = workarea.getBoundingClientRect();
  const st = getState(el);
  const center = { x: el.offsetLeft + st.w/2, y: el.offsetTop + st.h/2 };

  function onMove(ev){
    const angle = Math.atan2(ev.clientY - (wr.top + center.y), ev.clientX - (wr.left + center.x)) * (180/Math.PI);
    st.r = angle + 90;
    setState(st);
  }
  function onUp(){
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

/* avancer / reculer dans l'ordre */
function bringForward(el){
  const parent = el.parentElement;
  if(!parent) return;
  const nodes = Array.from(parent.children).filter(n=>n.classList && n.classList.contains('item'));
  const idx = nodes.indexOf(el);
  if(idx < nodes.length - 1){
    parent.insertBefore(nodes[idx + 1], nodes[idx]);
  }
}
function sendBackward(el){
  const parent = el.parentElement;
  if(!parent) return;
  const nodes = Array.from(parent.children).filter(n=>n.classList && n.classList.contains('item'));
  const idx = nodes.indexOf(el);
  if(idx > 0){
    parent.insertBefore(el, nodes[idx - 1]);
  }
}

/* utils */
function parseTransform(tr){
  const r = /rotate\(([-\d.]+)deg\)/.exec(tr||''); const s = /scale\(([-\d.]+)\)/.exec(tr||'');
  return { r: r ? parseFloat(r[1]) : 0, s: s ? parseFloat(s[1]) : 1 };
}
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
