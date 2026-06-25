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

let score = 0;
let water = 0; // clean water %
let time = 60;
let gameRunning = false;

let timer;
let spawnTimer;

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

function spawnObject() {
  if (!gameRunning) return;

  const item = document.createElement("div");
  const r = Math.random();

  if (r < 0.6) {
    item.className = "trash";
    item.textContent = ["🥤", "🥫", "🛍️"][Math.floor(Math.random() * 3)];
    item.dataset.type = "trash";
  } 
  else if (r < 0.85) {
    item.className = "fish";
    item.textContent = "🐟";
    item.dataset.type = "fish";
  } 
  else {
    item.className = "turtle";
    item.textContent = "🐢";
    item.dataset.type = "turtle";
  }

  item.style.left = Math.random() * 90 + "%";
  item.style.top = Math.random() * 75 + "%";

  gameArea.appendChild(item);

  item.onclick = function () {
    if (!gameRunning) return;

    if (item.dataset.type === "trash") {
      score += 10;
      water = Math.min(100, water + 5); // cleaning water
      showPoints("+10", "green", item);
    }

    if (item.dataset.type === "fish") {
      score += 5;
      water = Math.min(100, water + 3);
      showPoints("+5", "blue", item);
    }

    if (item.dataset.type === "turtle") {
      score += 15;
      water = Math.min(100, water + 8);
      showPoints("+15", "gold", item);
    }

    updateDisplays();
    randomFact();
    item.remove();

    checkWin();
  };

  setTimeout(() => {
    if (item.parentNode) item.remove();
  }, 5000);
}

function showPoints(text, color, item) {
  const p = document.createElement("span");
  p.className = "points";
  p.textContent = text;
  p.style.color = color;
  p.style.left = item.style.left;
  p.style.top = item.style.top;
  gameArea.appendChild(p);

  setTimeout(() => p.remove(), 1000);
}

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  water = 0;
  time = 60;

  updateDisplays();
  gameArea.innerHTML = "";

  timer = setInterval(() => {
    time--;
    updateDisplays();

    if (time <= 0) loseGame();
  }, 1000);

  spawnTimer = setInterval(spawnObject, 800);
}

function resetGame() {
  clearInterval(timer);
  clearInterval(spawnTimer);

  gameRunning = false;
  score = 0;
  water = 0;
  time = 60;

  overlay.classList.add("hidden");
  gameArea.innerHTML = "";

  updateDisplays();
}

function checkWin() {
  if (water >= 100) {
    endGame("You Win!", "You restored clean water to the island! 🌊✨");
  }
}

function loseGame() {
  endGame("Time's Up", "Try again and clean more of the environment!");
}

function endGame(title, message) {
  clearInterval(timer);
  clearInterval(spawnTimer);
  gameRunning = false;

  overlay.classList.remove("hidden");
  resultTitle.textContent = title;
  resultMessage.textContent = message;

  if (typeof confetti === "function") {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
  }

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
