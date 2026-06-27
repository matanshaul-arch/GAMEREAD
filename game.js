"use strict";

const canvas = document.getElementById("game-map");
const ctx = canvas.getContext("2d");

const idleCard = document.getElementById("idle-card");
const challengeCard = document.getElementById("challenge-card");
const challengeWorld = document.getElementById("challenge-world");
const challengeTitle = document.getElementById("challenge-title");
const challengeRule = document.getElementById("challenge-rule");
const storySection = document.getElementById("story-section");
const storyText = document.getElementById("story-text");
const voiceStatus = document.getElementById("voice-status");
const wordTarget = document.getElementById("word-target");
const letterBank = document.getElementById("letter-bank");
const answerSlots = document.getElementById("answer-slots");
const typedAnswer = document.getElementById("typed-answer");
const typingLabel = document.getElementById("typing-label");
const feedback = document.getElementById("feedback");
const starCount = document.getElementById("star-count");
const gateCount = document.getElementById("gate-count");

const TILE = 64;
const COLS = 10;
const ROWS = 7;

const player = {
  x: 1,
  y: 5,
  stars: 0,
  gates: 0,
};

const learningContent = window.LEARNING_CONTENT;
const worlds = learningContent.worlds;
const challenges = learningContent.challenges;

const blockedTiles = new Set(["0,0", "1,0", "9,6", "6,0", "6,1"]);
const keys = new Set();
let activeChallenge = null;
let lastMoveTime = 0;

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMapBackground();

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const blocked = blockedTiles.has(`${x},${y}`);
      ctx.fillStyle = blocked ? "rgba(75, 111, 127, 0.46)" : "rgba(255, 255, 255, 0.12)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
    }
  }

  drawDecorations();
  drawPaths();
  worlds.forEach(drawWorld);
  drawPlayer();
}

function drawMapBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#74d6ff");
  sky.addColorStop(0.58, "#baf1ff");
  sky.addColorStop(1, "#71c878");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCloud(72, 58, 1.1);
  drawCloud(500, 76, 0.82);
  drawCloud(318, 32, 0.62);

  ctx.fillStyle = "#64bf6a";
  ctx.beginPath();
  ctx.ellipse(210, 450, 290, 120, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4fac61";
  ctx.beginPath();
  ctx.ellipse(520, 454, 250, 112, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(x, y, scale) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  ctx.beginPath();
  ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, y - 8 * scale, 24 * scale, 0, Math.PI * 2);
  ctx.arc(x + 48 * scale, y, 18 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawDecorations() {
  drawTree(70, 342, 0.9);
  drawTree(575, 332, 0.75);
  drawGem(116, 104, "#ffd54d");
  drawGem(585, 150, "#78e3ff");
}

function drawTree(x, y, scale) {
  ctx.fillStyle = "#8c5a2b";
  ctx.fillRect(x - 5 * scale, y - 12 * scale, 10 * scale, 32 * scale);
  ctx.fillStyle = "#1fa86d";
  ctx.beginPath();
  ctx.arc(x, y - 24 * scale, 24 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#37c982";
  ctx.beginPath();
  ctx.arc(x - 12 * scale, y - 30 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.arc(x + 14 * scale, y - 36 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawGem(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 16);
  ctx.lineTo(x + 14, y);
  ctx.lineTo(x, y + 18);
  ctx.lineTo(x - 14, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawPaths() {
  const pathTiles = [
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5],
    [2, 4], [2, 3], [2, 2], [4, 4], [4, 3], [4, 2], [4, 1],
    [5, 4], [5, 3], [8, 4], [8, 3], [8, 2],
  ];

  pathTiles.forEach(([x, y]) => {
    const cx = x * TILE + TILE / 2;
    const cy = y * TILE + TILE / 2;
    ctx.fillStyle = "#ffcf67";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f3a83e";
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function drawWorld(world) {
  const cx = world.x * TILE + TILE / 2;
  const cy = world.y * TILE + TILE / 2;
  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.beginPath();
  ctx.arc(cx, cy, 33, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = world.color;
  ctx.beginPath();
  ctx.arc(cx, cy, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#fffaf0";
  ctx.font = "bold 21px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(getWorldMarker(world), cx, cy);
  ctx.fillStyle = "#17324a";
  ctx.font = "bold 12px Arial";
  ctx.fillText(world.name, cx, cy + 43);
}

function getWorldMarker(world) {
  if (world.id === "english") {
    return "A";
  }
  if (world.id === "stories") {
    return "ס";
  }
  return "א";
}

function drawPlayer() {
  const px = player.x * TILE + TILE / 2;
  const py = player.y * TILE + TILE / 2;
  ctx.fillStyle = "rgba(22, 73, 105, 0.22)";
  ctx.beginPath();
  ctx.ellipse(px, py + 25, 25, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#244c9a";
  ctx.beginPath();
  ctx.arc(px, py - 6, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffbf4e";
  ctx.beginPath();
  ctx.arc(px - 5, py - 8, 4, 0, Math.PI * 2);
  ctx.arc(px + 5, py - 8, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f35f5f";
  drawRoundedRect(px - 17, py + 5, 34, 24, 8);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(px - 5, py - 8, 1.5, 0, Math.PI * 2);
  ctx.arc(px + 5, py - 8, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fffaf0";
  ctx.font = "bold 17px Arial";
  ctx.textAlign = "center";
  ctx.fillText("★", px, py + 20);
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();
}

function tryMove(dx, dy) {
  const nextX = player.x + dx;
  const nextY = player.y + dy;
  const outOfBounds = nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS;
  if (outOfBounds || blockedTiles.has(`${nextX},${nextY}`)) {
    return;
  }

  player.x = nextX;
  player.y = nextY;
  drawMap();
}

function getNearbyWorld() {
  return worlds.find((world) => {
    const distance = Math.abs(world.x - player.x) + Math.abs(world.y - player.y);
    return distance <= 1;
  });
}

function openChallenge(world) {
  const challengeId = world.challengeIds[player.stars % world.challengeIds.length];
  activeChallenge = challenges[challengeId];
  idleCard.classList.add("hidden");
  challengeCard.classList.remove("hidden");
  challengeWorld.textContent = activeChallenge.world;
  challengeTitle.textContent = activeChallenge.title;
  challengeRule.textContent = activeChallenge.rule;
  wordTarget.textContent = activeChallenge.target;
  wordTarget.dir = activeChallenge.direction;
  answerSlots.dir = activeChallenge.direction;
  letterBank.dir = activeChallenge.direction;
  typedAnswer.dir = activeChallenge.direction;
  typedAnswer.value = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  typingLabel.textContent = activeChallenge.direction === "rtl" ? "או הקלד/י כאן:" : "Or type here:";
  renderStory(activeChallenge);
  renderLetters(activeChallenge.letters);
}

window.openLearningChallenge = openChallenge;

function renderStory(challenge) {
  if (challenge.mode !== "story") {
    storySection.classList.add("hidden");
    storyText.textContent = "";
    voiceStatus.textContent = "";
    return;
  }

  storySection.classList.remove("hidden");
  storyText.textContent = challenge.story;
  storyText.dir = challenge.direction;
  voiceStatus.textContent = canSpeak()
    ? "ההקראה זמינה בדפדפן הזה."
    : "הקראה קולית אינה זמינה בדפדפן הזה; אפשר לקרוא את הטקסט על המסך.";
}

function renderLetters(letters) {
  letterBank.innerHTML = "";
  answerSlots.innerHTML = "";
  letters.forEach((letter, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.textContent = letter;
    tile.draggable = true;
    tile.dataset.letter = letter;
    tile.dataset.tileId = `${letter}-${index}`;
    tile.addEventListener("click", () => moveTile(tile, answerSlots));
    tile.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", tile.dataset.tileId);
    });
    letterBank.appendChild(tile);
  });
}

function moveTile(tile, target) {
  target.appendChild(tile);
  tile.addEventListener("click", () => {
    const parent = tile.parentElement === answerSlots ? letterBank : answerSlots;
    moveTile(tile, parent);
  }, { once: true });
}

function setupDropZone(zone) {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    const tileId = event.dataTransfer.getData("text/plain");
    const tile = document.querySelector(`[data-tile-id="${CSS.escape(tileId)}"]`);
    if (tile) {
      moveTile(tile, zone);
    }
  });
}

function normalizeAnswer(value) {
  return value.replace(/\s+/g, "").trim();
}

function getBuiltAnswer() {
  return Array.from(answerSlots.querySelectorAll(".tile"))
    .map((tile) => tile.dataset.letter)
    .join("");
}

function checkAnswer() {
  if (!activeChallenge) {
    return;
  }

  const typed = normalizeAnswer(typedAnswer.value);
  const built = normalizeAnswer(getBuiltAnswer());
  const answer = normalizeAnswer(activeChallenge.answer);
  const correct = typed === answer || built === answer;

  if (correct) {
    player.stars += 1;
    if (player.stars % 3 === 0) {
      player.gates += 1;
    }
    updateStats();
    feedback.textContent = player.stars % 3 === 0
      ? "מצוין! שלוש הצלחות פתחו שער חדש במפה."
      : "נכון מאוד. חזרתיות קצרה עוזרת למוח לזכור.";
    feedback.className = "feedback good";
    drawMap();
    return;
  }

  feedback.textContent = "עוד ניסיון. בדוק/בדקי את הסדר ואת הניקוד, ואז נסה/י שוב.";
  feedback.className = "feedback try";
}

function speakText(text, lang) {
  if (!canSpeak()) {
    feedback.textContent = "הדפדפן הזה לא תומך בהקראה קולית.";
    feedback.className = "feedback try";
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang || activeChallenge?.speechLang || "he-IL";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function canSpeak() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function updateStats() {
  starCount.textContent = String(player.stars);
  gateCount.textContent = String(player.gates);
}

function closeChallenge() {
  activeChallenge = null;
  challengeCard.classList.add("hidden");
  idleCard.classList.remove("hidden");
}

function handleActionKey() {
  if (!challengeCard.classList.contains("hidden")) {
    return;
  }

  const world = getNearbyWorld();
  if (world) {
    openChallenge(world);
  }
}

function moveFromKey(key) {
  if (key === "ArrowUp" || key === "w") {
    tryMove(0, -1);
    return true;
  }
  if (key === "ArrowDown" || key === "s") {
    tryMove(0, 1);
    return true;
  }
  if (key === "ArrowLeft" || key === "a") {
    tryMove(-1, 0);
    return true;
  }
  if (key === "ArrowRight" || key === "d") {
    tryMove(1, 0);
    return true;
  }
  return false;
}

function gameLoop(time) {
  if (time - lastMoveTime > 140) {
    for (const key of keys) {
      if (moveFromKey(key)) {
        lastMoveTime = time;
        break;
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    if (!keys.has(key)) {
      moveFromKey(key);
      lastMoveTime = performance.now();
    }
    keys.add(key);
  }

  if (event.code === "Space") {
    event.preventDefault();
    handleActionKey();
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});

document.getElementById("check-answer").addEventListener("click", checkAnswer);
document.getElementById("hint-button").addEventListener("click", () => {
  if (activeChallenge) {
    feedback.textContent = activeChallenge.hint;
    feedback.className = "feedback";
  }
});
document.getElementById("close-challenge").addEventListener("click", closeChallenge);
document.getElementById("read-story").addEventListener("click", () => {
  if (activeChallenge?.story) {
    speakText(activeChallenge.story, activeChallenge.speechLang);
  }
});
document.getElementById("play-dictation").addEventListener("click", () => {
  if (activeChallenge?.dictationPrompt) {
    speakText(activeChallenge.dictationPrompt, activeChallenge.speechLang);
  }
});

setupDropZone(letterBank);
setupDropZone(answerSlots);
updateStats();
drawMap();
requestAnimationFrame(gameLoop);
