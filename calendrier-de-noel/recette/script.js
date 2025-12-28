let timer;
function startTimer() {
  clearInterval(timer);
  let minutes = document.getElementById("minutes").value;
  let time = minutes * 60;
  
  timer = setInterval(() => {
    let min = Math.floor(time / 60);
    let sec = time % 60;
    document.getElementById("countdown").textContent =
      `${min}:${sec < 10 ? "0" : ""}${sec}`;
    
    if (time <= 0) {
      clearInterval(timer);
      alert("🎄 Ding ! Les cookies sont prêts 🍪");
    }
    time--;
  }, 1000);
}

function createSnowflake() {
  const snowflake = document.createElement("div");
  snowflake.classList.add("snowflake");
  snowflake.textContent = "❄";
  snowflake.style.left = Math.random() * window.innerWidth + "px";
  snowflake.style.animationDuration = 5 + Math.random() * 5 + "s";
  snowflake.style.opacity = Math.random();
  snowflake.style.fontSize = 10 + Math.random() * 20 + "px";

  document.body.appendChild(snowflake);

  setTimeout(() => {
    snowflake.remove();
  }, 10000);
}

setInterval(createSnowflake, 150);

