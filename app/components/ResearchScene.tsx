"use client";

import { useEffect, useRef, useState } from "react";
import type { Material, Mesh, Object3D } from "three";

type Language = "en" | "zh";

type ResearchSceneProps = {
  language: Language;
  reducedMotionFallback?: string;
};

const phases = [
  {
    en: "Power & grid",
    zh: "电网与供电",
    factEn: "Grid · substation · backup power",
    factZh: "电网 · 变电站 · 备用供电",
  },
  {
    en: "AI factory campus",
    zh: "AI 数据中心园区",
    factEn: "Data halls · chillers · liquid loops",
    factZh: "数据机房 · 冷水机组 · 液冷循环",
  },
  {
    en: "GB300 NVL72 rack",
    zh: "GB300 NVL72 整柜",
    factEn: "72 Blackwell Ultra GPUs · 36 Grace CPUs",
    factZh: "72 个 Blackwell Ultra GPU · 36 个 Grace CPU",
  },
  {
    en: "Compute tray",
    zh: "计算托盘",
    factEn: "4 B300 GPUs · 2 Grace CPUs · 1.152 TB HBM3e",
    factZh: "4 个 B300 GPU · 2 个 Grace CPU · 1.152 TB HBM3e",
  },
  {
    en: "NVLink fabric",
    zh: "NVLink 互联",
    factEn: "9 switch trays · 18 NVSwitch ASICs · 130 TB/s",
    factZh: "9 个交换托盘 · 18 个 NVSwitch ASIC · 130 TB/s",
  },
  {
    en: "GPU module",
    zh: "GPU 模组",
    factEn: "Blackwell Ultra · 288 GB HBM3e",
    factZh: "Blackwell Ultra · 288 GB HBM3e",
  },
  {
    en: "Chip level",
    zh: "芯片层",
    factEn: "GPU dies · HBM stacks · interposer",
    factZh: "GPU 裸片 · HBM 堆栈 · 中介层",
  },
  {
    en: "AI application",
    zh: "AI 应用终端",
    factEn: "Model output becomes a human decision",
    factZh: "模型输出走向人的工作流",
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

export default function ResearchScene({
  language,
  reducedMotionFallback = "/og.png",
}: ResearchSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const track = mount?.closest<HTMLElement>(".hero-section");
    if (!mount || !track) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 720px)").matches;
    if (motionQuery.matches || compact) {
      const fallbackFrame = window.requestAnimationFrame(() => setFallback(true));
      track.style.setProperty("--hero-progress", "0");
      return () => window.cancelAnimationFrame(fallbackFrame);
    }

    let cancelled = false;
    let frame = 0;
    let rendererVisible = true;
    let rendererCanvas: HTMLCanvasElement | null = null;
    let cleanupScene: (() => void) | undefined;

    const init = async () => {
      try {
        const THREE = await import("three");
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 900 ? 1.2 : 1.45));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0xf7f5ef, 0);
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.className = "scene-canvas";
        mount.appendChild(renderer.domElement);
        rendererCanvas = renderer.domElement;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xf7f5ef, 28, 72);

        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
        const world = new THREE.Group();
        world.position.set(2.15, -0.55, 0);
        scene.add(world);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x858b86, 3.25));
        const keyLight = new THREE.DirectionalLight(0xffffff, 4.8);
        keyLight.position.set(10, 16, 12);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0x87d8d5, 1.35);
        fillLight.position.set(-10, 5, -9);
        scene.add(fillLight);
        const rimLight = new THREE.DirectionalLight(0xd0b8ff, 0.95);
        rimLight.position.set(2, 9, -14);
        scene.add(rimLight);

        const graphite = 0x222b30;
        const graphiteMid = 0x465257;
        const steel = 0x9da6a5;
        const ivory = 0xe5e1d5;
        const pcb = 0x194f4d;
        const teal = 0x07818a;
        const amber = 0xb96d25;
        const violet = 0x6f5ab7;
        const copper = 0xbc7440;
        const silicon = 0x344960;

        const campusMaterials: Material[] = [];
        const ambientMaterials: Material[] = [];
        const rackMaterials: Material[] = [];
        const trayMaterials: Material[] = [];
        const selectedGpuMaterials: Material[] = [];
        const fabricMaterials: Material[] = [];
        const packageMaterials: Material[] = [];
        const userMaterials: Material[] = [];

        const makeMaterial = (
          bucket: Material[],
          color: number,
          opacity = 1,
          metalness = 0.56,
          roughness = 0.42,
        ) => {
          const instance = new THREE.MeshStandardMaterial({
            color,
            metalness,
            roughness,
            transparent: true,
            opacity,
          });
          instance.userData.baseOpacity = opacity;
          bucket.push(instance);
          return instance;
        };

        const addEdges = (mesh: Mesh, bucket: Material[], color = 0x172126, opacity = 0.24) => {
          const edgeMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
          edgeMaterial.userData.baseOpacity = opacity;
          bucket.push(edgeMaterial);
          mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMaterial));
        };

        const addBox = (
          parent: Object3D,
          bucket: Material[],
          size: [number, number, number],
          position: [number, number, number],
          color: number,
          options: {
            opacity?: number;
            metalness?: number;
            roughness?: number;
            outlined?: boolean;
            rotation?: [number, number, number];
          } = {},
        ) => {
          const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(...size),
            makeMaterial(bucket, color, options.opacity ?? 1, options.metalness ?? 0.56, options.roughness ?? 0.42),
          );
          mesh.position.set(...position);
          if (options.rotation) mesh.rotation.set(...options.rotation);
          if (options.outlined) addEdges(mesh, bucket);
          parent.add(mesh);
          return mesh;
        };

        const addCylinder = (
          parent: Object3D,
          bucket: Material[],
          radius: number,
          depth: number,
          position: [number, number, number],
          color: number,
          rotation: [number, number, number] = [Math.PI / 2, 0, 0],
        ) => {
          const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, depth, 18),
            makeMaterial(bucket, color, 1, 0.5, 0.46),
          );
          mesh.position.set(...position);
          mesh.rotation.set(...rotation);
          parent.add(mesh);
          return mesh;
        };

        const addSphere = (
          parent: Object3D,
          bucket: Material[],
          radius: number,
          position: [number, number, number],
          color: number,
        ) => {
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 24, 16),
            makeMaterial(bucket, color, 1, 0.38, 0.5),
          );
          mesh.position.set(...position);
          parent.add(mesh);
          return mesh;
        };

        const addTube = (
          parent: Object3D,
          bucket: Material[],
          points: Array<[number, number, number]>,
          color: number,
          radius = 0.045,
          opacity = 0.86,
        ) => {
          const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
          const tube = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 36, radius, 8, false),
            makeMaterial(bucket, color, opacity, 0.25, 0.32),
          );
          parent.add(tube);
          return tube;
        };

        const setOpacity = (bucket: Material[], factor: number) => {
          const safeFactor = clamp(factor);
          bucket.forEach((item) => {
            const baseOpacity = typeof item.userData.baseOpacity === "number" ? item.userData.baseOpacity : 1;
            item.opacity = baseOpacity * safeFactor;
            item.visible = safeFactor > 0.005;
            item.depthWrite = baseOpacity > 0.95 && safeFactor > 0.72;
          });
        };

        const campusGroup = new THREE.Group();
        world.add(campusGroup);
        addBox(campusGroup, campusMaterials, [31, 0.18, 23], [0, -5.14, 0], ivory, {
          opacity: 0.82,
          metalness: 0.08,
          roughness: 0.82,
          outlined: true,
        });

        const dataHall = new THREE.Group();
        campusGroup.add(dataHall);
        addBox(dataHall, campusMaterials, [18.2, 10.2, 15.4], [0, -0.03, 0], ivory, {
          opacity: 0.1,
          metalness: 0.12,
          roughness: 0.78,
          outlined: true,
        });
        addBox(dataHall, campusMaterials, [18.4, 0.2, 15.6], [0, 5.05, 0], steel, {
          opacity: 0.38,
          metalness: 0.38,
          outlined: true,
        });
        for (let roofUnit = 0; roofUnit < 6; roofUnit += 1) {
          addBox(
            dataHall,
            campusMaterials,
            [2.15, 0.48, 3.1],
            [-6.4 + (roofUnit % 3) * 6.4, 5.38, -2.45 + Math.floor(roofUnit / 3) * 4.9],
            graphiteMid,
            { opacity: 0.72, outlined: true },
          );
        }
        addBox(dataHall, campusMaterials, [3.2, 3.2, 0.18], [-4.6, -3.42, 7.79], graphite, { opacity: 0.64, outlined: true });
        addBox(dataHall, campusMaterials, [3.2, 3.2, 0.18], [0, -3.42, 7.79], graphite, { opacity: 0.64, outlined: true });

        const utilityGroup = new THREE.Group();
        utilityGroup.position.x = 10.5;
        campusGroup.add(utilityGroup);
        [-13.2, -10.3, -7.4].forEach((x, index) => {
          addCylinder(utilityGroup, campusMaterials, 0.1, 4.5, [x, -2.72, 4.4], graphite, [0, 0, 0]);
          addBox(utilityGroup, campusMaterials, [2.25, 0.12, 0.12], [x, -0.7, 4.4], graphite, { outlined: true });
          addBox(utilityGroup, campusMaterials, [1.55, 0.1, 0.1], [x, -1.18, 4.4], graphiteMid);
          if (index < 2) {
            [-0.72, 0, 0.72].forEach((zOffset) => {
              addTube(
                utilityGroup,
                campusMaterials,
                [[x - 1.45, -0.7, 4.4 + zOffset], [x, -0.38, 4.4 + zOffset], [x + 1.45, -0.7, 4.4 + zOffset]],
                amber,
                0.035,
                0.88,
              );
            });
          }
        });
        [-8.2, -5.8].forEach((x) => {
          addBox(utilityGroup, campusMaterials, [1.7, 1.35, 2.15], [x, -4.35, 1.35], copper, { opacity: 0.88, outlined: true });
          addCylinder(utilityGroup, campusMaterials, 0.16, 1.9, [x - 0.42, -3.08, 1.35], amber, [0, 0, 0]);
          addCylinder(utilityGroup, campusMaterials, 0.16, 1.9, [x + 0.42, -3.08, 1.35], amber, [0, 0, 0]);
        });
        addTube(utilityGroup, campusMaterials, [[-7.4, -0.7, 4.4], [-7, -1.8, 2.4], [-5.8, -3.4, 1.35], [-3.8, -3.8, 0.8]], amber, 0.095, 0.92);
        addTube(utilityGroup, campusMaterials, [[-7.4, -1.18, 4.4], [-7.6, -2.1, 2.2], [-8.2, -3.4, 1.35], [-3.8, -4.15, -0.1]], copper, 0.07, 0.82);

        const coolingPlant = new THREE.Group();
        coolingPlant.position.x = -5;
        campusGroup.add(coolingPlant);
        [10.6, 13.1].forEach((x) => {
          addCylinder(coolingPlant, campusMaterials, 1.08, 2.15, [x, -4, -2.8], steel, [0, 0, 0]);
          addCylinder(coolingPlant, campusMaterials, 0.76, 0.16, [x, -2.88, -2.8], graphiteMid, [0, 0, 0]);
          for (let blade = 0; blade < 6; blade += 1) {
            addBox(coolingPlant, campusMaterials, [0.05, 0.05, 1.18], [x, -2.76, -2.8], graphite, {
              opacity: 0.66,
              rotation: [0, blade * (Math.PI / 3), 0],
            });
          }
        });
        [10.2, 11.45, 12.7, 13.95].forEach((x) => {
          addBox(coolingPlant, campusMaterials, [0.92, 0.78, 2.5], [x, -4.58, 1.35], graphiteMid, { opacity: 0.84, outlined: true });
        });
        addTube(coolingPlant, campusMaterials, [[13.1, -3.7, -2.8], [12.6, -3.55, 0], [9.15, -3.7, 0], [7.8, -3.9, -0.8]], teal, 0.13, 0.92);
        addTube(coolingPlant, campusMaterials, [[10.6, -4.1, -2.8], [10.2, -4.25, -0.6], [8.7, -4.35, 0.5], [7.8, -4.2, 1.2]], 0x6dc8cf, 0.11, 0.78);

        const floor = new THREE.GridHelper(34, 34, 0xa2aaa7, 0xd8d4c9);
        floor.position.y = -5.1;
        const floorMaterial = Array.isArray(floor.material) ? floor.material : [floor.material];
        floorMaterial.forEach((item) => {
          item.transparent = true;
          item.opacity = 0.2;
          ambientMaterials.push(item);
          item.userData.baseOpacity = 0.2;
        });
        world.add(floor);

        const ambientRacks = new THREE.Group();
        world.add(ambientRacks);

        const buildAmbientRack = (x: number, z: number, angle: number) => {
          const rack = new THREE.Group();
          rack.position.set(x, -0.2, z);
          rack.rotation.y = angle;
          ambientRacks.add(rack);
          addBox(rack, ambientMaterials, [2.45, 8.6, 2.15], [0, 0, 0], graphite, { opacity: 0.16, metalness: 0.7, outlined: true });
          for (let slot = 0; slot < 11; slot += 1) {
            addBox(rack, ambientMaterials, [2.2, 0.42, 0.1], [0, -3.55 + slot * 0.7, 1.12], slot % 4 === 0 ? violet : graphiteMid, { opacity: 0.72 });
            addBox(rack, ambientMaterials, [0.18, 0.08, 0.04], [0.82, -3.55 + slot * 0.7, 1.19], teal, { opacity: 0.9, metalness: 0.2 });
          }
        };

        [
          [-7.2, -5.2, 0.08], [-3.9, -5.8, 0.04], [3.9, -5.8, -0.04], [7.2, -5.2, -0.08],
          [-7.8, 4.8, -0.05], [-4.5, 5.6, -0.02], [4.5, 5.6, 0.02], [7.8, 4.8, 0.05],
        ].forEach(([x, z, angle]) => buildAmbientRack(x, z, angle));

        const rackGroup = new THREE.Group();
        world.add(rackGroup);
        const rackPosts: Array<[number, number]> = [[-1.8, -1.3], [-1.8, 1.3], [1.8, -1.3], [1.8, 1.3]];
        rackPosts.forEach(([x, z]) => addBox(rackGroup, rackMaterials, [0.17, 10, 0.17], [x, 0, z], graphite, { outlined: true }));
        [-4.92, 4.92].forEach((y) => {
          addBox(rackGroup, rackMaterials, [3.78, 0.16, 0.16], [0, y, -1.3], graphite, { outlined: true });
          addBox(rackGroup, rackMaterials, [3.78, 0.16, 0.16], [0, y, 1.3], graphite, { outlined: true });
        });

        const rackTrays: Object3D[] = [];
        for (let slot = 0; slot < 27; slot += 1) {
          const isSwitch = slot % 3 === 2;
          const y = -4.2 + slot * 0.31;
          const tray = new THREE.Group();
          tray.userData.baseY = y;
          tray.userData.baseZ = 0;
          tray.userData.type = isSwitch ? "switch" : "compute";
          rackGroup.add(tray);
          rackTrays.push(tray);
          addBox(tray, rackMaterials, [3.28, 0.22, 2.32], [0, y, 0], isSwitch ? violet : graphiteMid, { outlined: true, opacity: 0.96 });
          const portCount = isSwitch ? 8 : 4;
          for (let port = 0; port < portCount; port += 1) {
            addBox(tray, rackMaterials, [0.18, 0.07, 0.05], [-1.16 + port * (2.3 / Math.max(1, portCount - 1)), y, 1.19], isSwitch ? ivory : teal, { metalness: 0.2 });
          }
        }

        for (let shelf = 0; shelf < 8; shelf += 1) {
          const x = -1.15 + (shelf % 4) * 0.76;
          const y = 4.28 + Math.floor(shelf / 4) * 0.37;
          addBox(rackGroup, rackMaterials, [0.62, 0.25, 2.12], [x, y, 0], amber, { outlined: true, opacity: 0.9 });
        }
        addBox(rackGroup, rackMaterials, [0.22, 9.2, 0.14], [-2.05, 0, -1.18], copper, { outlined: true });
        addBox(rackGroup, rackMaterials, [0.22, 9.2, 0.14], [2.05, 0, -1.18], copper, { outlined: true });
        [-1.45, 1.45].forEach((x) => {
          addTube(rackGroup, rackMaterials, [[x, -4.5, -1.36], [x, 0, -1.55], [x, 4.55, -1.36]], x < 0 ? teal : amber, 0.09, 0.75);
        });

        const computeTray = new THREE.Group();
        world.add(computeTray);
        computeTray.scale.setScalar(0.22);
        addBox(computeTray, trayMaterials, [6.2, 0.32, 4.25], [0, -0.72, 0], graphite, { outlined: true });
        addBox(computeTray, trayMaterials, [5.86, 0.08, 3.9], [0, -0.5, 0], pcb, { outlined: true, metalness: 0.22, roughness: 0.65 });

        const trayLid = new THREE.Group();
        computeTray.add(trayLid);
        addBox(trayLid, trayMaterials, [6.32, 0.18, 4.35], [0, 0.86, 0], steel, { outlined: true, opacity: 0.72 });
        for (let vent = 0; vent < 8; vent += 1) {
          addBox(trayLid, trayMaterials, [0.5, 0.03, 2.9], [-2.35 + vent * 0.67, 0.96, 0], graphite, { opacity: 0.55 });
        }

        const gpuPositions: Array<[number, number, number]> = [
          [-1.25, -0.12, -0.88], [0.55, -0.12, -0.88], [-1.25, -0.12, 0.88], [0.55, -0.12, 0.88],
        ];
        const gpuGroups: Object3D[] = [];
        gpuPositions.forEach(([x, y, z], index) => {
          const gpu = new THREE.Group();
          gpu.position.set(x, y, z);
          gpu.userData.baseX = x;
          gpu.userData.baseZ = z;
          computeTray.add(gpu);
          gpuGroups.push(gpu);
          const bucket = index === 3 ? selectedGpuMaterials : trayMaterials;
          addBox(gpu, bucket, [1.45, 0.12, 1.18], [0, 0, 0], copper, { outlined: true });
          addBox(gpu, bucket, [0.72, 0.22, 0.6], [0, 0.18, 0], silicon, { outlined: true, metalness: 0.38 });
          [[-0.52, -0.38], [0.52, -0.38], [-0.52, 0.38], [0.52, 0.38]].forEach(([hx, hz]) => {
            addBox(gpu, bucket, [0.28, 0.27, 0.25], [hx, 0.16, hz], amber, { outlined: true, metalness: 0.35 });
          });
        });

        [-2.35, 2.25].forEach((x) => {
          addBox(computeTray, trayMaterials, [0.95, 0.14, 1.42], [x, -0.18, 0], steel, { outlined: true });
          addBox(computeTray, trayMaterials, [0.55, 0.24, 0.8], [x, 0.03, 0], graphiteMid, { outlined: true });
        });
        addBox(computeTray, trayMaterials, [0.75, 0.2, 0.78], [2.3, 0.04, -1.45], violet, { outlined: true });
        for (let drive = 0; drive < 5; drive += 1) {
          addBox(computeTray, trayMaterials, [0.34, 0.22, 0.82], [-1.15 + drive * 0.55, -0.08, 1.65], graphiteMid, { outlined: true });
        }
        for (let fan = 0; fan < 4; fan += 1) {
          addCylinder(computeTray, trayMaterials, 0.32, 0.11, [-2.45 + fan * 1.58, -0.24, -1.72], graphiteMid);
        }
        [-1.7, 1.7].forEach((x) => {
          addTube(computeTray, trayMaterials, [[x, -0.05, -1.75], [x * 0.65, 0.52, -0.9], [x * 0.32, 0.68, 0]], x < 0 ? teal : amber, 0.065, 0.72);
          addTube(computeTray, trayMaterials, [[x, -0.05, 1.75], [x * 0.65, 0.52, 0.9], [x * 0.32, 0.68, 0]], x < 0 ? teal : amber, 0.065, 0.72);
        });

        const fabricGroup = new THREE.Group();
        computeTray.add(fabricGroup);
        addBox(fabricGroup, fabricMaterials, [1.1, 0.25, 3.5], [2.08, 0.42, 0], violet, { outlined: true });
        gpuPositions.forEach(([x, , z], index) => {
          addTube(fabricGroup, fabricMaterials, [[x, 0.35, z], [x * 0.55, 1.08 + index * 0.05, z * 0.45], [2.08, 0.7, z * 0.38]], violet, 0.045, 0.82);
        });

        const packageGroup = new THREE.Group();
        world.add(packageGroup);
        packageGroup.scale.setScalar(0.04);
        const substrate = addBox(packageGroup, packageMaterials, [5.7, 0.18, 4.7], [0, -0.75, 0], graphite, { outlined: true });
        const interposer = addBox(packageGroup, packageMaterials, [5.25, 0.13, 4.25], [0, -0.48, 0], copper, { outlined: true, metalness: 0.48 });

        const dieGroup = new THREE.Group();
        packageGroup.add(dieGroup);
        [-0.78, 0.78].forEach((x) => {
          addBox(dieGroup, packageMaterials, [1.32, 0.24, 1.78], [x, -0.17, 0], silicon, { outlined: true, metalness: 0.42, roughness: 0.3 });
          addBox(dieGroup, packageMaterials, [1.02, 0.03, 1.48], [x, -0.02, 0], teal, { opacity: 0.55, metalness: 0.2 });
        });
        for (let bridge = 0; bridge < 7; bridge += 1) {
          addBox(dieGroup, packageMaterials, [0.08, 0.06, 1.48], [-0.28 + bridge * 0.095, 0, 0], ivory, { opacity: 0.8, metalness: 0.2 });
        }

        const hbmGroup = new THREE.Group();
        packageGroup.add(hbmGroup);
        const hbmPositions: Array<[number, number]> = [
          [-2.05, -1.35], [-2.05, -0.44], [-2.05, 0.44], [-2.05, 1.35],
          [2.05, -1.35], [2.05, -0.44], [2.05, 0.44], [2.05, 1.35],
        ];
        hbmPositions.forEach(([x, z]) => {
          const stack = new THREE.Group();
          stack.position.set(x, -0.18, z);
          stack.userData.baseX = x;
          stack.userData.baseZ = z;
          hbmGroup.add(stack);
          for (let layer = 0; layer < 5; layer += 1) {
            addBox(stack, packageMaterials, [0.78, 0.1, 0.62], [0, layer * 0.13, 0], layer === 4 ? amber : 0x5e4c3d, { outlined: true, metalness: 0.42 });
          }
        });

        const packageCover = new THREE.Group();
        packageGroup.add(packageCover);
        addBox(packageCover, packageMaterials, [5.95, 0.2, 4.95], [0, 0.98, 0], steel, { outlined: true, opacity: 0.8 });
        for (let fin = 0; fin < 11; fin += 1) {
          addBox(packageCover, packageMaterials, [0.18, 0.36, 3.75], [-2.15 + fin * 0.43, 1.17, 0], graphiteMid, { opacity: 0.64 });
        }

        const userGroup = new THREE.Group();
        world.add(userGroup);
        userGroup.scale.setScalar(0.04);
        userGroup.position.y = -0.2;
        addBox(userGroup, userMaterials, [11.8, 0.18, 7.2], [0, -2.72, 0], ivory, {
          opacity: 0.9,
          metalness: 0.08,
          roughness: 0.82,
          outlined: true,
        });
        addBox(userGroup, userMaterials, [7.3, 0.22, 3.05], [0.25, -0.75, 0.5], graphiteMid, { outlined: true });
        [-2.75, 2.75].forEach((x) => {
          addBox(userGroup, userMaterials, [0.25, 1.9, 0.25], [x, -1.73, -0.42], graphite, { outlined: true });
          addBox(userGroup, userMaterials, [0.25, 1.9, 0.25], [x, -1.73, 1.42], graphite, { outlined: true });
        });

        addBox(userGroup, userMaterials, [1.18, 1.62, 0.72], [-2.2, 0.15, -0.55], silicon, { outlined: true });
        addBox(userGroup, userMaterials, [0.45, 0.28, 0.42], [-2.2, 1.08, -0.55], amber, { outlined: true });
        addSphere(userGroup, userMaterials, 0.5, [-2.2, 1.58, -0.55], copper);
        addBox(userGroup, userMaterials, [1.4, 1.75, 0.25], [-2.2, -0.2, -1.28], graphite, { opacity: 0.82, outlined: true });
        addTube(userGroup, userMaterials, [[-1.78, 0.58, -0.28], [-1.15, 0.08, 0.12], [-0.42, -0.38, 0.26]], copper, 0.09, 0.92);
        addTube(userGroup, userMaterials, [[-2.62, 0.58, -0.28], [-2.2, 0.05, 0.38], [-1.18, -0.38, 0.62]], copper, 0.09, 0.92);

        const laptop = new THREE.Group();
        userGroup.add(laptop);
        addBox(laptop, userMaterials, [2.45, 0.09, 1.5], [0.12, -0.46, 0.32], steel, { outlined: true });
        addBox(laptop, userMaterials, [2.45, 1.55, 0.11], [0.12, 0.32, -0.38], graphite, { outlined: true, rotation: [-0.08, 0, 0] });
        addBox(laptop, userMaterials, [2.12, 1.23, 0.04], [0.12, 0.32, -0.31], 0x5cb8c1, { opacity: 0.86, metalness: 0.18 });
        for (let message = 0; message < 4; message += 1) {
          addBox(laptop, userMaterials, [1.35 - message * 0.13, 0.09, 0.025], [-0.12 + message * 0.09, 0.69 - message * 0.25, -0.275], message === 0 ? ivory : 0xd5ece9, { metalness: 0.08, roughness: 0.74 });
        }

        const appPanel = new THREE.Group();
        userGroup.add(appPanel);
        addBox(appPanel, userMaterials, [3.65, 2.35, 0.12], [3.35, 1.05, -0.62], graphite, { opacity: 0.94, outlined: true });
        addBox(appPanel, userMaterials, [3.35, 2.02, 0.04], [3.35, 1.05, -0.54], ivory, { opacity: 0.94, metalness: 0.05, roughness: 0.82 });
        addBox(appPanel, userMaterials, [0.42, 0.42, 0.035], [2.22, 1.65, -0.505], violet, { metalness: 0.12 });
        addBox(appPanel, userMaterials, [1.68, 0.11, 0.035], [3.3, 1.72, -0.505], graphiteMid, { metalness: 0.12 });
        for (let card = 0; card < 3; card += 1) {
          addBox(appPanel, userMaterials, [2.78, 0.34, 0.035], [3.35, 1.18 - card * 0.49, -0.505], card === 1 ? 0xcce8e6 : steel, { opacity: 0.88, metalness: 0.08 });
          addBox(appPanel, userMaterials, [0.18, 0.18, 0.025], [2.2, 1.18 - card * 0.49, -0.48], card === 1 ? teal : amber, { metalness: 0.12 });
        }
        addTube(userGroup, userMaterials, [[1.15, 0.55, -0.25], [1.8, 1.1, -0.55], [2.55, 1.58, -0.56]], violet, 0.055, 0.82);
        addTube(userGroup, userMaterials, [[0.82, 0.18, -0.24], [1.75, 0.42, -0.82], [3.02, 0.18, -0.57]], teal, 0.045, 0.78);

        const cameraFrames = [
          { at: 0, position: [28, 17.5, 36], target: [0, -0.4, 0] },
          { at: 0.14, position: [21.5, 13.5, 28], target: [0, -0.25, 0] },
          { at: 0.28, position: [13.5, 9.2, 18], target: [0, 0.1, 0] },
          { at: 0.42, position: [9.6, 7.1, 12.6], target: [0, 0.05, 0] },
          { at: 0.56, position: [8.2, 6.1, 10.4], target: [0.2, 0.15, 0] },
          { at: 0.7, position: [7.2, 5.5, 9], target: [0.1, 0.1, 0] },
          { at: 0.84, position: [0.45, 13.5, 1.4], target: [0, -0.08, 0] },
          { at: 1, position: [10.8, 7.4, 14], target: [0.35, -0.05, -0.1] },
        ] as const;

        const interpolateFrame = (progress: number) => {
          const foundIndex = cameraFrames.findIndex((item) => progress <= item.at);
          const endIndex = foundIndex <= 0 ? 1 : foundIndex;
          const startIndex = Math.max(0, endIndex - 1);
          const start = cameraFrames[startIndex];
          const end = cameraFrames[endIndex];
          const amount = smoothstep(start.at, end.at, progress);
          const position = start.position.map((value, index) => THREE.MathUtils.lerp(value, end.position[index], amount));
          const target = start.target.map((value, index) => THREE.MathUtils.lerp(value, end.target[index], amount));
          camera.position.set(position[0], position[1], position[2]);
          camera.lookAt(target[0], target[1], target[2]);
        };

        const updateSize = () => {
          const width = mount.clientWidth;
          const height = mount.clientHeight;
          if (!width || !height) return;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 900 ? 1.2 : 1.45));
          renderer.setSize(width, height, false);
        };

        const renderProgress = () => {
          const rect = track.getBoundingClientRect();
          const travel = Math.max(1, track.offsetHeight - window.innerHeight);
          const progress = clamp(-rect.top / travel);
          track.style.setProperty("--hero-progress", progress.toFixed(4));

          const phase = progress < 0.11
            ? 0
            : progress < 0.23
              ? 1
              : progress < 0.36
                ? 2
                : progress < 0.49
                  ? 3
                  : progress < 0.61
                    ? 4
                    : progress < 0.73
                      ? 5
                      : progress < 0.86
                        ? 6
                        : 7;
          setActivePhase((current) => (current === phase ? current : phase));
          interpolateFrame(progress);

          const campusFade = 1 - smoothstep(0.14, 0.29, progress);
          const ambientReveal = smoothstep(0.06, 0.14, progress) * (1 - smoothstep(0.22, 0.34, progress));
          const rackReveal = smoothstep(0.14, 0.23, progress) * (1 - smoothstep(0.3, 0.42, progress));
          const trayReveal = smoothstep(0.29, 0.4, progress);
          const trayFade = 1 - smoothstep(0.58, 0.69, progress);
          const fabricReveal = smoothstep(0.43, 0.52, progress) * (1 - smoothstep(0.58, 0.69, progress));
          const packageReveal = smoothstep(0.57, 0.68, progress);
          const packageFade = 1 - smoothstep(0.87, 0.96, progress);
          const userReveal = smoothstep(0.85, 0.97, progress);

          setOpacity(campusMaterials, campusFade);
          setOpacity(ambientMaterials, ambientReveal);
          setOpacity(rackMaterials, rackReveal);
          setOpacity(trayMaterials, trayReveal * trayFade);
          setOpacity(selectedGpuMaterials, trayReveal * (1 - smoothstep(0.63, 0.75, progress)));
          setOpacity(fabricMaterials, fabricReveal);
          setOpacity(packageMaterials, packageReveal * packageFade);
          setOpacity(userMaterials, userReveal);

          world.position.x = THREE.MathUtils.lerp(5.1, 2.15, smoothstep(0.08, 0.29, progress));
          world.rotation.y = THREE.MathUtils.lerp(-0.06, 0.055, progress);
          campusGroup.rotation.y = THREE.MathUtils.lerp(-0.035, 0.025, smoothstep(0, 0.22, progress));
          ambientRacks.position.z = -smoothstep(0.14, 0.3, progress) * 1.6;

          const rackExplode = smoothstep(0.2, 0.35, progress);
          rackTrays.forEach((tray, index) => {
            const lane = index % 3;
            tray.position.z = rackExplode * (1.3 + lane * 0.85);
            tray.position.x = rackExplode * (lane - 1) * 0.23;
          });
          rackGroup.rotation.y = rackExplode * -0.2;

          computeTray.scale.setScalar(THREE.MathUtils.lerp(0.18, 0.98, trayReveal));
          computeTray.position.z = THREE.MathUtils.lerp(0, 0.55, trayReveal);
          computeTray.rotation.y = THREE.MathUtils.lerp(0.03, -0.13, smoothstep(0.34, 0.58, progress));

          const trayExplode = smoothstep(0.35, 0.55, progress);
          trayLid.position.y = trayExplode * 3.55;
          trayLid.rotation.z = trayExplode * -0.13;
          gpuGroups.forEach((gpu, index) => {
            const directionX = index % 2 === 0 ? -1 : 1;
            const directionZ = index < 2 ? -1 : 1;
            gpu.position.x = gpu.userData.baseX + directionX * trayExplode * 0.28;
            gpu.position.z = gpu.userData.baseZ + directionZ * trayExplode * 0.22;
            gpu.position.y = trayExplode * (0.35 + index * 0.08);
          });
          fabricGroup.position.y = smoothstep(0.47, 0.62, progress) * 0.55;

          packageGroup.scale.setScalar(THREE.MathUtils.lerp(0.04, 0.98, packageReveal));
          packageGroup.rotation.y = THREE.MathUtils.lerp(0.12, -0.06, smoothstep(0.66, 0.84, progress));
          packageGroup.position.y = THREE.MathUtils.lerp(-0.2, 0.15, packageReveal);

          const coverExplode = smoothstep(0.61, 0.73, progress);
          const chipExplode = smoothstep(0.74, 0.87, progress);
          packageCover.position.x = coverExplode * 4.8;
          packageCover.position.y = coverExplode * 2.05;
          packageCover.position.z = coverExplode * -0.55;
          packageCover.rotation.z = coverExplode * -0.08;
          dieGroup.position.y = chipExplode * 0.9;
          interposer.position.y = -0.48 + chipExplode * 0.22;
          substrate.position.y = -0.75 - chipExplode * 0.28;
          hbmGroup.children.forEach((stack) => {
            const length = Math.hypot(stack.userData.baseX, stack.userData.baseZ) || 1;
            stack.position.x = stack.userData.baseX + (stack.userData.baseX / length) * chipExplode * 0.5;
            stack.position.z = stack.userData.baseZ + (stack.userData.baseZ / length) * chipExplode * 0.5;
            stack.position.y = -0.18 + chipExplode * 0.64;
          });

          userGroup.scale.setScalar(THREE.MathUtils.lerp(0.04, 1.06, userReveal));
          userGroup.position.y = THREE.MathUtils.lerp(-0.2, 0, userReveal);
          userGroup.rotation.y = THREE.MathUtils.lerp(0.1, -0.045, userReveal);

          if (rendererVisible) renderer.render(scene, camera);
        };

        const requestRender = () => {
          window.cancelAnimationFrame(frame);
          frame = window.requestAnimationFrame(renderProgress);
        };

        const intersection = new IntersectionObserver(([entry]) => {
          rendererVisible = entry.isIntersecting;
          if (rendererVisible) requestRender();
        }, { rootMargin: "25% 0px" });

        const resize = new ResizeObserver(() => {
          updateSize();
          requestRender();
        });

        const handleContextLost = (event: Event) => {
          event.preventDefault();
          setFallback(true);
        };

        renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
        window.addEventListener("scroll", requestRender, { passive: true });
        window.addEventListener("resize", requestRender, { passive: true });
        intersection.observe(track);
        resize.observe(mount);
        updateSize();
        renderProgress();

        cleanupScene = () => {
          window.cancelAnimationFrame(frame);
          window.removeEventListener("scroll", requestRender);
          window.removeEventListener("resize", requestRender);
          renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
          intersection.disconnect();
          resize.disconnect();
          scene.traverse((object) => {
            const candidate = object as Mesh;
            candidate.geometry?.dispose?.();
            const objectMaterials = candidate.material
              ? (Array.isArray(candidate.material) ? candidate.material : [candidate.material])
              : [];
            objectMaterials.forEach((objectMaterial) => objectMaterial.dispose());
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        if (!cancelled) setFallback(true);
      }
    };

    void init();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      cleanupScene?.();
      rendererCanvas?.remove();
      track.style.removeProperty("--hero-progress");
    };
  }, [reducedMotionFallback]);

  const phase = phases[activePhase];

  return (
    <div className={fallback ? "research-scene is-fallback" : "research-scene"} ref={mountRef}>
      {fallback ? (
        <div
          className="scene-fallback"
          style={{ backgroundImage: `url(${reducedMotionFallback})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className="scene-wash" aria-hidden="true" />
      <div className="scene-status" aria-live="polite">
        <span>0{activePhase + 1} / 08</span>
        <strong>{language === "en" ? phase.en : phase.zh}</strong>
        <small>{language === "en" ? phase.factEn : phase.factZh}</small>
        <div aria-hidden="true">
          {phases.map((item, index) => (
            <i className={index === activePhase ? "active" : ""} key={item.en} />
          ))}
        </div>
      </div>
      <div className="scene-source">SYSTEM JOURNEY · GRID → GPU → APPLICATION</div>
    </div>
  );
}
