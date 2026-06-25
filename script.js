const gameArea = document.getElementById("gameArea");
const bin = document.getElementById("trashBin");

const scoreEl = document.getElementById("score");
const cleanEl = document.getElementById("waterPercent");
const timerEl = document.getElementById("timer");
const livesEl = document.getElementById("lives");

const overlay = document.getElementById("overlay");
const title = document.getElementById("resultTitle");
const msg = document.getElementById("resultMessage");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const playAgain = document.getElementById("playAgain");

let score = 0;
let clean = 0;
let time = 60;
let lives = 3;

let running = false;
let timer;
let spawnTimer;

/* 🚨 FORCE CLEAN STATE ON LOAD */
overlay.classList.add("hidden");

function update() {
  scoreEl.textContent = score;
  cleanEl.textContent = clean + "%";
  timerEl.textContent = time;
  livesEl.textContent = lives;
}

/* SPAWN */
function spawn() {
  if (!running) return;

  const item = document.createElement("div");
  const isTrash = Math.random() < 0.7;

  item.className = isTrash ? "trash" : "fish";
  item.textContent = isTrash ? "🥤" : "🐟";
  item.dataset.type = isTrash ? "trash" : "fish";

  item.style.left = Math.random() * 80 + "%";
  item.style.top = Math.random() * 70 + "%";

  drag(item);
  gameArea.appendChild(item);

  setTimeout(() => item.remove(), 5000);
}

/* DRAG */
function drag(item) {
  let ox, oy;

  item.addEventListener("pointerdown", (e) => {
    if (!running) return;

    const r = item.getBoundingClientRect();
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;

    function move(e) {
      item.style.left = e.clientX - ox + "px";
      item.style.top = e.clientY - oy + "px";
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
        clean = Math.min(100, clean + 5);
        item.remove();
        update();

        if (clean >= 100) win();
      }
    }

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", drop);
  });
}

/* START */
function startGame() {
  if (running) return;

  running = true;

  score = 0;
  clean = 0;
  time = 60;
  lives = 3;

  gameArea.innerHTML = "";
  overlay.classList.add("hidden");

  update();

  clearInterval(timer);
  clearInterval(spawnTimer);

  timer = setInterval(() => {
    if (!running) return;

    time--;
    update();

    if (time <= 0) lose();
  }, 1000);

  spawnTimer = setInterval(spawn, 900);
}

/* RESET */
function resetGame() {
  running = false;

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

/* WIN / LOSE */
function win() {
  end("You Win!", "Ocean fully cleaned 🌊");
}

function lose() {
  end("Game Over", "Try again!");
}

function end(t, m) {
  running = false;

  clearInterval(timer);
  clearInterval(spawnTimer);

  overlay.classList.remove("hidden");
  title.textContent = t;
  msg.textContent = m;
}

/* EVENTS */
startBtn.onclick = startGame;
resetBtn.onclick = resetGame;
playAgain.onclick = resetGame;

/* INIT */
update();
overlay.classList.add("hidden");
