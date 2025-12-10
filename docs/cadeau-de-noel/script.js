document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gardenCanvas");
  if (!canvas) {
    console.error("Canvas 'gardenCanvas' introuvable. Vérifie l'ID dans index.html.");
    return;
  }

  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Utilitaires dessin
  function drawStem(x, baseY, height, color = "#00ff99") {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY - height);
    ctx.stroke();
  }

  function drawLeaf(x, y, size, angle, color = "#00cc66") {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size, -size * 0.6, size * 2, 0);
    ctx.quadraticCurveTo(size, size * 0.6, 0, 0);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawGrassTuft(x, baseY, width, height, color = "#00aa66") {
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i++) {
      const gx = x - width / 2 + (i / 5) * width;
      ctx.beginPath();
      ctx.moveTo(gx, baseY);
      ctx.quadraticCurveTo(gx + 4, baseY - height * 0.6, gx + 1, baseY - height);
      ctx.quadraticCurveTo(gx - 2, baseY - height * 0.6, gx, baseY);
      ctx.fill();
    }
  }

  function drawFlowerHead(x, y, size) {
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const px = x + Math.cos(angle) * size * 0.7;
      const py = y + Math.sin(angle) * size * 0.7;
      ctx.fillStyle = ["#ff69b4", "#ffb6c1", "#e0bbff", "#b2f7ef"][i % 4];
      ctx.beginPath();
      ctx.arc(px, py, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  const plants = [];
  let lastTime = 0;

  class Plant {
    constructor(x) {
      this.x = x;
      this.baseY = canvas.height;
      this.targetHeight = Math.random() * canvas.height * 0.45 + canvas.height * 0.2;
      this.height = 0;
      this.growthSpeed = Math.random() * 0.18 + 0.12; // pixels/ms
      this.leaves = [];
      this.hasFlower = Math.random() < 0.7;
      this.flowerSize = Math.random() * 18 + 14;

      const leafCount = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < leafCount; i++) {
        const pos = Math.random() * 0.8 + 0.15;
        const side = Math.random() < 0.5 ? -1 : 1;
        this.leaves.push({
          offset: pos,
          side,
          size: Math.random() * 10 + 8,
        });
      }

      this.grass = {
        width: Math.random() * 30 + 24,
        height: Math.random() * 20 + 14,
      };
    }

    update(dt) {
      if (this.height < this.targetHeight) {
        this.height += this.growthSpeed * dt;
        if (this.height > this.targetHeight) this.height = this.targetHeight;
      }
    }

    draw() {
      drawGrassTuft(this.x, this.baseY, this.grass.width, this.grass.height);
      drawStem(this.x, this.baseY, this.height);

      for (const leaf of this.leaves) {
        const ly = this.baseY - this.height * leaf.offset;
        if (ly < this.baseY && ly > this.baseY - this.height + 4) {
          const angle = leaf.side * (Math.PI / 3) * 0.7;
          drawLeaf(this.x + leaf.side * 2, ly, leaf.size, angle);
        }
      }

      if (this.hasFlower && this.height >= this.targetHeight * 0.8) {
        const topY = this.baseY - this.height;
        drawFlowerHead(this.x, topY - 6, this.flowerSize);
      }
    }
  }

  function spawnWave() {
    const count = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width;
      plants.push(new Plant(x));
    }
  }

  function render(time) {
    const dt = lastTime ? time - lastTime : 16;
    lastTime = time;

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height, canvas.width * 0.05,
      canvas.width / 2, canvas.height, canvas.width * 0.9
    );
    gradient.addColorStop(0, "rgba(0, 255, 150, 0.08)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const plant of plants) {
      plant.update(dt);
      plant.draw();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  const magicButton = document.getElementById("magicButton");
  if (!magicButton) {
    console.error("Bouton 'magicButton' introuvable. Vérifie l'ID dans index.html.");
    return;
  }
  magicButton.addEventListener("click", spawnWave);
});
