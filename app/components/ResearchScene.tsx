"use client";

import { useEffect, useRef, useState } from "react";
import type { Mesh, MeshStandardMaterial, Object3D } from "three";

type Language = "en" | "zh";

type ResearchSceneProps = {
  language: Language;
  reducedMotionFallback?: string;
};

const phases = [
  { en: "System overview", zh: "系统全景" },
  { en: "Compute", zh: "算力" },
  { en: "Memory", zh: "内存" },
  { en: "Network", zh: "网络" },
  { en: "Power & cooling", zh: "电力与冷却" },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

export default function ResearchScene({
  language,
  reducedMotionFallback = "/research/ai-chain/image2_diagrams/02-gpu-server-cutaway.png",
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 900 ? 1.25 : 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0xf7f5ef, 0);
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.className = "scene-canvas";
        mount.appendChild(renderer.domElement);
        rendererCanvas = renderer.domElement;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xf7f5ef, 15, 31);

        const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
        const assembly = new THREE.Group();
        assembly.position.set(1.7, -0.35, 0);
        scene.add(assembly);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x8f8b7d, 3.15));
        const keyLight = new THREE.DirectionalLight(0xffffff, 4.4);
        keyLight.position.set(8, 12, 10);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0x92d8d6, 1.5);
        fillLight.position.set(-7, 4, -8);
        scene.add(fillLight);

        const graphite = 0x293136;
        const graphiteSoft = 0x5e696b;
        const ivory = 0xdcd8ca;
        const teal = 0x087d82;
        const amber = 0xb56b24;
        const violet = 0x7461b7;
        const copper = 0xb8783f;

        const phaseMaterials: Array<{ phase: number; material: MeshStandardMaterial }> = [];

        const material = (color: number, phase = 0, opacity = 1) => {
          const instance = new THREE.MeshStandardMaterial({
            color,
            metalness: color === ivory ? 0.22 : 0.58,
            roughness: color === ivory ? 0.7 : 0.42,
            transparent: opacity < 1,
            opacity,
          });
          phaseMaterials.push({ phase, material: instance });
          return instance;
        };

        const addEdges = (mesh: Mesh, color = 0x182126, opacity = 0.2) => {
          const edges = new THREE.EdgesGeometry(mesh.geometry);
          const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
          mesh.add(lines);
        };

        const addBox = (
          parent: Object3D,
          size: [number, number, number],
          position: [number, number, number],
          color: number,
          phase = 0,
          outlined = false,
          opacity = 1,
        ) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color, phase, opacity));
          mesh.position.set(...position);
          if (outlined) addEdges(mesh);
          parent.add(mesh);
          return mesh;
        };

        const addTube = (
          parent: Object3D,
          points: Array<[number, number, number]>,
          color: number,
          phase: number,
          radius = 0.045,
          opacity = 0.92,
        ) => {
          const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
          const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 44, radius, 8, false), material(color, phase, opacity));
          parent.add(tube);
          return tube;
        };

        const floor = new THREE.GridHelper(22, 22, 0x8fa19e, 0xdad6ca);
        floor.position.y = -2.35;
        const floorMaterials = Array.isArray(floor.material) ? floor.material : [floor.material];
        floorMaterials.forEach((floorMaterial) => {
          floorMaterial.transparent = true;
          floorMaterial.opacity = 0.22;
        });
        assembly.add(floor);

        const rackGroup = new THREE.Group();
        assembly.add(rackGroup);
        [-4.25, 4.25].forEach((x) => {
          [-1.55, 1.55].forEach((z) => {
            addBox(rackGroup, [0.16, 4.7, 0.16], [x, 0, z], graphite, 0);
          });
          addBox(rackGroup, [0.16, 0.16, 3.25], [x, 2.28, 0], graphite, 0);
          addBox(rackGroup, [0.16, 0.16, 3.25], [x, -2.28, 0], graphite, 0);
          for (let row = 0; row < 8; row += 1) {
            addBox(rackGroup, [0.42, 0.34, 2.75], [x, -1.75 + row * 0.5, 0], row % 3 === 0 ? graphiteSoft : 0x3c4548, 1, false, 0.86);
            addBox(rackGroup, [0.04, 0.09, 0.18], [x - Math.sign(x) * 0.24, -1.75 + row * 0.5, 1.0], teal, 1);
          }
        });
        rackGroup.children.forEach((child) => {
          child.userData.baseX = child.position.x;
        });

        const computeGroup = new THREE.Group();
        assembly.add(computeGroup);
        addBox(computeGroup, [7.1, 0.24, 4.35], [0, -0.78, 0], graphite, 1, true);
        addBox(computeGroup, [6.7, 0.07, 3.95], [0, -0.62, 0], 0x315d59, 1, false);
        addBox(computeGroup, [2.15, 0.32, 1.65], [0, -0.38, 0], graphite, 1, true);
        addBox(computeGroup, [1.65, 0.13, 1.18], [0, -0.13, 0], teal, 1, true);
        for (let index = 0; index < 14; index += 1) {
          const x = -3.02 + (index % 7) * 1.0;
          const z = index < 7 ? -1.63 : 1.63;
          addBox(computeGroup, [0.54, 0.22, 0.34], [x, -0.38, z], graphiteSoft, 1, true);
        }

        const memoryGroup = new THREE.Group();
        assembly.add(memoryGroup);
        const memoryPositions: Array<[number, number, number]> = [
          [-1.45, 0.02, -0.92], [0, 0.02, -0.92], [1.45, 0.02, -0.92],
          [-1.45, 0.02, 0.92], [0, 0.02, 0.92], [1.45, 0.02, 0.92],
        ];
        memoryPositions.forEach(([x, y, z], index) => {
          const stack = new THREE.Group();
          stack.position.set(x, y, z);
          memoryGroup.add(stack);
          for (let layer = 0; layer < 4; layer += 1) {
            addBox(stack, [0.82, 0.12, 0.62], [0, layer * 0.16, 0], layer === 3 ? amber : 0x765b3e, 2, true);
          }
          stack.userData.offset = (index % 3 - 1) * 0.12;
          stack.userData.baseX = x;
        });

        const networkGroup = new THREE.Group();
        assembly.add(networkGroup);
        addBox(networkGroup, [1.25, 0.44, 3.6], [3.2, -0.25, 0], violet, 3, true);
        for (let port = 0; port < 7; port += 1) {
          addBox(networkGroup, [0.25, 0.17, 0.23], [3.88, -0.22, -1.35 + port * 0.45], ivory, 3, true);
          addTube(networkGroup, [
            [3.92, -0.18, -1.35 + port * 0.45],
            [4.55 + port * 0.09, 0.15 + port * 0.06, -1.35 + port * 0.45],
            [4.88, 0.4 + port * 0.08, -0.9 + port * 0.28],
          ], violet, 3, 0.035, 0.72);
        }

        const powerGroup = new THREE.Group();
        assembly.add(powerGroup);
        addBox(powerGroup, [6.2, 0.11, 0.18], [0, -0.3, -2.0], copper, 4, true);
        addBox(powerGroup, [6.2, 0.11, 0.18], [0, -0.3, 2.0], copper, 4, true);
        [-2.55, 2.55].forEach((x) => {
          addTube(powerGroup, [
            [x, -0.42, -1.9],
            [x * 0.72, 0.72, -1.45],
            [x * 0.48, 1.25, -0.55],
            [x * 0.32, 1.45, 0.35],
          ], teal, 4, 0.075, 0.68);
          addTube(powerGroup, [
            [x, -0.42, 1.9],
            [x * 0.72, 0.72, 1.45],
            [x * 0.48, 1.25, 0.55],
            [x * 0.32, 1.45, -0.35],
          ], amber, 4, 0.075, 0.68);
        });

        const capGroup = new THREE.Group();
        assembly.add(capGroup);
        const cap = addBox(capGroup, [7.35, 0.2, 4.6], [0, 1.92, 0], ivory, 0, true, 0.72);
        cap.rotation.z = -0.01;

        const cameraFrames = [
          { at: 0, position: [11.2, 7.1, 13.4], target: [0, -0.25, 0] },
          { at: 0.24, position: [8.1, 4.8, 9.2], target: [0, -0.25, 0] },
          { at: 0.5, position: [4.9, 3.2, 6.5], target: [0, 0.2, 0] },
          { at: 0.7, position: [-5.8, 3.5, 7.4], target: [1.25, 0, 0] },
          { at: 1, position: [8.5, 5.8, 10.5], target: [0, -0.35, 0] },
        ] as const;

        const interpolateFrame = (progress: number) => {
          const upperIndex = cameraFrames.findIndex((item) => progress <= item.at);
          const endIndex = upperIndex <= 0 ? 1 : upperIndex;
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
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 900 ? 1.25 : 1.5));
          renderer.setSize(width, height, false);
        };

        const renderProgress = () => {
          const rect = track.getBoundingClientRect();
          const travel = Math.max(1, track.offsetHeight - window.innerHeight);
          const progress = clamp(-rect.top / travel);
          track.style.setProperty("--hero-progress", progress.toFixed(4));

          const phase = progress < 0.2 ? 0 : progress < 0.45 ? 1 : progress < 0.65 ? 2 : progress < 0.82 ? 3 : 4;
          setActivePhase((current) => (current === phase ? current : phase));

          interpolateFrame(progress);
          assembly.rotation.y = THREE.MathUtils.lerp(-0.08, 0.1, progress);
          assembly.rotation.x = THREE.MathUtils.lerp(-0.02, -0.1, smoothstep(0.72, 1, progress));

          const computeFocus = smoothstep(0.18, 0.42, progress);
          rackGroup.children.forEach((child) => {
            const direction = child.userData.baseX < 0 ? -1 : 1;
            child.position.x = child.userData.baseX + direction * 0.22 * computeFocus;
          });
          capGroup.position.y = smoothstep(0.15, 0.55, progress) * 1.75;
          capGroup.rotation.z = smoothstep(0.15, 0.55, progress) * -0.12;
          memoryGroup.position.y = smoothstep(0.4, 0.64, progress) * 1.3;
          memoryGroup.children.forEach((child) => {
            child.position.x = child.userData.baseX + child.userData.offset * smoothstep(0.4, 0.64, progress);
          });
          networkGroup.position.x = smoothstep(0.62, 0.82, progress) * 0.72;
          powerGroup.position.y = smoothstep(0.8, 1, progress) * 0.5;

          phaseMaterials.forEach(({ phase: materialPhase, material: phaseMaterial }) => {
            const active = phase === materialPhase || phase === 0;
            phaseMaterial.emissive.copy(phaseMaterial.color).multiplyScalar(active ? 0.13 : 0);
            phaseMaterial.opacity = active ? Math.max(phaseMaterial.opacity, 0.92) : Math.min(phaseMaterial.opacity, 0.58);
            phaseMaterial.transparent = phaseMaterial.opacity < 1;
          });

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
        <span>0{activePhase + 1} / 05</span>
        <strong>{phases[activePhase][language]}</strong>
        <div aria-hidden="true">
          {phases.map((phase, index) => (
            <i className={index === activePhase ? "active" : ""} key={phase.en} />
          ))}
        </div>
      </div>
    </div>
  );
}
