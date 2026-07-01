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
scene.fog = new THREE.Fog(0xb9efff, 20, 50);

const isoTilt = Math.asin(Math.tan(30 * Math.PI / 180));
const isoYaw = Math.PI / 4;
const isoDirection = new THREE.Vector3(
  Math.sin(isoYaw) * Math.cos(isoTilt),
  Math.sin(isoTilt),
  Math.cos(isoYaw) * Math.cos(isoTilt)
).normalize();
const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
camera.position.copy(isoDirection).multiplyScalar(13);

const player = {
  position: new THREE.Vector3(-7.5, 0, 5.5),
  rotationY: 0,
  speed: 0.12,
};

const keys = new Set();
const interactables = [];
const rayTarget = new THREE.Vector3();
const cameraTargetPosition = new THREE.Vector3();
const cameraLookTarget = new THREE.Vector3();
const stationFocusTarget = new THREE.Vector3();
const successEffects = [];
let playerGroup;
let frameCount = 0;
let promptedStationId = "";

initScene();
resize();
window.learningGame3DReady = true;
sceneCanvas.dataset.ready = "true";
window.addEventListener("resize", resize);
window.addEventListener("learning-success", showLearningSuccess);
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
  createAdventureLandmarks();
  createLearningStations();
  createLetters();
  createDecorations();
  createPlayer();
}

function createGround() {
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 34),
    new THREE.MeshStandardMaterial({ color: 0x7bdcff, roughness: 0.42, metalness: 0.04 })
  );
  water.position.y = -0.08;
  water.rotation.x = -Math.PI / 2;
  water.receiveShadow = true;
  scene.add(water);

  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(11.6, 12.4, 0.32, 64),
    new THREE.MeshStandardMaterial({ color: 0x78d66e, roughness: 0.86 })
  );
  ground.position.set(0, 0, 1.4);
  ground.scale.z = 0.62;
  ground.receiveShadow = true;
  ground.castShadow = true;
  scene.add(ground);

  const lowerMeadow = new THREE.Mesh(
    new THREE.CylinderGeometry(8.6, 9.1, 0.18, 56),
    new THREE.MeshStandardMaterial({ color: 0xa6e36a, roughness: 0.88 })
  );
  lowerMeadow.position.set(1.2, 0.1, -1.6);
  lowerMeadow.scale.z = 0.5;
  lowerMeadow.receiveShadow = true;
  lowerMeadow.castShadow = true;
  scene.add(lowerMeadow);

  createZonePad(-4.2, 2.8, 0x5fbd70, 1.75, 1.25);
  createZonePad(0.6, 1.0, 0xffc85d, 1.55, 1.05);
  createZonePad(5.0, 1.3, 0x65c9ff, 1.65, 1.12);
  createZonePad(1.5, -1.3, 0x9a80e8, 1.8, 1.08);

  createPath();
  createBoundaryStones();
}

function createZonePad(x, z, color, radius, depthScale) {
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.08, 0.18, 40),
    new THREE.MeshStandardMaterial({ color, roughness: 0.72 })
  );
  pad.position.set(x, 0.22, z);
  pad.scale.z = depthScale;
  pad.receiveShadow = true;
  pad.castShadow = true;
  scene.add(pad);
}

function createPath() {
  const material = new THREE.MeshStandardMaterial({ color: 0xf7d58c, roughness: 0.8 });
  const points = [
    [-7.5, 5.5], [-5, 4.5], [-2.5, 3.5], [0, 2.8],
    [2.2, 2.0], [4.1, 1.5], [5.3, 1.2],
    [2.3, 0.6], [1.5, -1.2],
  ];

  points.forEach(([x, z]) => {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 0.14, 28), material);
    stone.position.set(x, 0.32, z);
    stone.scale.z = 0.72;
    stone.castShadow = true;
    stone.receiveShadow = true;
    scene.add(stone);
  });
}

function createAdventureLandmarks() {
  createReadingLibrary(-4.2, 2.8);
  createNikudSpring(0.6, 1.0);
  createEnglishTower(5.0, 1.3);
  createDictationGate(1.5, -1.3);
  createSyllableBridge(-1.4, 2.1);
}

function createReadingLibrary(x, z) {
  const wood = new THREE.MeshStandardMaterial({ color: 0xb97a43, roughness: 0.72 });
  const paper = new THREE.MeshStandardMaterial({ color: 0xfff2bd, roughness: 0.78 });

  [-0.75, 0.75].forEach((offset) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.75, 0.28), wood);
    post.position.set(x + offset, 1.05, z - 0.72);
    post.castShadow = true;
    scene.add(post);
  });

  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.12, 12, 32, Math.PI), wood);
  arch.position.set(x, 1.92, z - 0.72);
  arch.rotation.z = Math.PI;
  arch.castShadow = true;
  scene.add(arch);

  for (let index = 0; index < 5; index += 1) {
    const page = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.72), paper);
    page.position.set(x - 1.05 + index * 0.52, 0.46, z + 0.72 + Math.sin(index) * 0.08);
    page.rotation.y = (index - 2) * 0.08;
    page.castShadow = true;
    page.receiveShadow = true;
    scene.add(page);
  }
}

function createNikudSpring(x, z) {
  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.2, 0.34, 32),
    new THREE.MeshStandardMaterial({ color: 0xd9c38d, roughness: 0.7 })
  );
  basin.position.set(x, 0.5, z);
  basin.scale.z = 0.78;
  basin.castShadow = true;
  basin.receiveShadow = true;
  scene.add(basin);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.82, 0.08, 32),
    new THREE.MeshStandardMaterial({ color: 0x55d8ff, emissive: 0x1c8eb4, emissiveIntensity: 0.18, roughness: 0.28 })
  );
  water.position.set(x, 0.72, z);
  water.scale.z = 0.72;
  scene.add(water);

  [
    { text: "ָ", dx: -0.52, dz: -0.18 },
    { text: "ֵ", dx: 0.34, dz: 0.08 },
    { text: "ּ", dx: 0.02, dz: 0.48 },
  ].forEach((mark) => {
    const sprite = makeTextSprite(mark.text, "#ffffff", "transparent", 88);
    sprite.position.set(x + mark.dx, 1.7, z + mark.dz);
    sprite.scale.set(0.85, 0.85, 0.85);
    scene.add(sprite);
  });
}

function createEnglishTower(x, z) {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd8e7e8, roughness: 0.75 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x4d9be8, roughness: 0.62 });

  const tower = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 1.6), wallMaterial);
  tower.position.set(x, 1.9, z - 0.62);
  tower.castShadow = true;
  tower.receiveShadow = true;
  scene.add(tower);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.1, 4), roofMaterial);
  roof.position.set(x, 4.05, z - 0.62);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  scene.add(roof);

  ["C", "A", "T"].forEach((letter, index) => {
    const sprite = makeTextSprite(letter, "#2f7bd3", "#ffffff", 68);
    sprite.position.set(x - 0.52 + index * 0.52, 2.08, z + 0.23);
    sprite.scale.set(0.58, 0.58, 0.58);
    scene.add(sprite);
  });
}

function createDictationGate(x, z) {
  const stone = new THREE.MeshStandardMaterial({ color: 0xc8bedf, roughness: 0.74 });
  const light = new THREE.MeshStandardMaterial({ color: 0xffd56e, emissive: 0xffb52e, emissiveIntensity: 0.35, roughness: 0.48 });

  [-0.78, 0.78].forEach((offset) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 2.1, 10), stone);
    pillar.position.set(x + offset, 1.25, z - 0.58);
    pillar.castShadow = true;
    scene.add(pillar);

    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 10), light);
    lantern.position.set(x + offset, 2.52, z - 0.58);
    lantern.castShadow = true;
    scene.add(lantern);
  });

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.24, 0.36), stone);
  lintel.position.set(x, 2.36, z - 0.58);
  lintel.castShadow = true;
  scene.add(lintel);

  [-0.3, 0, 0.3].forEach((offset, index) => {
    const wave = new THREE.Mesh(new THREE.TorusGeometry(0.34 + index * 0.1, 0.025, 8, 24, Math.PI), light);
    wave.position.set(x + offset, 1.55 + index * 0.16, z - 0.15);
    wave.rotation.z = Math.PI / 2;
    scene.add(wave);
  });
}

function createSyllableBridge(x, z) {
  const material = new THREE.MeshStandardMaterial({ color: 0xe8c575, roughness: 0.78 });
  for (let index = 0; index < 5; index += 1) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.42), material);
    plank.position.set(x + index * 0.62, 0.55, z - index * 0.22);
    plank.rotation.y = -0.18;
    plank.castShadow = true;
    plank.receiveShadow = true;
    scene.add(plank);
  }
}

function createBoundaryStones() {
  const material = new THREE.MeshStandardMaterial({ color: 0xd6e0d0, roughness: 0.82 });
  const points = [
    [-9.5, 4.8], [-8.6, 6.2], [-5.8, 6.7], [-2.4, 6.5], [1.8, 5.5],
    [5.8, 3.8], [8.2, 1.6], [7.4, -2.3], [3.8, -3.5], [-0.2, -3.4],
    [-4.6, -2.4], [-8.8, 0.2],
  ];

  points.forEach(([x, z], index) => {
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.34 + (index % 3) * 0.05), material);
    stone.position.set(x, 0.48, z);
    stone.rotation.set(index * 0.22, index * 0.35, index * 0.15);
    stone.castShadow = true;
    scene.add(stone);
  });
}

function createLearningStations() {
  const stationPositions = [
    { id: "hebrew", x: -4.2, z: 2.8, label: "א" },
    { id: "vowels", x: 0.6, z: 1.0, label: "נ" },
    { id: "english", x: 5.0, z: 1.3, label: "A" },
    { id: "stories", x: 1.5, z: -1.3, label: "ס" },
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
    base.position.y = 0.5;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: world?.color || 0x666666, emissiveIntensity: 0.28 })
    );
    marker.position.y = 1.18;
    marker.castShadow = true;
    group.add(marker);

    const text = makeTextSprite(station.label, world?.color || "#ffffff", "#ffffff");
    text.position.set(0, 1.84, 0);
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
  createTree(-8.4, 2.1);
  createTree(-6.6, -0.8);
  createTree(7.5, 2.8);
  createTree(6.8, -1.5);
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

function showLearningSuccess(event) {
  const station = getNearbyStation();
  const center = station?.position || player.position;
  const gateOpened = Boolean(event.detail?.gateOpened);
  const color = gateOpened ? 0xffd45c : 0x8cffd1;
  const effect = new THREE.Group();
  effect.position.set(center.x, 0.72, center.z);

  const ringMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: gateOpened ? 0.85 : 0.55,
    opacity: 0.88,
    transparent: true,
    roughness: 0.35,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(gateOpened ? 1.18 : 0.92, 0.045, 10, 40), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  effect.add(ring);

  const particles = [];
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    const particleMaterial = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.65,
      opacity: 0.95,
      transparent: true,
      roughness: 0.45,
    });
    const particle = new THREE.Mesh(new THREE.OctahedronGeometry(gateOpened ? 0.16 : 0.12), particleMaterial);
    particle.userData.angle = angle;
    particle.userData.radius = gateOpened ? 0.86 : 0.68;
    particle.position.set(Math.cos(angle) * particle.userData.radius, 0.35, Math.sin(angle) * particle.userData.radius);
    particles.push(particle);
    effect.add(particle);
  }

  successEffects.push({
    group: effect,
    ring,
    particles,
    startTime: performance.now(),
    duration: gateOpened ? 1900 : 1450,
  });
  scene.add(effect);
  sceneCanvas.dataset.successFeedback = String(Number(sceneCanvas.dataset.successFeedback || 0) + 1);
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

function updatePlayer(time) {
  const movement = new THREE.Vector3();
  if (keys.has("arrowup") || keys.has("w")) movement.z -= 1;
  if (keys.has("arrowdown") || keys.has("s")) movement.z += 1;
  if (keys.has("arrowleft") || keys.has("a")) movement.x -= 1;
  if (keys.has("arrowright") || keys.has("d")) movement.x += 1;

  const isMoving = movement.lengthSq() > 0;
  if (isMoving) {
    applyPlayerMovement(movement, player.speed);
  }

  playerGroup.position.copy(player.position);
  playerGroup.position.y = isMoving ? Math.sin(time * 0.012) * 0.04 : Math.sin(time * 0.003) * 0.025;
  playerGroup.rotation.y = player.rotationY + Math.PI;

  updateCamera();
  updateStationPrompt();
}

function updateCamera() {
  const station = getNearbyStation();
  const aspect = camera.aspect || 1;
  const cameraDistance = aspect < 1 ? 17.4 : 15.6;
  const lookAhead = aspect < 1 ? 0.2 : 0.5;

  cameraLookTarget.copy(player.position).add(rayTarget.set(0, 1.22, 0));
  if (station) {
    stationFocusTarget.copy(station.position).add(rayTarget.set(0, 1.15, 0));
    cameraLookTarget.lerp(stationFocusTarget, 0.35);
  }

  cameraLookTarget.z -= lookAhead;
  cameraTargetPosition.copy(cameraLookTarget).addScaledVector(isoDirection, cameraDistance);
  camera.position.lerp(cameraTargetPosition, 0.075);
  camera.lookAt(cameraLookTarget);
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
  player.position.x = THREE.MathUtils.clamp(player.position.x, -9.0, 8.6);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -2.6, 6.2);
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
  updatePlayer(time);
  interactables.forEach((station, index) => {
    station.rotation.y = Math.sin(time * 0.001 + index) * 0.08;
    station.children[1].position.y = 1.18 + Math.sin(time * 0.003 + index) * 0.08;
  });
  updateSuccessEffects(time);
  renderer.render(scene, camera);
  updateRenderStats();
  requestAnimationFrame(animate);
}

function updateSuccessEffects(time) {
  for (let index = successEffects.length - 1; index >= 0; index -= 1) {
    const effect = successEffects[index];
    const progress = Math.min((time - effect.startTime) / effect.duration, 1);
    const fade = 1 - progress;
    effect.group.position.y = 0.72 + progress * 0.38;
    effect.ring.scale.setScalar(1 + progress * 0.42);
    effect.ring.material.opacity = fade * 0.88;
    effect.particles.forEach((particle, particleIndex) => {
      const angle = particle.userData.angle + progress * 0.85;
      const radius = particle.userData.radius + progress * 0.42;
      particle.position.set(
        Math.cos(angle) * radius,
        0.35 + Math.sin(progress * Math.PI + particleIndex) * 0.12 + progress * 0.34,
        Math.sin(angle) * radius
      );
      particle.rotation.y += 0.08;
      particle.material.opacity = fade * 0.95;
    });

    if (progress >= 1) {
      scene.remove(effect.group);
      successEffects.splice(index, 1);
    }
  }
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
  const aspect = width / height;
  const viewHeight = aspect < 1 ? 12.4 : 11.2;
  const viewWidth = viewHeight * aspect;
  renderer.setSize(width, height, false);
  camera.left = -viewWidth / 2;
  camera.right = viewWidth / 2;
  camera.top = viewHeight / 2;
  camera.bottom = -viewHeight / 2;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
