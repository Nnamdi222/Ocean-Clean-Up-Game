const gameArea = document.getElementById("gameArea");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const waterPercent = document.getElementById("waterPercent");
const highScoreDisplay = document.getElementById("highScore");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const overlay = document.getElementById("overlay");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const playAgain = document.getElementById("playAgain");

let score = 0;
let water = 0;
let time = 60;
let gameRunning = false;
let timer;
let spawnTimer;
let bin;

highScoreDisplay.textContent = localStorage.getItem("highScore") || 0;

/* INIT BIN */
function createBin() {
  bin = document.createElement("div");
  bin.id = "trashBin";
  bin.textContent = "🗑️ BIN";
  gameArea.appendChild(bin);
}

/* UPDATE UI */
function update() {
  scoreDisplay.textContent = score;
  waterPercent.textContent = water + "%";
  timerDisplay.textContent = time;
}

/* SPAWN OBJECTS */
function spawn() {
  if (!gameRunning) return;

  const item = document.createElement("div");

  const r = Math.random();

  if (r < 0.6) {
    item.className = "trash";
    item.textContent = "🥤";
    item.dataset.type = "trash";
  } else if (r < 0.8) {
    item.className = "fish";
    item.textContent = "🐟";
    item.dataset.type = "fish";
  } else {
    item.className = "turtle";
    item.textContent = "🐢";
    item.dataset.type = "turtle";
  }

  item.style.left = Math.random() * 80 + "%";
  item.style.top = Math.random() * 70 + "%";

  makeDraggable(item);
  gameArea.appendChild(item);

  setTimeout(() => {
    if (item.dataset.type === "trash") {
      score = Math.max(0, score - 5);
    }
    item.remove();
    update();
  }, 5000);
}

/* DRAG */
function makeDraggable(item) {
  let offsetX, offsetY;

  item.addEventListener("pointerdown", (e) => {
    if (!gameRunning) return;

    const rect = item.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    item.classList.add("dragging");

    function move(e) {
      item.style.left = e.clientX - offsetX + "px";
      item.style.top = e.clientY - offsetY + "px";

      const b = bin.getBoundingClientRect();

      const hover =
        e.clientX > b.left &&
        e.clientX < b.right &&
        e.clientY > b.top &&
        e.clientY < b.bottom;

      bin.classList.toggle("active", hover);
    }

    function drop(e) {
      item.classList.remove("dragging");
      bin.classList.remove("active");

      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", drop);

      const b = bin.getBoundingClientRect();
      const r = item.getBoundingClientRect();

      const hit =
        r.left < b.right &&
        r.right > b.left &&
        r.top < b.bottom &&
        r.bottom > b.top;

      if (hit && item.dataset.type === "trash") {
        score += 10;
        water = Math.min(100, water + 6);
        item.classList.add("pop");

        setTimeout(() => item.remove(), 150);
      }

      update();
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", drop);
  });
}

/* START */
function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  water = 0;
  time = 60;

  gameArea.innerHTML = "";
  createBin();
  update();

  timer = setInterval(() => {
    time--;
    update();

    if (time <= 0) endGame();
  }, 1000);

  spawnTimer = setInterval(spawn, 900);
}

/* RESET */
function resetGame() {
  clearInterval(timer);
  clearInterval(spawnTimer);

  gameRunning = false;

  gameArea.innerHTML = "";
  overlay.classList.add("hidden");

  score = 0;
  water = 0;
  time = 60;

  update();
}

/* END */
function endGame() {
  gameRunning = false;

  clearInterval(timer);
  clearInterval(spawnTimer);

  overlay.classList.remove("hidden");

  resultTitle.textContent = "Game Over";
  resultMessage.textContent = "Try again to clean the ocean!";

  const high = Number(localStorage.getItem("highScore") || 0);
  if (score > high) {
    localStorage.setItem("highScore", score);
  }
}

/* EVENTS */
startBtn.onclick = startGame;
resetBtn.onclick = resetGame;
playAgain.onclick = resetGame;

update();
