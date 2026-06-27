"use strict";

const canvas = document.getElementById("game-map");
const ctx = canvas.getContext("2d");

const idleCard = document.getElementById("idle-card");
const challengeCard = document.getElementById("challenge-card");
const challengeWorld = document.getElementById("challenge-world");
const challengeTitle = document.getElementById("challenge-title");
const challengeRule = document.getElementById("challenge-rule");
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

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const blocked = blockedTiles.has(`${x},${y}`);
      ctx.fillStyle = blocked ? "#8a805f" : (x + y) % 2 === 0 ? "#d9efd8" : "#cbe5ca";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      ctx.strokeStyle = "rgba(24, 33, 47, 0.12)";
      ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
    }
  }

  drawPaths();
  worlds.forEach(drawWorld);
  drawPlayer();
}

function drawPaths() {
  const pathTiles = [
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5],
    [2, 4], [2, 3], [2, 2], [5, 4], [5, 3], [8, 4], [8, 3], [8, 2],
  ];

  ctx.fillStyle = "#d2ba80";
  pathTiles.forEach(([x, y]) => {
    ctx.fillRect(x * TILE + 8, y * TILE + 8, TILE - 16, TILE - 16);
  });
}

function drawWorld(world) {
  const cx = world.x * TILE + TILE / 2;
  const cy = world.y * TILE + TILE / 2;
  ctx.fillStyle = world.color;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fffaf0";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(world.id === "english" ? "A" : "א", cx, cy);
}

function drawPlayer() {
  const px = player.x * TILE + TILE / 2;
  const py = player.y * TILE + TILE / 2;
  ctx.fillStyle = "#26334a";
  ctx.beginPath();
  ctx.arc(px, py - 6, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8f4c42";
  ctx.fillRect(px - 16, py + 6, 32, 20);
  ctx.fillStyle = "#fffaf0";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("★", px, py + 18);
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
  renderLetters(activeChallenge.letters);
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

setupDropZone(letterBank);
setupDropZone(answerSlots);
updateStats();
drawMap();
requestAnimationFrame(gameLoop);
