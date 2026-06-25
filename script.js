const gameArea = document.getElementById("gameArea");
const oceanOverlay = document.getElementById("oceanOverlay");

const scoreDisplay = document.getElementById("score");
const waterDisplay = document.getElementById("waterPercent");
const timerDisplay = document.getElementById("timer");
const livesDisplay = document.getElementById("lives");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const overlay = document.getElementById("overlay");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const playAgain = document.getElementById("playAgain");

/* ==========================
   GAME STATE (LOCKED SAFELY)
========================== */
let gameRunning = false;
let score = 0;
let clean = 0;
let time = 60;
let lives = 3;

let timer = null;
let spawnTimer = null;
let bin = null;

/* 🧨 FORCE CLEAN START STATE */
function forceResetUI() {
  overlay.classList.add("hidden");
  gameArea.innerHTML = "";
  scoreDisplay.textContent = "0";
  waterDisplay.textContent = "0%";
  timerDisplay.textContent = "60";
  livesDisplay.textContent = "3";
}

forceResetUI();

/* ==========================
   OCEAN VISUAL
========================== */
function updateOcean() {
  const opacity = 0.55 - clean / 200;

  oceanOverlay.style.background = `
    rgba(0, ${40 + clean * 2}, ${80 + clean * 2}, ${Math.max(opacity, 0)})
  `;
}

/* ==========================
   UI UPDATE
========================== */
function update() {
  scoreDisplay.textContent = score;
  waterDisplay.textContent = clean + "%";
  timerDisplay.textContent = time;
  livesDisplay.textContent = lives;

  updateOcean();
}

/* ==========================
   BIN
========================== */
function createBin() {
  bin = document.createElement("div");
  bin.id = "trashBin";
  bin.textContent = "🗑️ DROP ZONE";
  gameArea.appendChild(bin);
}

/* ==========================
   SPAWN SYSTEM (SAFE GUARD)
========================== */
function spawn() {
  if (!gameRunning) return;
  if (!bin) return;

  const item = document.createElement("div");

  const isTrash = Math.random() < 0.7;

  item.className = isTrash ? "trash" : "fish";
  item.textContent = isTrash ? "🥤" : "🐟";
  item.dataset.type = isTrash ? "trash" : "fish";

  item.style.left = Math.random() * 80 + "%";
  item.style.top = Math.random() * 70 + "%";

  drag(item);
  gameArea.appendChild(item);

  setTimeout(() => {
    if (item.parentNode && item.dataset.type === "trash") {
      item.remove();
    }
  }, 5000);
}

/* ==========================
   DRAG SYSTEM
========================== */
function drag(item) {
  let ox = 0, oy = 0;

  item.addEventListener("pointerdown", (e) => {
    if (!gameRunning) return;

    const rect = item.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;

    item.style.zIndex = 999;

    function move(e) {
      item.style.left = e.clientX - ox + "px";
      item.style.top = e.clientY - oy + "px";

      const b = bin.getBoundingClientRect();

      const hovering =
        e.clientX > b.left &&
        e.clientX < b.right &&
        e.clientY > b.top &&
        e.clientY < b.bottom;

      bin.style.transform = hovering
        ? "translateX(-50%) scale(1.15)"
        : "translateX(-50%) scale(1)";
    }

    function drop() {
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
        clean = Math.min(100, clean + 6);

        item.classList.add("pop");
        setTimeout(() => item.remove(), 120);

        update();
      }
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", drop);
  });
}

/* ==========================
   START (FULLY SAFE)
========================== */
function startGame() {
  if (gameRunning) return;

  /* 🧨 HARD RESET EVERYTHING */
  clearInterval(timer);
  clearInterval(spawnTimer);

  gameRunning = true;

  score = 0;
  clean = 0;
  time = 60;
  lives = 3;

  gameArea.innerHTML = "";
  overlay.classList.add("hidden");

  createBin();
  update();

  timer = setInterval(() => {
    if (!gameRunning) return;

    time--;
    update();

    if (time <= 0) {
      endGame();
    }
  }, 1000);

  spawnTimer = setInterval(spawn, 900);
}

/* ==========================
   RESET
========================== */
function resetGame() {
  gameRunning = false;

  clearInterval(timer);
  clearInterval(spawnTimer);

  gameArea.innerHTML = "";
  overlay.classList.add("hidden");

  score = 0;
  clean = 0;
  time = 60;
  lives = 3;

  update();
}

/* ==========================
   END GAME (ONLY ONE PATH)
========================== */
function endGame() {
  if (!gameRunning) return;

  gameRunning = false;

  clearInterval(timer);
  clearInterval(spawnTimer);

  overlay.classList.remove("hidden");
  resultTitle.textContent = "Game Over";
  resultMessage.textContent = "Try again and clean the ocean!";
}

/* ==========================
   EVENTS
========================== */
startBtn.onclick = startGame;
resetBtn.onclick = resetGame;
playAgain.onclick = resetGame;

/* INIT SAFE STATE */
update();
forceResetUI();
