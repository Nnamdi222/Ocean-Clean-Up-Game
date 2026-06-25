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

let score = 0;
let clean = 0;
let time = 60;
let lives = 3;

let gameRunning = false;
let timer;
let spawnTimer;
let bin;

/* 🧨 CRITICAL FIX: FORCE OVERLAY OFF ON LOAD */
overlay.classList.add("hidden");

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
   OCEAN VISUAL STATE
========================== */
function updateOcean() {
  const darkness = 0.55 - (clean / 100) * 0.55;

  oceanOverlay.style.background = `
    rgba(0, ${40 + clean * 2}, ${80 + clean * 2}, ${Math.max(darkness, 0)})
  `;
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
   SPAWN OBJECTS
========================== */
function spawn() {
  if (!gameRunning) return;

  const item = document.createElement("div");

  const r = Math.random();

  if (r < 0.7) {
    item.className = "trash";
    item.textContent = "🥤";
    item.dataset.type = "trash";
  } else {
    item.className = "fish";
    item.textContent = "🐟";
    item.dataset.type = "fish";
  }

  item.style.left = Math.random() * 80 + "%";
  item.style.top = Math.random() * 70 + "%";

  drag(item);
  gameArea.appendChild(item);

  setTimeout(() => {
    if (item.parentNode) item.remove();
  }, 5000);
}

/* ==========================
   DRAG SYSTEM
========================== */
function drag(item) {
  let ox, oy;

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

      bin.style.transform =
        (e.clientX > b.left &&
         e.clientX < b.right &&
         e.clientY > b.top &&
         e.clientY < b.bottom)
        ? "translateX(-50%) scale(1.1)"
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
      }

      update();
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", drop);
  });
}

/* ==========================
   START GAME (FIXED)
========================== */
function startGame() {
  if (gameRunning) return;

  gameRunning = true;

  score = 0;
  clean = 0;
  time = 60;
  lives = 3;

  gameArea.innerHTML = "";
  overlay.classList.add("hidden");

  createBin();
  update();

  /* 🧨 SAFETY: CLEAR OLD INTERVALS */
  clearInterval(timer);
  clearInterval(spawnTimer);

  timer = setInterval(() => {
    if (!gameRunning) return;

    time--;
    update();

    if (time <= 0) {
      endGame("Time's Up", "Try again!");
    }
  }, 1000);

  spawnTimer = setInterval(spawn, 900);
}

/* ==========================
   RESET (SAFE)
========================== */
function resetGame() {
  gameRunning = false;

  clearInterval(timer);
  clearInterval(spawnTimer);

  score = 0;
  clean = 0;
  time = 60;
  lives = 3;

  gameArea.innerHTML = "";
  overlay.classList.add("hidden");

  update();
}

/* ==========================
   END GAME (FIXED)
========================== */
function endGame(title, msg) {
  if (!gameRunning) return;

  gameRunning = false;

  clearInterval(timer);
  clearInterval(spawnTimer);

  overlay.classList.remove("hidden");
  resultTitle.textContent = title;
  resultMessage.textContent = msg;
}

/* EVENTS */
startBtn.onclick = startGame;
resetBtn.onclick = resetGame;
playAgain.onclick = resetGame;

/* INIT SAFE STATE */
update();
overlay.classList.add("hidden");
