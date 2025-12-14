document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gardenCanvas");
  const ctx = canvas.getContext("2d");

    const stars = [];
  function createStars(count) {
    stars.length = 0;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.5,
        twinkle: Math.random() * 0.02 + 0.01 // vitesse scintillement
      });
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars(200); // recréer les étoiles quand on resize
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);


  function drawStars() {
    for (const star of stars) {
      star.opacity += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
      if (star.opacity < 0.3) star.opacity = 0.3;
      if (star.opacity > 1) star.opacity = 1;

      ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Plantes ---
  class Plant {
    constructor(x) {
  this.x = x;
  this.baseY = canvas.height;
  this.height = 0;
  this.targetHeight = Math.random() * (canvas.height * 0.7) + 100; // plus haut
  this.growthSpeed = Math.random() * 3 + 4; // rapide
  this.flowerSize = Math.random() * 40 + 30;
  this.petalCount = 12;
  this.curve = Math.random() * 0.4 - 0.2;
  this.hasBloomed = false;

  const palettes = [
    ["#ff69b4", "#ffb6c1", "#ffe4e1"], // rose
    ["#9370db", "#dda0dd", "#e6e6fa"], // violet
    ["#1e90ff", "#87ceeb", "#add8e6"], // bleu
    ["#ff7f50", "#ffa07a", "#ffe4b5"], // orange
    ["#32cd32", "#98fb98", "#f0fff0"]  // vert pastel
  ];
  this.colors = palettes[Math.floor(Math.random() * palettes.length)];
}

    update(deltaTime) {
      if (this.height < this.targetHeight) {
        this.height += this.growthSpeed * deltaTime;
      } else {
        this.hasBloomed = true;
      }
    }

    drawStem() {
      const gradient = ctx.createLinearGradient(this.x, this.baseY, this.x, this.baseY - this.height);
      gradient.addColorStop(0, "#004d00");
      gradient.addColorStop(0.5, "#008000");
      gradient.addColorStop(1, "#00ff99");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.x, this.baseY);
      ctx.quadraticCurveTo(this.x + this.curve * 100, this.baseY - this.height / 2, this.x, this.baseY - this.height);
      ctx.stroke();

      // nervures latérales
      ctx.strokeStyle = "#006400";
      ctx.lineWidth = 1;
      for (let i = 40; i < this.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.baseY - i);
        ctx.lineTo(this.x + (this.curve > 0 ? 12 : -12), this.baseY - i - 8);
        ctx.stroke();
      }
    }

    drawFlower() {
      if (!this.hasBloomed) return;
      const topY = this.baseY - this.height;
      ctx.save();
      ctx.translate(this.x, topY);

      for (let i = 0; i < this.petalCount; i++) {
        const angle = (i / this.petalCount) * Math.PI * 2;
        ctx.rotate(angle);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.flowerSize);
        gradient.addColorStop(0, this.colors[0]);
        gradient.addColorStop(0.5, this.colors[1]);
        gradient.addColorStop(1, this.colors[2]);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(this.flowerSize * 0.7, -this.flowerSize, this.flowerSize, 0);
        ctx.quadraticCurveTo(this.flowerSize * 0.7, this.flowerSize, 0, 0);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = this.colors[0];
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, this.flowerSize * 0.35);
      core.addColorStop(0, "#ffffcc");
      core.addColorStop(1, "#ffcc00");
      ctx.beginPath();
      ctx.arc(0, 0, this.flowerSize * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();

      ctx.restore();
    }

    draw() {
      this.drawStem();
      this.drawFlower();
    }
  }

  const plants = [];

function spawnPlants() {
  const count = Math.floor(Math.random() * 5) + 5;

  for (let i = 0; i < count; i++) {
    let x;
    let valid = false;

    // essayer plusieurs fois pour trouver une position correcte
    for (let tries = 0; tries < 20 && !valid; tries++) {
      x = Math.random() * canvas.width;
      valid = true;

      // vérifier la distance avec les autres plantes
      for (const plant of plants) {
        if (Math.abs(x - plant.x) < 80) { // minimum 60px d’écart
          valid = false;
          break;
        }
      }
    }

    plants.push(new Plant(x));
  }
}


  let lastTime = 0;
  function animate(time) {
  const deltaTime = lastTime ? (time - lastTime) / 16 : 1;
  lastTime = time;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars();

  // Étape 1 : dessiner toutes les tiges
  for (const plant of plants) {
    plant.update(deltaTime);
    plant.drawStem();
  }

  // Étape 2 : dessiner toutes les fleurs au-dessus
  for (const plant of plants) {
    plant.drawFlower();
  }

  requestAnimationFrame(animate);
}


  animate();

  document.getElementById("magicButton").addEventListener("click", spawnPlants);
});
