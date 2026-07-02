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

const pointSound = new Audio("point.mp3");
pointSound.preload = "auto";

const winSound = new Audio("win.mp3");
winSound.preload = "auto";

const lossSound = new Audio("loss.mp3");
lossSound.preload = "auto";

let score = 0;
let clean = 0;
let time = 60;
let lives = 3;
let bestScore = parseInt(localStorage.getItem("oceanBestScore"), 10) || 0;

let running = false;
let timer;
let spawnTimer;

const difficultyModes = [
  {
    id: "easy",
    label: "Easy",
    timeLimit: 90,
    cleanGoal: 80,
    initialLives: 4,
    spawnBase: 900,
    trashWeight: 0.7,
    fishWeight: 0.15,
    jellyfishWeight: 0.08,
    seaweedWeight: 0.04,
    crabWeight: 0.03
  },
  {
    id: "normal",
    label: "Normal",
    timeLimit: 60,
    cleanGoal: 100,
    initialLives: 3,
    spawnBase: 700,
    trashWeight: 0.55,
    fishWeight: 0.2,
    jellyfishWeight: 0.1,
    seaweedWeight: 0.08,
    crabWeight: 0.07
  },
  {
    id: "hard",
    label: "Hard",
    timeLimit: 45,
    cleanGoal: 100,
    initialLives: 2,
    spawnBase: 500,
    trashWeight: 0.4,
    fishWeight: 0.25,
    jellyfishWeight: 0.15,
    seaweedWeight: 0.1,
    crabWeight: 0.1
  }
];

const difficultyMap = Object.fromEntries(difficultyModes.map((mode) => [mode.id, mode]));
let currentDifficulty = "normal";
let currentCleanGoal = difficultyMap[currentDifficulty].cleanGoal;
let currentSpawnBase = difficultyMap[currentDifficulty].spawnBase;
let currentTimeLimit = difficultyMap[currentDifficulty].timeLimit;

const milestoneMessages = [
  { threshold: 10, text: "🌟 Halfway there! Keep the shoreline sparkling." },
  { threshold: 20, text: "💧 Great momentum — the beach is getting brighter." },
  { threshold: 30, text: "🌊 Fantastic work! You are making a real splash." },
  { threshold: 40, text: "🏖️ Amazing cleanup energy — the shore looks better already." }
];

let reachedMilestones = new Set();

const itemTypes = {
  trash: {
    className: "trash",
    emoji: "🥤",
    score: 10,
    clean: 5,
    message: "✅ Trash collected! The beach is looking brighter."
  },
  fish: {
    className: "fish",
    emoji: "🐟",
    score: -5,
    life: -1,
    message: "⚠️ Fish belong in the ocean — leave them be."
  },
  jellyfish: {
    className: "jellyfish",
    emoji: "🪼",
    score: -8,
    clean: -3,
    life: -1,
    message: "⚠️ A jellyfish sting slows the cleanup."
  },
  seaweed: {
    className: "seaweed",
    emoji: "🌿",
    score: -6,
    life: -1,
    message: "⚠️ Seaweed tangles the cleanup crew."
  },
  crab: {
    className: "crab",
    emoji: "🦀",
    score: -7,
    life: -1,
    message: "⚠️ Crabs are beach helpers — avoid them!"
  }
};

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
  cleanEl.textContent = `${clean}/${currentCleanGoal}`;
  const cleanProgress = currentCleanGoal > 0 ? (clean / currentCleanGoal) * 100 : 0;
  cleanBarEl.style.width = `${clamp(cleanProgress, 0, 100)}%`;
  timerEl.textContent = time < 10 ? `0${time}` : time;
  livesEl.textContent = lives;
  startBtn.disabled = running;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function checkMilestones() {
  milestoneMessages.forEach((milestone) => {
    if (score >= milestone.threshold && !reachedMilestones.has(milestone.threshold)) {
      reachedMilestones.add(milestone.threshold);
      setMessage(milestone.text);
    }
  });
}

function playPointSound() {
  pointSound.currentTime = 0;
  pointSound.play().catch(() => {
    // Ignore autoplay restrictions or missing audio support.
  });
}

function playWinSound() {
  winSound.currentTime = 0;
  winSound.play().catch(() => {
    // Ignore autoplay restrictions or missing audio support.
  });
}

function playLossSound() {
  lossSound.currentTime = 0;
  lossSound.play().catch(() => {
    // Ignore autoplay restrictions or missing audio support.
  });
}

function createConfetti() {
  const colors = [
    "#ff4757",
    "#ffa502",
    "#2ed573",
    "#1e90ff",
    "#70a1ff",
    "#ff6b81",
    "#2f3542",
    "#ff7f50",
    "#3742fa",
    "#70ffea",
    "#eccc68",
    "#fffa65"
  ];
  const confettiCount = 110;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < confettiCount; i += 1) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `-30px`;
    confetti.style.setProperty("--x", `${(Math.random() - 0.5) * 260}px`);
    confetti.style.setProperty("--rotation", `${Math.random() * 360}deg`);
    confetti.style.animationDelay = `${Math.random() * 0.8}s`;
    confetti.style.width = `${5 + Math.random() * 10}px`;
    confetti.style.height = `${10 + Math.random() * 14}px`;
    confetti.style.position = "fixed";
    confetti.style.zIndex = "9999";
    confetti.style.opacity = "0.98";
    confetti.style.willChange = "transform, opacity";
    fragment.appendChild(confetti);
  }

  document.body.appendChild(fragment);
  setTimeout(() => {
    document.querySelectorAll(".confetti").forEach((piece) => piece.remove());
  }, 5000);
}

function clearItems() {
  gameArea.querySelectorAll(".item").forEach((item) => item.remove());
}

function getSpawnPosition(size) {
  const areaRect = gameArea.getBoundingClientRect();
  const safeWidth = Math.max(areaRect.width - size - 24, 0);
  const safeHeight = Math.max(areaRect.height - size - 120, 0);
  const anchorPoints = [
    { x: 0.12, y: 0.2 },
    { x: 0.34, y: 0.16 },
    { x: 0.62, y: 0.2 },
    { x: 0.82, y: 0.16 },
    { x: 0.18, y: 0.44 },
    { x: 0.5, y: 0.42 },
    { x: 0.74, y: 0.46 },
    { x: 0.28, y: 0.68 },
    { x: 0.64, y: 0.7 }
  ];

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const anchor = anchorPoints[Math.floor(Math.random() * anchorPoints.length)];
    const jitterX = (Math.random() - 0.5) * 0.16 * safeWidth;
    const jitterY = (Math.random() - 0.5) * 0.14 * safeHeight;
    const left = clamp(anchor.x * safeWidth + jitterX, 0, safeWidth);
    const top = clamp(anchor.y * safeHeight + jitterY, 0, safeHeight);

    const candidateRect = {
      left: left + areaRect.left,
      top: top + areaRect.top,
      right: left + size + areaRect.left,
      bottom: top + size + areaRect.top
    };

    const overlapsExisting = Array.from(gameArea.querySelectorAll(".item")).some((existingItem) => {
      const existingRect = existingItem.getBoundingClientRect();
      return candidateRect.right > existingRect.left && candidateRect.left < existingRect.right && candidateRect.bottom > existingRect.top && candidateRect.top < existingRect.bottom;
    });

    if (!overlapsExisting) {
      return { left, top };
    }
  }

  return {
    left: Math.random() * safeWidth,
    top: Math.random() * safeHeight
  };
}

function updateDifficultyButtons() {
  document.querySelectorAll(".difficulty-btn").forEach((button) => {
    const isActive = button.dataset.difficulty === currentDifficulty;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setDifficulty(modeId) {
  const mode = difficultyMap[modeId];
  if (!mode) return;

  currentDifficulty = modeId;
  currentCleanGoal = mode.cleanGoal;
  currentSpawnBase = mode.spawnBase;
  currentTimeLimit = mode.timeLimit;
  updateDifficultyButtons();

  if (!running) {
    setMessage(`${mode.label} mode ready: ${mode.timeLimit}s, ${mode.cleanGoal}% cleanup goal, and ${mode.initialLives} lives.`);
  }
}

function getRandomType() {
  const mode = difficultyMap[currentDifficulty];
  const roll = Math.random();
  const trashWeight = mode.trashWeight;
  const fishWeight = trashWeight + mode.fishWeight;
  const jellyWeight = fishWeight + mode.jellyfishWeight;
  const seaweedWeight = jellyWeight + mode.seaweedWeight;

  if (roll < trashWeight) return "trash";
  if (roll < fishWeight) return "fish";
  if (roll < jellyWeight) return "jellyfish";
  if (roll < seaweedWeight) return "seaweed";
  return "crab";
}

function spawn() {
  if (!running) return;

  const item = document.createElement("div");
  const type = getRandomType();
  const itemConfig = itemTypes[type];

  item.className = `item ${itemConfig.className}`;
  item.textContent = itemConfig.emoji;
  item.dataset.type = type;

  const size = 34 + Math.random() * 18;
  item.style.width = `${size}px`;
  item.style.height = `${size}px`;
  item.style.lineHeight = `${size}px`;
  item.style.fontSize = `${size * 0.75}px`;

  const position = getSpawnPosition(size);
  item.style.left = `${position.left}px`;
  item.style.top = `${position.top}px`;
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
        const itemConfig = itemTypes[item.dataset.type];
        const scoreGain = itemConfig.score || 0;
        score = Math.max(0, score + scoreGain);
        clean = clamp(clean + (itemConfig.clean || 0), 0, currentCleanGoal);
        lives = Math.max(0, lives + (itemConfig.life || 0));
        setMessage(itemConfig.message);

        if (scoreGain > 0) {
          playPointSound();
        }

        item.remove();
        checkMilestones();
        update();

        if (clean >= currentCleanGoal) {
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

  const mode = difficultyMap[currentDifficulty];
  running = true;
  score = 0;
  clean = 0;
  time = mode.timeLimit;
  lives = mode.initialLives;
  reachedMilestones = new Set();
  currentCleanGoal = mode.cleanGoal;
  currentSpawnBase = mode.spawnBase;
  currentTimeLimit = mode.timeLimit;

  clearItems();
  setMessage(`Drag trash into the bin, dodge beach hazards, and clean ${mode.cleanGoal}% of the shore in ${mode.timeLimit}s!`);
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

  spawnTimer = setInterval(spawn, currentSpawnBase);
  spawn();
}

function resetGame() {
  running = false;
  clearInterval(timer);
  clearInterval(spawnTimer);
  const mode = difficultyMap[currentDifficulty];
  score = 0;
  clean = 0;
  time = mode.timeLimit;
  lives = mode.initialLives;
  reachedMilestones = new Set();
  currentCleanGoal = mode.cleanGoal;
  currentSpawnBase = mode.spawnBase;
  currentTimeLimit = mode.timeLimit;
  clearItems();
  setMessage("Press Start to begin cleaning the beach for Charity Water.");
  update();
}

function win() {
  if (!running) return;
  running = false;
  clearInterval(timer);
  clearInterval(spawnTimer);
  const donationAmount = Math.floor(score / 100);
  setMessage(
    `🎉 You cleaned the shore! Great job! ${donationAmount} donation${donationAmount === 1 ? "" : "s"} toward Charity Water.`
  );
  playWinSound();
  createConfetti();
  update();
}

function lose() {
  if (!running) return;
  running = false;
  clearInterval(timer);
  clearInterval(spawnTimer);
  setMessage("💀 Game Over — try again and beat your best score!");
  playLossSound();
  update();
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

document.querySelectorAll(".difficulty-btn").forEach((button) => {
  button.addEventListener("click", () => setDifficulty(button.dataset.difficulty));
});

updateDifficultyButtons();
update();
