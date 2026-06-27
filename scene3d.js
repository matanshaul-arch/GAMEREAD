import * as THREE from "./vendor/three.module.js";

const sceneCanvas = document.getElementById("game-map-3d");
const legacyCanvas = document.getElementById("game-map");
const stationPrompt = document.getElementById("station-prompt");
const content = window.LEARNING_CONTENT;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: sceneCanvas,
  alpha: false,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9efff);
scene.fog = new THREE.Fog(0xb9efff, 18, 46);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
camera.position.set(0, 5.6, 10);

const player = {
  position: new THREE.Vector3(-7.5, 0, 5.5),
  rotationY: 0,
  speed: 0.12,
};

const keys = new Set();
const interactables = [];
const rayTarget = new THREE.Vector3();
let playerGroup;
let frameCount = 0;
let promptedStationId = "";

initScene();
resize();
window.learningGame3DReady = true;
sceneCanvas.dataset.ready = "true";
window.addEventListener("resize", resize);
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);
requestAnimationFrame(animate);

function initScene() {
  legacyCanvas.classList.add("hidden");
  sceneCanvas.classList.remove("hidden");

  const ambient = new THREE.HemisphereLight(0xffffff, 0x77a46c, 2.2);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 2.8);
  sun.position.set(-7, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  scene.add(sun);

  createGround();
  createCastle();
  createLearningStations();
  createLetters();
  createDecorations();
  createPlayer();
}

function createGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 28),
    new THREE.MeshStandardMaterial({ color: 0xf5ed8d, roughness: 0.85 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 8),
    new THREE.MeshStandardMaterial({ color: 0x7ee781, roughness: 0.9 })
  );
  grass.position.z = -10;
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  scene.add(grass);

  createPath();
}

function createPath() {
  const material = new THREE.MeshStandardMaterial({ color: 0xffc65d, roughness: 0.8 });
  const points = [
    [-7.5, 5.5], [-5, 4.5], [-2.5, 3.5], [0, 2.8],
    [2.8, 2.1], [5.3, 1.2], [7.6, 0.4],
  ];

  points.forEach(([x, z]) => {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 0.14, 28), material);
    stone.position.set(x, 0.08, z);
    stone.scale.z = 0.72;
    stone.castShadow = true;
    stone.receiveShadow = true;
    scene.add(stone);
  });
}

function createCastle() {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd8e7e8, roughness: 0.75 });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x9aaeb2, roughness: 0.8 });

  const wall = new THREE.Mesh(new THREE.BoxGeometry(15.5, 4.2, 1.1), wallMaterial);
  wall.position.set(1.8, 2.2, -6.4);
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);

  [-6.8, 10.4].forEach((x) => {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.7, 2.2), wallMaterial);
    tower.position.set(x, 2.85, -6.4);
    tower.castShadow = true;
    tower.receiveShadow = true;
    scene.add(tower);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.55, 1.8, 4), new THREE.MeshStandardMaterial({ color: 0x8fb6c3 }));
    roof.position.set(x, 6.55, -6.4);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);
  });

  [-3.5, 1.7, 6.8].forEach((x) => {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.16, 12, 32, Math.PI), trimMaterial);
    arch.position.set(x, 1.35, -5.78);
    arch.rotation.z = Math.PI;
    scene.add(arch);

    const shadow = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.35, 0.08), new THREE.MeshStandardMaterial({ color: 0x89a6ad }));
    shadow.position.set(x, 1.15, -5.72);
    scene.add(shadow);
  });

  for (let i = 0; i < 18; i += 1) {
    const brick = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.06), trimMaterial);
    brick.position.set(-5 + (i % 9) * 1.35, 3.2 + Math.floor(i / 9) * 0.7, -5.78);
    scene.add(brick);
  }
}

function createLearningStations() {
  const stationPositions = [
    { id: "hebrew", x: -4.2, z: 2.8, label: "א" },
    { id: "vowels", x: 0.8, z: 2.4, label: "נ" },
    { id: "english", x: 5.2, z: 1.4, label: "A" },
    { id: "stories", x: 1.5, z: -1.2, label: "ס" },
  ];

  stationPositions.forEach((station) => {
    const world = content.worlds.find((item) => item.id === station.id);
    const group = new THREE.Group();
    group.position.set(station.x, 0, station.z);
    group.userData.worldId = station.id;
    group.userData.challengeIds = world?.challengeIds || [];

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82, 0.96, 0.28, 32),
      new THREE.MeshStandardMaterial({ color: world?.color || 0xffffff, roughness: 0.5 })
    );
    base.position.y = 0.16;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: world?.color || 0x666666, emissiveIntensity: 0.28 })
    );
    marker.position.y = 0.84;
    marker.castShadow = true;
    group.add(marker);

    const text = makeTextSprite(station.label, world?.color || "#ffffff", "#ffffff");
    text.position.set(0, 1.5, 0);
    group.add(text);

    interactables.push(group);
    scene.add(group);
  });
}

function createLetters() {
  const letters = [
    { text: "R", x: -0.8, y: 2.4, z: -2.7, color: "#d66bff" },
    { text: "E", x: 0.8, y: 2.5, z: -2.6, color: "#e772ff" },
    { text: "דּ", x: -2.4, y: 1.5, z: -0.6, color: "#ff5e5e" },
    { text: "ג", x: -1.4, y: 1.75, z: -0.7, color: "#ffce3f" },
  ];

  letters.forEach((letter) => {
    const sprite = makeTextSprite(letter.text, letter.color, "transparent", 92);
    sprite.position.set(letter.x, letter.y, letter.z);
    sprite.scale.set(1.2, 1.2, 1.2);
    scene.add(sprite);
  });
}

function createDecorations() {
  createTree(-8.8, 2.1);
  createTree(8.8, -0.8);
  createMushroom(-6.2, 0.8);
  createMushroom(6.7, 2.6);
  createGem(-7, -1.4, 0x65f4ff);
  createGem(7.4, -2.4, 0xff6ac9);
}

function createTree(x, z) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0xb66b3e }));
  trunk.position.set(x, 0.9, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.7, 7), new THREE.MeshStandardMaterial({ color: 0x68dd36, roughness: 0.55 }));
  leaves.position.set(x, 2.0, z);
  leaves.castShadow = true;
  scene.add(leaves);
}

function createMushroom(x, z) {
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.55, 12), new THREE.MeshStandardMaterial({ color: 0xfff4d8 }));
  stem.position.set(x, 0.28, z);
  scene.add(stem);

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 8), new THREE.MeshStandardMaterial({ color: 0xff4a4a }));
  cap.position.set(x, 0.62, z);
  cap.scale.y = 0.42;
  cap.castShadow = true;
  scene.add(cap);
}

function createGem(x, z, color) {
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.45), new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.25 }));
  gem.position.set(x, 0.7, z);
  gem.castShadow = true;
  scene.add(gem);
}

function createPlayer() {
  playerGroup = new THREE.Group();
  playerGroup.position.copy(player.position);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.7, 6, 12), new THREE.MeshStandardMaterial({ color: 0xf05252 }));
  body.position.y = 0.88;
  body.castShadow = true;
  playerGroup.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffc167 }));
  head.position.y = 1.55;
  head.castShadow = true;
  playerGroup.add(head);

  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.65, 6), new THREE.MeshStandardMaterial({ color: 0x2451c4 }));
  hat.position.y = 2.02;
  hat.castShadow = true;
  playerGroup.add(hat);

  const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 8), new THREE.MeshStandardMaterial({ color: 0x925629 }));
  wand.position.set(0.45, 1.1, 0.15);
  wand.rotation.z = -0.5;
  wand.castShadow = true;
  playerGroup.add(wand);

  scene.add(playerGroup);
}

function makeTextSprite(text, fill, background, size = 74) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (background !== "transparent") {
    context.fillStyle = background;
    context.beginPath();
    context.arc(128, 128, 94, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = fill;
  context.font = `900 ${size}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 132);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.35, 1.35, 1.35);
  return sprite;
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    movePlayerByKey(key, 0.38);
    keys.add(key);
  }

  if (event.code === "Space") {
    const station = getNearbyStation();
    if (station) {
      event.preventDefault();
      const world = content.worlds.find((item) => item.id === station.userData.worldId);
      if (world && window.openLearningChallenge) {
        window.openLearningChallenge(world);
      }
    }
  }
}

function onKeyUp(event) {
  const key = event.key.toLowerCase();
  keys.delete(key);
}

function updatePlayer() {
  const movement = new THREE.Vector3();
  if (keys.has("arrowup") || keys.has("w")) movement.z -= 1;
  if (keys.has("arrowdown") || keys.has("s")) movement.z += 1;
  if (keys.has("arrowleft") || keys.has("a")) movement.x -= 1;
  if (keys.has("arrowright") || keys.has("d")) movement.x += 1;

  if (movement.lengthSq() > 0) {
    applyPlayerMovement(movement, player.speed);
  }

  playerGroup.position.copy(player.position);
  playerGroup.rotation.y = player.rotationY + Math.PI;

  rayTarget.copy(player.position).add(new THREE.Vector3(0, 1.2, 0));
  camera.position.lerp(new THREE.Vector3(player.position.x, 4.9, player.position.z + 8.2), 0.08);
  camera.lookAt(rayTarget);
  updateStationPrompt();
}

function movePlayerByKey(key, amount) {
  const movement = new THREE.Vector3();
  if (key === "arrowup" || key === "w") movement.z -= 1;
  if (key === "arrowdown" || key === "s") movement.z += 1;
  if (key === "arrowleft" || key === "a") movement.x -= 1;
  if (key === "arrowright" || key === "d") movement.x += 1;
  if (movement.lengthSq() > 0) {
    applyPlayerMovement(movement, amount);
  }
}

function applyPlayerMovement(movement, amount) {
  movement.normalize().multiplyScalar(amount);
  player.position.add(movement);
  player.position.x = THREE.MathUtils.clamp(player.position.x, -9.2, 9.2);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -2.4, 6.2);
  player.rotationY = Math.atan2(movement.x, movement.z);
}

function getNearbyStation() {
  return interactables.find((station) => {
    const distance = station.position.distanceTo(player.position);
    return distance < 1.8;
  });
}

function updateStationPrompt() {
  if (!stationPrompt) {
    return;
  }

  const station = getNearbyStation();
  const stationId = station?.userData.worldId || "";
  if (stationId === promptedStationId) {
    return;
  }

  promptedStationId = stationId;
  if (!station) {
    stationPrompt.classList.add("hidden");
    stationPrompt.textContent = "";
    sceneCanvas.dataset.nearStation = "";
    return;
  }

  const world = content.worlds.find((item) => item.id === stationId);
  const worldName = world?.name || "תחנת לימוד";
  stationPrompt.textContent = `הגעת אל ${worldName} - לחץ/י רווח למשימה`;
  stationPrompt.classList.remove("hidden");
  sceneCanvas.dataset.nearStation = stationId;
}

function animate(time) {
  updatePlayer();
  interactables.forEach((station, index) => {
    station.rotation.y = Math.sin(time * 0.001 + index) * 0.08;
    station.children[1].position.y = 0.84 + Math.sin(time * 0.003 + index) * 0.08;
  });
  renderer.render(scene, camera);
  updateRenderStats();
  requestAnimationFrame(animate);
}

function updateRenderStats() {
  frameCount += 1;
  if (frameCount % 20 !== 0) {
    return;
  }

  const gl = renderer.getContext();
  const pixels = new Uint8Array(4 * 12 * 12);
  const width = renderer.domElement.width;
  const height = renderer.domElement.height;
  gl.readPixels(Math.floor(width / 2) - 6, Math.floor(height / 2) - 6, 12, 12, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let nonBlack = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index] > 8 || pixels[index + 1] > 8 || pixels[index + 2] > 8) {
      nonBlack += 1;
    }
  }

  window.learningGame3DStats = {
    frameCount,
    width,
    height,
    sampledPixels: 144,
    nonBlack,
  };
  sceneCanvas.dataset.frameCount = String(frameCount);
  sceneCanvas.dataset.nonBlack = String(nonBlack);
  sceneCanvas.dataset.renderWidth = String(width);
  sceneCanvas.dataset.renderHeight = String(height);
  sceneCanvas.dataset.playerX = player.position.x.toFixed(2);
  sceneCanvas.dataset.playerZ = player.position.z.toFixed(2);
}

function resize() {
  const width = sceneCanvas.clientWidth || 640;
  const height = sceneCanvas.clientHeight || 448;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
