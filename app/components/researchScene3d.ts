import * as THREE from "three";

export type PointerState = { x: number; y: number };

export type SceneBundle = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update: (progress: number, pointer: PointerState) => void;
  dispose: () => void;
};

const PALETTE = {
  paper: 0xf2efe7,
  graphite: 0x46565c,
  graphiteSoft: 0x718085,
  silver: 0xb8c1c0,
  teal: 0x32a6a2,
  cyan: 0x71d6d1,
  copper: 0xc47a49,
  amber: 0xe5a84b,
  violet: 0x8e78dd,
  board: 0x38605a,
  dark: 0x39464b,
  white: 0xf7f5ef,
};

const v3 = (values: [number, number, number]) => new THREE.Vector3(...values);
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function material(
  color: number,
  options: Partial<THREE.MeshStandardMaterialParameters> = {},
) {
  const parameters: THREE.MeshStandardMaterialParameters = {
    color,
    emissive: color,
    emissiveIntensity: 0.16,
    roughness: 0.5,
    metalness: 0.26,
    ...options,
  };
  parameters.metalness = Math.min(parameters.metalness ?? 0.26, 0.4);
  return new THREE.MeshStandardMaterial(parameters);
}

function addBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  meshMaterial: THREE.Material,
  edgeColor?: number,
) {
  const geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.position.set(...position);
  parent.add(mesh);

  if (edgeColor !== undefined) {
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 24),
      new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.34 }),
    );
    mesh.add(edges);
  }

  return mesh;
}

function addCylinder(
  parent: THREE.Object3D,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  position: [number, number, number],
  meshMaterial: THREE.Material,
  rotation: [number, number, number] = [0, 0, 0],
  segments = 18,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    meshMaterial,
  );
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}

function addTube(
  parent: THREE.Object3D,
  points: Array<[number, number, number]>,
  radius: number,
  meshMaterial: THREE.Material,
) {
  const curve = new THREE.CatmullRomCurve3(points.map(v3));
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), radius, 8, false),
    meshMaterial,
  );
  parent.add(mesh);
  return mesh;
}

function addEnvironment(scene: THREE.Scene, gridSize = 28) {
  scene.background = new THREE.Color(PALETTE.paper);
  scene.fog = new THREE.Fog(PALETTE.paper, 27, 62);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d0bf, 2.9);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 5.1);
  key.position.set(8, 13, 11);
  scene.add(key);

  const fill = new THREE.DirectionalLight(PALETTE.cyan, 1.7);
  fill.position.set(-9, 5, 4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffd6ad, 1.15);
  rim.position.set(2, 7, -11);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(gridSize, gridSize),
    new THREE.MeshStandardMaterial({ color: PALETTE.paper, roughness: 0.95, metalness: 0 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.15;
  scene.add(floor);

  const grid = new THREE.GridHelper(gridSize, Math.round(gridSize), 0x88979a, 0xc8cfcc);
  grid.position.y = -1.135;
  const gridMaterial = grid.material as THREE.LineBasicMaterial;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.16;
  scene.add(grid);
}

function addContactDisc(
  parent: THREE.Object3D,
  radius: number,
  position: [number, number, number],
  opacity = 0.12,
) {
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshBasicMaterial({ color: 0x354246, transparent: true, opacity, depthWrite: false }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(...position);
  parent.add(disc);
  return disc;
}

function setCamera(
  camera: THREE.PerspectiveCamera,
  progress: number,
  pointer: PointerState,
  from: [number, number, number],
  to: [number, number, number],
  targetFrom: [number, number, number],
  targetTo: [number, number, number],
  pointerStrength = 0.2,
) {
  const eased = smooth(progress);
  camera.position.lerpVectors(v3(from), v3(to), eased);
  camera.position.x += pointer.x * pointerStrength;
  camera.position.y += pointer.y * pointerStrength;
  const target = v3(targetFrom).lerp(v3(targetTo), eased);
  camera.lookAt(target);
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((item) => item.dispose());
    }
  });
}

function createCamera() {
  return new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 120);
}

function createCampusScene(): SceneBundle {
  const scene = new THREE.Scene();
  addEnvironment(scene, 34);
  const camera = createCamera();

  const graphite = material(PALETTE.graphite, { roughness: 0.55, metalness: 0.5 });
  const graphiteSoft = material(PALETTE.graphiteSoft, { roughness: 0.62, metalness: 0.35 });
  const silver = material(PALETTE.silver, { roughness: 0.46, metalness: 0.56 });
  const copper = material(PALETTE.copper, { roughness: 0.38, metalness: 0.72 });
  const cyan = material(PALETTE.cyan, { roughness: 0.25, metalness: 0.42, emissive: PALETTE.teal, emissiveIntensity: 0.15 });
  const violet = material(PALETTE.violet, { roughness: 0.3, metalness: 0.36, emissive: PALETTE.violet, emissiveIntensity: 0.22 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xd9e5e1,
    transmission: 0.2,
    transparent: true,
    opacity: 0.34,
    roughness: 0.2,
    metalness: 0.05,
    depthWrite: false,
  });

  const campus = new THREE.Group();
  campus.rotation.y = -0.12;
  scene.add(campus);

  const hall = new THREE.Group();
  hall.position.set(1.8, 0.1, -1.4);
  campus.add(hall);
  addBox(hall, [8.8, 2.8, 5.3], [0, 0.25, 0], glass, PALETTE.graphiteSoft);
  addBox(hall, [9.15, 0.22, 5.65], [0, 1.78, 0], silver, PALETTE.graphiteSoft);
  addBox(hall, [9.25, 0.18, 0.25], [0, -0.72, 2.7], graphiteSoft, PALETTE.silver);
  addBox(hall, [1.4, 1.7, 0.2], [0, -0.05, 2.78], graphite, PALETTE.cyan);

  const racks: THREE.Group[] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const rack = new THREE.Group();
      rack.position.set(-3.55 + column * 1.02, -0.2, -1.55 + row * 1.45);
      addBox(rack, [0.55, 1.55, 0.72], [0, 0, 0], graphite, PALETTE.silver);
      for (let light = 0; light < 5; light += 1) {
        addBox(rack, [0.34, 0.025, 0.025], [0, -0.55 + light * 0.27, 0.375], light % 2 ? violet : cyan);
      }
      hall.add(rack);
      racks.push(rack);
    }
  }

  const substation = new THREE.Group();
  substation.position.set(-7.1, -0.35, 2.2);
  campus.add(substation);
  addBox(substation, [4.2, 0.15, 3.4], [0, -0.7, 0], silver, PALETTE.graphiteSoft);
  for (let i = 0; i < 3; i += 1) {
    addBox(substation, [0.85, 1.15, 1.25], [-1.35 + i * 1.35, -0.05, 0], graphiteSoft, PALETTE.silver);
    addCylinder(substation, 0.17, 0.21, 1.25, [-1.35 + i * 1.35, 0.85, 0], copper);
  }
  for (let i = 0; i < 4; i += 1) {
    const pylon = new THREE.Group();
    pylon.position.set(-1.65 + i * 1.1, 0.25, -1.15);
    addBox(pylon, [0.08, 2.2, 0.08], [0, 0, 0], graphiteSoft);
    addBox(pylon, [0.95, 0.08, 0.08], [0, 0.72, 0], graphiteSoft);
    addCylinder(pylon, 0.08, 0.08, 0.4, [-0.35, 0.42, 0], cyan);
    addCylinder(pylon, 0.08, 0.08, 0.4, [0.35, 0.42, 0], cyan);
    substation.add(pylon);
  }

  const cooling = new THREE.Group();
  cooling.position.set(7.2, -0.25, 1.5);
  campus.add(cooling);
  for (let i = 0; i < 4; i += 1) {
    addCylinder(cooling, 0.58, 0.74, 2.05, [0, 0, -2.25 + i * 1.5], silver);
    addCylinder(cooling, 0.42, 0.42, 0.08, [0, 1.05, -2.25 + i * 1.5], graphite, [0, 0, 0], 28);
  }
  addTube(campus, [[5.9, -0.15, -0.8], [5.1, -0.15, -0.8], [4.6, -0.15, -0.2], [4.6, -0.15, 1.2]], 0.1, cyan);
  addTube(campus, [[6.05, 0.1, -0.45], [5.25, 0.1, -0.45], [4.85, 0.1, 0.05], [4.85, 0.1, 1.2]], 0.075, copper);
  addTube(campus, [[-5.1, -0.05, 1.3], [-3.7, -0.05, 1.3], [-3.0, -0.05, 0.3], [-2.4, -0.05, 0.3]], 0.085, copper);

  addContactDisc(campus, 11.5, [0, -1.11, 0], 0.08);

  const update = (progress: number, pointer: PointerState) => {
    const eased = smooth(progress);
    hall.rotation.y = -0.02 * eased;
    campus.position.y = eased * 0.08;
    racks.forEach((rack, index) => {
      rack.position.y = -0.2 + Math.sin((index % 8) * 0.8) * eased * 0.015;
    });
    setCamera(camera, progress, pointer, [15.8, 10.4, 18.5], [6.2, 4.3, 8.1], [0.6, 0.1, 0], [1.2, 0.05, -0.3], 0.34);
  };

  update(0, { x: 0, y: 0 });
  return { scene, camera, update, dispose: () => disposeScene(scene) };
}

function createRackScene(): SceneBundle {
  const scene = new THREE.Scene();
  addEnvironment(scene, 22);
  const camera = createCamera();

  const graphite = material(PALETTE.graphite, { roughness: 0.42, metalness: 0.66 });
  const dark = material(PALETTE.dark, { roughness: 0.34, metalness: 0.72 });
  const silver = material(PALETTE.silver, { roughness: 0.38, metalness: 0.72 });
  const copper = material(PALETTE.copper, { roughness: 0.28, metalness: 0.85 });
  const cyan = material(PALETTE.cyan, { roughness: 0.2, metalness: 0.48, emissive: PALETTE.teal, emissiveIntensity: 0.32 });
  const violet = material(PALETTE.violet, { roughness: 0.24, metalness: 0.44, emissive: PALETTE.violet, emissiveIntensity: 0.52 });
  const panelMaterial = new THREE.MeshPhysicalMaterial({ color: 0x879396, transparent: true, opacity: 0.18, roughness: 0.2, metalness: 0.35, depthWrite: false });

  const rack = new THREE.Group();
  rack.position.y = 1.55;
  scene.add(rack);
  addContactDisc(scene, 4.6, [0, -1.1, 0], 0.13);

  for (const x of [-2.35, 2.35]) {
    addBox(rack, [0.16, 6.5, 0.18], [x, 0, -1.25], silver, PALETTE.graphite);
    addBox(rack, [0.16, 6.5, 0.18], [x, 0, 1.25], silver, PALETTE.graphite);
  }
  addBox(rack, [4.9, 0.18, 2.7], [0, 3.2, 0], silver, PALETTE.graphite);
  addBox(rack, [4.9, 0.18, 2.7], [0, -3.2, 0], graphite, PALETTE.silver);

  const sidePanels = [
    addBox(rack, [0.12, 6.2, 2.5], [-2.48, 0, 0], panelMaterial, PALETTE.silver),
    addBox(rack, [0.12, 6.2, 2.5], [2.48, 0, 0], panelMaterial, PALETTE.silver),
  ];

  const trays: THREE.Group[] = [];
  for (let index = 0; index < 18; index += 1) {
    const tray = new THREE.Group();
    const y = -2.75 + index * 0.32;
    tray.position.set(0, y, 0);
    addBox(tray, [3.72, 0.23, 2.12], [0, 0, 0], index === 8 || index === 9 ? graphite : dark, PALETTE.graphiteSoft);
    addBox(tray, [3.82, 0.17, 0.09], [0, 0, 1.1], graphite, PALETTE.silver);
    for (let vent = 0; vent < 7; vent += 1) {
      addBox(tray, [0.3, 0.025, 0.025], [-1.25 + vent * 0.42, 0, 1.155], vent % 3 === 0 ? violet : cyan);
    }
    rack.add(tray);
    trays.push(tray);
  }

  addBox(rack, [4.05, 0.54, 2.15], [0, 2.52, 0], graphite, PALETTE.violet);
  for (let port = 0; port < 8; port += 1) {
    addBox(rack, [0.26, 0.13, 0.08], [-1.35 + port * 0.39, 2.52, 1.12], violet);
  }

  for (const x of [-2.04, 2.04]) {
    addCylinder(rack, 0.095, 0.095, 5.9, [x, 0, 0.68], cyan);
    addCylinder(rack, 0.065, 0.065, 5.9, [x * 0.91, 0, 0.82], copper);
  }
  for (let row = 0; row < 6; row += 1) {
    const y = -2.35 + row * 0.94;
    addTube(rack, [[-2.03, y, 0.68], [-1.78, y, 0.68], [-1.55, y, 0.45]], 0.045, cyan);
    addTube(rack, [[2.03, y, 0.68], [1.78, y, 0.68], [1.55, y, 0.45]], 0.045, cyan);
  }

  const update = (progress: number, pointer: PointerState) => {
    const eased = smooth(progress);
    sidePanels[0].position.x = -2.48 - eased * 1.15;
    sidePanels[1].position.x = 2.48 + eased * 1.15;
    sidePanels[0].rotation.z = eased * 0.06;
    sidePanels[1].rotation.z = -eased * 0.06;
    trays.forEach((tray, index) => {
      const emphasis = Math.pow(Math.max(0, Math.sin((index / 17) * Math.PI)), 1.5);
      tray.position.z = eased * (0.14 + emphasis * 1.08);
      tray.position.x = Math.sin(index * 1.7) * eased * 0.035;
    });
    rack.rotation.y = -0.08 + eased * 0.12;
    setCamera(camera, progress, pointer, [8.1, 5.3, 11.8], [4.2, 2.35, 6.3], [0, 1.45, 0], [0, 1.25, 0.65], 0.24);
  };

  update(0, { x: 0, y: 0 });
  return { scene, camera, update, dispose: () => disposeScene(scene) };
}

function createTrayScene(): SceneBundle {
  const scene = new THREE.Scene();
  addEnvironment(scene, 24);
  const camera = createCamera();

  const graphite = material(PALETTE.graphite, { roughness: 0.4, metalness: 0.7 });
  const dark = material(PALETTE.dark, { roughness: 0.38, metalness: 0.48 });
  const board = material(PALETTE.board, { roughness: 0.5, metalness: 0.36 });
  const copper = material(PALETTE.copper, { roughness: 0.24, metalness: 0.9 });
  const cyan = material(PALETTE.cyan, { roughness: 0.18, metalness: 0.42, emissive: PALETTE.teal, emissiveIntensity: 0.28 });
  const violet = material(PALETTE.violet, { roughness: 0.18, metalness: 0.38, emissive: PALETTE.violet, emissiveIntensity: 0.46 });
  const silicon = material(0x353b45, { roughness: 0.22, metalness: 0.76, emissive: 0x30204f, emissiveIntensity: 0.22 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xb9e5df, transparent: true, opacity: 0.3, roughness: 0.08, metalness: 0.12, depthWrite: false });

  const tray = new THREE.Group();
  tray.position.y = 0.15;
  tray.rotation.y = -0.1;
  scene.add(tray);
  addContactDisc(scene, 5.8, [0, -1.1, 0], 0.11);

  addBox(tray, [8.6, 0.34, 5.4], [0, -0.78, 0], graphite, PALETTE.silver);
  addBox(tray, [7.9, 0.2, 4.75], [0, -0.5, 0], board, PALETTE.copper);
  addBox(tray, [8.7, 0.65, 0.22], [0, -0.42, 2.7], graphite, PALETTE.silver);

  for (let trace = 0; trace < 26; trace += 1) {
    const x = -3.55 + (trace % 13) * 0.58;
    const z = -1.95 + Math.floor(trace / 13) * 3.8;
    addBox(tray, [0.035, 0.025, 2.4], [x, -0.37, z * 0.45], trace % 4 === 0 ? violet : copper);
  }

  const gpuModules: THREE.Group[] = [];
  for (let index = 0; index < 4; index += 1) {
    const gpuModule = new THREE.Group();
    gpuModule.position.set(-2.55 + index * 1.7, -0.22, 0.45);
    addBox(gpuModule, [1.3, 0.13, 1.65], [0, 0, 0], dark, PALETTE.copper);
    addBox(gpuModule, [0.72, 0.12, 0.78], [0, 0.13, 0], silicon, PALETTE.violet);
    for (const hx of [-0.48, 0.48]) {
      for (const hz of [-0.5, 0.5]) {
        addBox(gpuModule, [0.27, 0.24, 0.34], [hx, 0.17, hz], graphite, PALETTE.copper);
      }
    }
    tray.add(gpuModule);
    gpuModules.push(gpuModule);
  }

  const cpuModules: THREE.Group[] = [];
  for (const x of [-1.15, 1.15]) {
    const cpu = new THREE.Group();
    cpu.position.set(x, -0.2, -1.42);
    addBox(cpu, [1.72, 0.14, 1.0], [0, 0, 0], dark, PALETTE.copper);
    addBox(cpu, [0.95, 0.12, 0.58], [0, 0.14, 0], silicon, PALETTE.teal);
    tray.add(cpu);
    cpuModules.push(cpu);
  }

  const nvlink = new THREE.Group();
  tray.add(nvlink);
  for (let index = 0; index < 3; index += 1) {
    addTube(nvlink, [[-1.7 + index * 1.7, 0.08, 0.45], [-0.85 + index * 1.7, 0.48, 0.45], [0 + index * 1.7, 0.08, 0.45]], 0.045, violet);
  }
  addBox(nvlink, [3.5, 0.18, 0.72], [0, 0.1, 1.75], graphite, PALETTE.violet);

  const coldPlate = addBox(tray, [7.3, 0.22, 3.9], [0, 1.05, 0], glass, PALETTE.cyan);
  addTube(coldPlate, [[-3.2, 0, -1.45], [-1.5, 0, -1.45], [-1.0, 0, 1.45], [1.0, 0, 1.45], [1.5, 0, -1.45], [3.2, 0, -1.45]], 0.065, cyan);
  const lid = addBox(tray, [8.5, 0.24, 5.25], [0, 2.2, 0], glass, PALETTE.graphiteSoft);

  const update = (progress: number, pointer: PointerState) => {
    const eased = smooth(progress);
    lid.position.y = 2.2 + eased * 1.85;
    coldPlate.position.y = 1.05 + eased * 0.95;
    gpuModules.forEach((module, index) => {
      module.position.y = -0.22 + eased * (0.34 + index * 0.08);
      module.position.x = -2.55 + index * 1.7 + (index - 1.5) * eased * 0.18;
    });
    cpuModules.forEach((cpu, index) => {
      cpu.position.y = -0.2 + eased * 0.54;
      cpu.position.x = (index === 0 ? -1.15 : 1.15) * (1 + eased * 0.08);
    });
    nvlink.position.y = eased * 0.72;
    tray.rotation.y = -0.1 + eased * 0.09;
    setCamera(camera, progress, pointer, [10.2, 7.1, 11.8], [5.9, 4.65, 7.25], [0, 0.25, 0], [0, 0.78, 0.15], 0.2);
  };

  update(0, { x: 0, y: 0 });
  return { scene, camera, update, dispose: () => disposeScene(scene) };
}

function createPackageScene(): SceneBundle {
  const scene = new THREE.Scene();
  addEnvironment(scene, 20);
  const camera = createCamera();

  const graphite = material(PALETTE.graphite, { roughness: 0.32, metalness: 0.78 });
  const dark = material(PALETTE.dark, { roughness: 0.34, metalness: 0.5 });
  const substrate = material(0x38524d, { roughness: 0.48, metalness: 0.34 });
  const gold = material(PALETTE.amber, { roughness: 0.18, metalness: 0.94 });
  const violet = material(PALETTE.violet, { roughness: 0.16, metalness: 0.48, emissive: PALETTE.violet, emissiveIntensity: 0.52 });
  const silicon = material(0x4a4862, { roughness: 0.2, metalness: 0.62, emissive: 0x382966, emissiveIntensity: 0.4 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xbbe8e2, transparent: true, opacity: 0.34, roughness: 0.06, metalness: 0.08, depthWrite: false });

  const pkg = new THREE.Group();
  pkg.rotation.y = -0.12;
  pkg.position.y = 0.2;
  scene.add(pkg);
  addContactDisc(scene, 5.0, [0, -1.1, 0], 0.12);

  const socket = addBox(pkg, [7.5, 0.35, 5.6], [0, -0.82, 0], graphite, PALETTE.silver);
  const substrateLayer = addBox(pkg, [7.05, 0.24, 5.18], [0, -0.45, 0], substrate, PALETTE.copper);
  const interposer = addBox(pkg, [5.85, 0.18, 4.15], [0, -0.12, 0], dark, PALETTE.amber);

  for (let padX = 0; padX < 14; padX += 1) {
    for (let padZ = 0; padZ < 8; padZ += 1) {
      if ((padX + padZ) % 2 === 0) {
        addCylinder(pkg, 0.035, 0.035, 0.12, [-3.05 + padX * 0.47, -0.65, -1.7 + padZ * 0.49], gold);
      }
    }
  }

  const dies: THREE.Mesh[] = [];
  for (const x of [-1.05, 1.05]) {
    dies.push(addBox(pkg, [1.72, 0.22, 1.72], [x, 0.2, 0], silicon, PALETTE.violet));
  }

  const hbmGroups: THREE.Group[] = [];
  const hbmPositions: Array<[number, number]> = [
    [-2.35, -1.35], [-0.78, -1.35], [0.78, -1.35], [2.35, -1.35],
    [-2.35, 1.35], [-0.78, 1.35], [0.78, 1.35], [2.35, 1.35],
  ];
  hbmPositions.forEach(([x, z], index) => {
    const stack = new THREE.Group();
    stack.position.set(x, 0.2, z);
    for (let layer = 0; layer < 5; layer += 1) {
      addBox(stack, [0.76, 0.12, 0.7], [0, layer * 0.13, 0], layer === 4 ? graphite : dark, index % 2 ? PALETTE.copper : PALETTE.violet);
    }
    pkg.add(stack);
    hbmGroups.push(stack);
  });

  for (const [x, z] of hbmPositions) {
    addTube(pkg, [[x * 0.78, 0.1, z * 0.72], [x * 0.52, 0.1, z * 0.42], [x > 0 ? 0.4 : -0.4, 0.1, z * 0.18]], 0.032, violet);
  }

  const lid = addBox(pkg, [6.9, 0.26, 5.0], [0, 2.35, 0], glass, PALETTE.cyan);
  const coldPlate = addBox(pkg, [6.45, 0.18, 4.55], [0, 1.55, 0], glass, PALETTE.teal);
  addTube(coldPlate, [[-2.8, 0, -1.7], [-1.4, 0, -1.7], [-0.8, 0, 1.7], [0.8, 0, 1.7], [1.4, 0, -1.7], [2.8, 0, -1.7]], 0.06, violet);

  const update = (progress: number, pointer: PointerState) => {
    const eased = smooth(progress);
    socket.position.y = -0.82 - eased * 0.28;
    substrateLayer.position.y = -0.45 + eased * 0.1;
    interposer.position.y = -0.12 + eased * 0.42;
    dies.forEach((die, index) => {
      die.position.y = 0.2 + eased * (0.86 + index * 0.08);
      die.position.x = (index === 0 ? -1.05 : 1.05) * (1 + eased * 0.08);
    });
    hbmGroups.forEach((stack, index) => {
      stack.position.y = 0.2 + eased * (0.72 + (index % 4) * 0.07);
      stack.position.x = hbmPositions[index][0] * (1 + eased * 0.08);
      stack.position.z = hbmPositions[index][1] * (1 + eased * 0.08);
    });
    coldPlate.position.y = 1.55 + eased * 0.82;
    lid.position.y = 2.35 + eased * 1.55;
    pkg.rotation.y = -0.12 + eased * 0.13;
    setCamera(camera, progress, pointer, [8.6, 6.8, 9.8], [5.25, 4.45, 6.15], [0, 0.35, 0], [0, 0.72, 0], 0.18);
  };

  update(0, { x: 0, y: 0 });
  return { scene, camera, update, dispose: () => disposeScene(scene) };
}

function createApplicationScene(): SceneBundle {
  const scene = new THREE.Scene();
  addEnvironment(scene, 24);
  const camera = createCamera();

  const graphite = material(PALETTE.graphite, { roughness: 0.42, metalness: 0.7 });
  const soft = material(PALETTE.graphiteSoft, { roughness: 0.56, metalness: 0.34 });
  const skin = material(0xc7aa94, { roughness: 0.72, metalness: 0.02 });
  const cyan = material(PALETTE.cyan, { roughness: 0.14, metalness: 0.36, emissive: PALETTE.teal, emissiveIntensity: 0.7 });
  const violet = material(PALETTE.violet, { roughness: 0.14, metalness: 0.32, emissive: PALETTE.violet, emissiveIntensity: 0.78 });
  const amber = material(PALETTE.amber, { roughness: 0.18, metalness: 0.28, emissive: PALETTE.amber, emissiveIntensity: 0.52 });
  const screenMaterial = new THREE.MeshStandardMaterial({ color: 0xe8edeb, roughness: 0.34, metalness: 0.12, emissive: 0xdce9e6, emissiveIntensity: 0.34 });

  const workspace = new THREE.Group();
  workspace.position.y = 0.2;
  scene.add(workspace);
  addContactDisc(scene, 7.2, [0, -1.1, 0], 0.1);

  addBox(workspace, [8.8, 0.22, 4.2], [0.8, -0.35, 0], graphite, PALETTE.graphiteSoft);
  for (const x of [-2.9, 4.5]) {
    addBox(workspace, [0.22, 2.0, 0.22], [x, -1.25, 0], graphite);
  }

  const monitor = new THREE.Group();
  monitor.position.set(1.45, 1.65, -0.4);
  monitor.rotation.y = -0.08;
  workspace.add(monitor);
  addBox(monitor, [5.0, 3.05, 0.22], [0, 0, 0], graphite, PALETTE.silver);
  addBox(monitor, [4.65, 2.7, 0.08], [0, 0, 0.15], screenMaterial, PALETTE.cyan);
  addBox(monitor, [0.22, 1.35, 0.22], [0, -2.08, -0.05], graphite);
  addBox(monitor, [1.9, 0.13, 0.9], [0, -2.72, 0.1], graphite);

  const dashboard = new THREE.Group();
  dashboard.position.z = 0.21;
  monitor.add(dashboard);
  addBox(dashboard, [1.25, 0.72, 0.04], [-1.45, 0.68, 0], violet);
  addBox(dashboard, [1.25, 0.72, 0.04], [0, 0.68, 0], cyan);
  addBox(dashboard, [1.25, 0.72, 0.04], [1.45, 0.68, 0], amber);
  addBox(dashboard, [2.7, 0.12, 0.04], [-0.72, -0.25, 0], graphite);
  addBox(dashboard, [1.25, 0.12, 0.04], [1.45, -0.25, 0], graphite);
  for (let bar = 0; bar < 12; bar += 1) {
    addBox(dashboard, [0.16, 0.2 + (bar % 5) * 0.1, 0.05], [-1.85 + bar * 0.33, -0.9, 0], bar % 3 === 0 ? violet : cyan);
  }

  const person = new THREE.Group();
  person.position.set(-3.0, -0.2, 1.05);
  person.rotation.y = 0.32;
  workspace.add(person);
  addCylinder(person, 0.58, 0.78, 2.0, [0, 0.35, 0], soft);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 18), skin);
  head.position.set(0, 1.68, 0);
  person.add(head);
  addCylinder(person, 0.14, 0.16, 1.65, [0.5, 0.15, -0.42], soft, [0.75, 0, -0.52]);
  addCylinder(person, 0.14, 0.16, 1.65, [0.84, 0.12, 0.16], soft, [0.75, 0, -0.33]);

  const laptop = new THREE.Group();
  laptop.position.set(-0.75, 0.0, 1.15);
  workspace.add(laptop);
  addBox(laptop, [2.2, 0.12, 1.5], [0, 0, 0], graphite, PALETTE.silver);
  const laptopScreen = addBox(laptop, [2.2, 1.45, 0.11], [0, 0.78, -0.72], graphite, PALETTE.cyan);
  laptopScreen.rotation.x = -0.08;
  addBox(laptopScreen, [1.9, 1.16, 0.04], [0, 0, -0.08], violet);

  const dataCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.2, 2.1, 0.2),
    new THREE.Vector3(-3.7, 2.8, -0.2),
    new THREE.Vector3(-1.5, 2.4, -0.1),
    new THREE.Vector3(0.5, 2.6, -0.2),
    new THREE.Vector3(1.45, 2.25, -0.2),
  ]);
  addTube(workspace, [[-5.2, 2.1, 0.2], [-3.7, 2.8, -0.2], [-1.5, 2.4, -0.1], [0.5, 2.6, -0.2], [1.45, 2.25, -0.2]], 0.025, violet);
  const particles: THREE.Mesh[] = [];
  for (let index = 0; index < 18; index += 1) {
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.055 + (index % 3) * 0.012, 10, 8), index % 3 === 0 ? cyan : violet);
    workspace.add(particle);
    particles.push(particle);
  }

  const update = (progress: number, pointer: PointerState) => {
    const eased = smooth(progress);
    monitor.rotation.y = -0.08 + eased * 0.08;
    dashboard.position.z = 0.21 + eased * 0.08;
    particles.forEach((particle, index) => {
      const point = dataCurve.getPoint(clamp(index / particles.length + eased * 0.38));
      particle.position.copy(point);
      particle.scale.setScalar(0.75 + eased * 0.45);
    });
    person.rotation.y = 0.32 - eased * 0.08;
    setCamera(camera, progress, pointer, [10.8, 6.7, 12.8], [5.3, 3.45, 6.4], [-0.2, 0.65, 0], [0.8, 1.2, -0.2], 0.18);
  };

  update(0, { x: 0, y: 0 });
  return { scene, camera, update, dispose: () => disposeScene(scene) };
}

export function createResearchScenes() {
  return [
    createCampusScene(),
    createRackScene(),
    createTrayScene(),
    createPackageScene(),
    createApplicationScene(),
  ];
}

export function createTransitionPass() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tFrom: { value: null },
      tTo: { value: null },
      uMix: { value: 0 },
      uDirection: { value: 0 },
      uAccent: { value: new THREE.Color(PALETTE.teal) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D tFrom;
      uniform sampler2D tTo;
      uniform float uMix;
      uniform float uDirection;
      uniform vec3 uAccent;

      void main() {
        float eased = uMix * uMix * (3.0 - 2.0 * uMix);
        vec2 center = vec2(0.56, 0.48);
        vec2 fromUv = center + (vUv - center) * (1.0 - eased * 0.075);
        vec2 toUv = center + (vUv - center) * (1.075 - eased * 0.075);
        vec4 fromColor = texture2D(tFrom, fromUv);
        vec4 toColor = texture2D(tTo, toUv);
        float distanceFromFocus = length((vUv - center) * vec2(1.0, 1.45));
        float spatialDelay = (distanceFromFocus - 0.32) * 0.28;
        float blend = smoothstep(0.08, 0.92, eased - spatialDelay);
        float veil = sin(eased * 3.14159265) * (1.0 - smoothstep(0.05, 0.9, distanceFromFocus));
        vec4 color = mix(fromColor, toColor, blend);
        color.rgb = mix(color.rgb, vec3(0.95, 0.96, 0.93), veil * 0.1);
        color.rgb += uAccent * veil * 0.035;
        gl_FragColor = color;
      }
    `,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return {
    scene,
    camera,
    material,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
