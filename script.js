const gameArea = document.getElementById("gameArea");
const bin = document.getElementById("trashBin");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const cleanEl = document.getElementById("waterPercent");
const cleanBarEl = document.getElementById("cleanBar");
const timerEl = document.getElementById("timer");
const livesEl = document.getElementById("lives");
const messageEl = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

let score = 0;
let clean = 0;
let time = 60;
let lives = 3;
let bestScore = parseInt(localStorage.getItem("oceanBestScore"), 10) || 0;

let running = false;
let timer;
let spawnTimer;

const MAX_TIME = 60;
const SPAWN_BASE = 900;
const CLEAN_GOAL = 100;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function update() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("oceanBestScore", bestScore);
  }

  scoreEl.textContent = score;
  highScoreEl.textContent = bestScore;
  cleanEl.textContent = `${clean}%`;
  cleanBarEl.style.width = `${clean}%`;
  timerEl.textContent = time < 10 ? `0${time}` : time;
  livesEl.textContent = lives;
  startBtn.disabled = running;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function clearItems() {
  gameArea.querySelectorAll(".item").forEach((item) => item.remove());
}

function spawn() {
  if (!running) return;

  const item = document.createElement("div");
  const isTrash = Math.random() < 0.68;
  const type = isTrash ? "trash" : "fish";

  item.className = `item ${type}`;
  item.textContent = isTrash ? "🥤" : "🐟";
  item.dataset.type = type;

  const size = 34 + Math.random() * 18;
  item.style.width = `${size}px`;
  item.style.height = `${size}px`;
  item.style.lineHeight = `${size}px`;
  item.style.fontSize = `${size * 0.75}px`;

  const maxX = Math.max(gameArea.clientWidth - size, 0);
  const maxY = Math.max(gameArea.clientHeight - size - 100, 0);
  item.style.left = `${Math.random() * maxX}px`;
  item.style.top = `${Math.random() * maxY}px`;
  item.style.opacity = "0";

  requestAnimationFrame(() => {
    item.style.opacity = "1";
  });

  attachDrag(item);
  gameArea.appendChild(item);

  setTimeout(() => {
    if (item.isConnected) {
      item.remove();
    }
  }, 6500);
}

function attachDrag(item) {
  item.addEventListener("pointerdown", (event) => {
    if (!running) return;

    event.preventDefault();
    item.setPointerCapture(event.pointerId);

    const areaRect = gameArea.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const offsetX = event.clientX - itemRect.left;
    const offsetY = event.clientY - itemRect.top;

    function move(e) {
      const relativeX = e.clientX - areaRect.left - offsetX;
      const relativeY = e.clientY - areaRect.top - offsetY;

      item.style.left = `${clamp(relativeX, 0, areaRect.width - item.offsetWidth)}px`;
      item.style.top = `${clamp(relativeY, 0, areaRect.height - item.offsetHeight)}px`;
    }

    function drop(e) {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", drop);
      item.releasePointerCapture(e.pointerId);

      const binRect = bin.getBoundingClientRect();
      const currentRect = item.getBoundingClientRect();
      const hit =
        currentRect.left < binRect.right &&
        currentRect.right > binRect.left &&
        currentRect.top < binRect.bottom &&
        currentRect.bottom > binRect.top;

      if (hit) {
        if (item.dataset.type === "trash") {
          score += 10;
          clean = Math.min(CLEAN_GOAL, clean + 5);
          setMessage("✅ Trash collected! Keep the ocean clean.");
        } else {
          lives -= 1;
          score = Math.max(0, score - 5);
          setMessage("⚠️ Don't throw fish in the bin. Keep them in the ocean.");
        }

        item.remove();
        update();

        if (clean >= CLEAN_GOAL) {
          win();
        } else if (lives <= 0) {
          lose();
        }
      }
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", drop);
  });
}

function startGame() {
  if (running) return;

  running = true;
  score = 0;
  clean = 0;
  time = MAX_TIME;
  lives = 3;

  clearItems();
  setMessage("Drag trash into the Charity Water bin and avoid harming fish. You have 60 seconds!");
  update();

  clearInterval(timer);
  clearInterval(spawnTimer);

  timer = setInterval(() => {
    time -= 1;
    if (time <= 0) {
      time = 0;
      lose();
    }
    update();
  }, 1000);

  spawnTimer = setInterval(spawn, SPAWN_BASE);
  spawn();
}

function resetGame() {
  running = false;
  clearInterval(timer);
  clearInterval(spawnTimer);
  score = 0;
  clean = 0;
  time = MAX_TIME;
  lives = 3;
  clearItems();
  setMessage("Press Start to begin cleaning water for Charity Water.");
  update();
}

function win() {
  if (!running) return;
  running = false;
  clearInterval(timer);
  clearInterval(spawnTimer);
  setMessage("🎉 You cleaned the ocean! Great job!");
  update();
}

function lose() {
  if (!running) return;
  running = false;
  clearInterval(timer);
  clearInterval(spawnTimer);
  setMessage("💀 Game Over — try again and beat your best score!");
  update();
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

update();
