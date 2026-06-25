const gameArea = document.getElementById("gameArea");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const waterFill = document.getElementById("waterFill");
const waterPercent = document.getElementById("waterPercent");
const highScoreDisplay = document.getElementById("highScore");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const overlay = document.getElementById("overlay");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const playAgain = document.getElementById("playAgain");

const factBox = document.getElementById("factBox");

// 🆕 BIN (drag target)
let bin;

let score = 0;
let water = 0;
let time = 60;
let lives = 3;
let combo = 0;
let gameRunning = false;

let timer;
let spawnTimer;
let difficultyTimer;

const facts = [
  "Every person deserves clean water.",
  "Clean water improves health.",
  "charity: water funds clean water projects worldwide.",
  "Protecting oceans protects drinking water.",
  "Small actions create big change."
];

highScoreDisplay.textContent = localStorage.getItem("highScore") || 0;

function updateDisplays() {
  scoreDisplay.textContent = score;
  waterPercent.textContent = water + "%";
  waterFill.style.width = water + "%";
  timerDisplay.textContent = time;
}

function randomFact() {
  factBox.textContent = facts[Math.floor(Math.random() * facts.length)];
}

/* ==========================
   CREATE BIN
========================== */
function createBin() {
  bin = document.createElement("div");
  bin.id = "trashBin";
  bin.textContent = "🗑️ DROP HERE";
  gameArea.appendChild(bin);
}

/* ==========================
   SPAWN OBJECTS
========================== */
function spawnObject() {
  if (!gameRunning) return;

  const item = document.createElement("div");

  const r = Math.random();

  if (r < 0.65) {
    item.className = "trash";
    item.textContent = ["🥤", "🥫", "🛍️"][Math.floor(Math.random() * 3)];
    item.dataset.type = "trash";
  } else if (r < 0.85) {
    item.className = "fish";
    item.textContent = "🐟";
    item.dataset.type = "fish";
  } else {
    item.className = "turtle";
    item.textContent = "🐢";
    item.dataset.type = "turtle";
  }

  item.style.left = Math.random() * 85 + "%";
  item.style.top = Math.random() * 70 + "%";

  makeDraggable(item);

  gameArea.appendChild(item);

  // timeout removal = penalty for trash
  setTimeout(() => {
    if (!item.dataset.collected) {
      item.remove();

      if (item.dataset.type === "trash") {
        loseLife();
      }
    }
  }, 4500);
}

/* ==========================
   DRAG SYSTEM (MOBILE + DESKTOP)
========================== */
function makeDraggable(item) {
  let offsetX, offsetY;

  item.addEventListener("pointerdown", (e) => {
    if (!gameRunning) return;

    item.setPointerCapture(e.pointerId);

    const rect = item.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    item.style.zIndex = 999;

    function move(e) {
      item.style.position = "absolute";
      item.style.left = (e.clientX - offsetX) + "px";
      item.style.top = (e.clientY - offsetY) + "px";
    }

    function drop() {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", drop);

      checkDrop(item);
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", drop);
  });
}

/* ==========================
   DROP CHECK
========================== */
function checkDrop(item) {
  const binRect = bin.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();

  const overlap =
    itemRect.left < binRect.right &&
    itemRect.right > binRect.left &&
    itemRect.top < binRect.bottom &&
    itemRect.bottom > binRect.top;

  if (overlap && item.dataset.type === "trash") {
    collectTrash(item);
  } else {
    combo = 0;
  }
}

/* ==========================
   COLLECT TRASH (CORE GAME LOGIC)
========================== */
function collectTrash(item) {
  item.dataset.collected = "true";

  combo++;

  const multiplier = Math.min(5, combo);

  score += 10 * multiplier;
  water = Math.min(100, water + 6);

  showPoints(`+${10 * multiplier}`, "lime", item);

  item.classList.add("pop");

  setTimeout(() => item.remove(), 150);

  updateDisplays();
  randomFact();

  checkWin();
}

/* ==========================
   LOSE LIFE SYSTEM
========================== */
function loseLife() {
  lives--;

  combo = 0;

  if (lives <= 0) {
    loseGame();
  }
}

/* ==========================
   POINT EFFECT
========================== */
function showPoints(text, color, item) {
  const p = document.createElement("span");
  p.className = "points";
  p.textContent = text;
  p.style.color = color;
  p.style.left = item.style.left || "50%";
  p.style.top = item.style.top || "50%";

  gameArea.appendChild(p);

  setTimeout(() => p.remove(), 800);
}

/* ==========================
   GAME LOOP
========================== */
function startGame() {
  if (gameRunning) return;

  gameRunning = true;

  score = 0;
  water = 0;
  time = 60;
  lives = 3;
  combo = 0;

  updateDisplays();

  gameArea.innerHTML = "";
  overlay.classList.add("hidden");

  createBin();

  timer = setInterval(() => {
    time--;
    updateDisplays();
    if (time <= 0) loseGame();
  }, 1000);

  spawnTimer = setInterval(spawnObject, 900);

  // 🔥 difficulty increases over time
  difficultyTimer = setInterval(() => {
    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnObject, Math.max(300, 900 - (60 - time) * 8));
  }, 5000);
}

/* ==========================
   RESET
========================== */
function resetGame() {
  clearInterval(timer);
  clearInterval(spawnTimer);
  clearInterval(difficultyTimer);

  gameRunning = false;

  score = 0;
  water = 0;
  time = 60;
  lives = 3;
  combo = 0;

  overlay.classList.add("hidden");
  gameArea.innerHTML = "";

  updateDisplays();
}

/* ==========================
   WIN / LOSE
========================== */
function checkWin() {
  if (water >= 100) {
    endGame("You Win!", "The ocean is clean again 🌊✨");
  }
}

function loseGame() {
  endGame("Game Over", "Too much pollution remained!");
}

function endGame(title, message) {
  clearInterval(timer);
  clearInterval(spawnTimer);
  clearInterval(difficultyTimer);

  gameRunning = false;

  overlay.classList.remove("hidden");
  resultTitle.textContent = title;
  resultMessage.textContent = message;

  const high = Number(localStorage.getItem("highScore") || 0);

  if (score > high) {
    localStorage.setItem("highScore", score);
    highScoreDisplay.textContent = score;
  }
}

startBtn.onclick = startGame;
resetBtn.onclick = resetGame;
playAgain.onclick = resetGame;

updateDisplays();
