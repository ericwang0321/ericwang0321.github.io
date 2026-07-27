"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";

type Language = "en" | "zh";

type ResearchSceneProps = {
  language: Language;
  reducedMotionFallback?: string;
};

type JourneyFrame = {
  src: string;
  focus: [number, number];
  offsetStart: [number, number];
  offsetEnd: [number, number];
  scaleStart: number;
  scaleEnd: number;
};

const phases = [
  {
    en: "Power & campus",
    zh: "供电与园区",
    factEn: "Grid · substation · liquid-cooling plant",
    factZh: "电网 · 变电站 · 液冷基础设施",
  },
  {
    en: "AI data hall",
    zh: "AI 数据机房",
    factEn: "Power busways · coolant loops · rack rows",
    factZh: "电力母线 · 冷却回路 · 机架集群",
  },
  {
    en: "GB300 NVL72",
    zh: "GB300 NVL72 整柜",
    factEn: "72 B300 GPUs · 36 Grace CPUs · 18 compute trays",
    factZh: "72 个 B300 · 36 个 Grace · 18 个计算托盘",
  },
  {
    en: "Rack fabric",
    zh: "整柜互联",
    factEn: "9 NVLink trays · 130 TB/s · liquid cooled",
    factZh: "9 个 NVLink 托盘 · 130 TB/s · 全液冷",
  },
  {
    en: "Compute tray",
    zh: "计算托盘",
    factEn: "4 B300 · 2 Grace · ConnectX-8 · BlueField-3",
    factZh: "4 个 B300 · 2 个 Grace · ConnectX-8 · BlueField-3",
  },
  {
    en: "Board & I/O",
    zh: "板级与 I/O",
    factEn: "NVMe · power delivery · cold-plate manifold",
    factZh: "NVMe · 供电网络 · 冷板歧管",
  },
  {
    en: "GPU + HBM",
    zh: "GPU 与 HBM",
    factEn: "Compute dies · HBM3E · interposer · cold plate",
    factZh: "计算裸片 · HBM3E · 中介层 · 冷板",
  },
  {
    en: "AI application",
    zh: "AI 应用终端",
    factEn: "Infrastructure becomes a human decision",
    factZh: "基础设施最终进入人的工作流",
  },
];

const journeyFrames: JourneyFrame[] = [
  {
    src: "/hero-journey/01-grid-campus-v1.jpg",
    focus: [0.72, 0.47],
    offsetStart: [0, 0],
    offsetEnd: [0.018, -0.006],
    scaleStart: 1.03,
    scaleEnd: 1.11,
  },
  {
    src: "/hero-journey/06-campus-rack-bridge-v2.jpg",
    focus: [0.7, 0.47],
    offsetStart: [0.008, 0],
    offsetEnd: [0.018, -0.004],
    scaleStart: 1.035,
    scaleEnd: 1.105,
  },
  {
    src: "/hero-journey/07-rack-close-v2.jpg",
    focus: [0.68, 0.49],
    offsetStart: [0.008, 0],
    offsetEnd: [0.018, -0.004],
    scaleStart: 1.04,
    scaleEnd: 1.115,
  },
  {
    src: "/hero-journey/02-nvl72-rack-v1.jpg",
    focus: [0.64, 0.5],
    offsetStart: [0.004, 0],
    offsetEnd: [0.014, -0.003],
    scaleStart: 1.035,
    scaleEnd: 1.105,
  },
  {
    src: "/hero-journey/08-rack-tray-extract-v2.jpg",
    focus: [0.62, 0.54],
    offsetStart: [0.004, 0],
    offsetEnd: [0.016, -0.004],
    scaleStart: 1.035,
    scaleEnd: 1.115,
  },
  {
    src: "/hero-journey/03-compute-tray-v1.jpg",
    focus: [0.66, 0.5],
    offsetStart: [0.004, 0],
    offsetEnd: [0.015, -0.004],
    scaleStart: 1.035,
    scaleEnd: 1.115,
  },
  {
    src: "/hero-journey/09-tray-gpu-macro-v2.jpg",
    focus: [0.57, 0.48],
    offsetStart: [0, 0],
    offsetEnd: [0.01, -0.005],
    scaleStart: 1.035,
    scaleEnd: 1.12,
  },
  {
    src: "/hero-journey/04-gpu-package-v1.jpg",
    focus: [0.66, 0.48],
    offsetStart: [0.004, 0],
    offsetEnd: [0.014, -0.004],
    scaleStart: 1.035,
    scaleEnd: 1.115,
  },
  {
    src: "/hero-journey/10-chip-app-bridge-v2.jpg",
    focus: [0.64, 0.53],
    offsetStart: [0.004, 0],
    offsetEnd: [0.014, -0.004],
    scaleStart: 1.035,
    scaleEnd: 1.105,
  },
  {
    src: "/hero-journey/05-ai-application-v1.jpg",
    focus: [0.64, 0.49],
    offsetStart: [0.004, 0],
    offsetEnd: [0.012, -0.003],
    scaleStart: 1.035,
    scaleEnd: 1.09,
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / Math.max(0.0001, end - start));
  return progress * progress * (3 - 2 * progress);
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D tFrom;
  uniform sampler2D tTo;
  uniform vec2 uResolution;
  uniform vec2 uFromSize;
  uniform vec2 uToSize;
  uniform vec2 uFromOffset;
  uniform vec2 uToOffset;
  uniform vec2 uFocus;
  uniform float uFromScale;
  uniform float uToScale;
  uniform float uMix;

  vec2 coverUv(vec2 uv, vec2 imageSize, float scale, vec2 offset) {
    float viewportAspect = uResolution.x / max(uResolution.y, 1.0);
    float imageAspect = imageSize.x / max(imageSize.y, 1.0);
    vec2 crop = vec2(1.0);

    if (viewportAspect > imageAspect) {
      crop.y = imageAspect / viewportAspect;
    } else {
      crop.x = viewportAspect / imageAspect;
    }

    vec2 mapped = (uv - 0.5) * crop / scale + 0.5 + offset;
    return clamp(mapped, vec2(0.001), vec2(0.999));
  }

  vec2 zoomAroundFocus(vec2 uv, vec2 focus, float zoom) {
    return focus + (uv - focus) / max(zoom, 0.001);
  }

  vec4 focusMotionSample(sampler2D image, vec2 uv, vec2 focusUv, float blurAmount) {
    if (blurAmount < 0.01) {
      return texture2D(image, uv);
    }
    vec2 trail = (uv - focusUv) * blurAmount * 0.0035;
    vec4 color = texture2D(image, uv) * 0.14;
    color += texture2D(image, clamp(uv - trail, 0.001, 0.999)) * 0.02;
    color += texture2D(image, clamp(uv - trail * 0.8333, 0.001, 0.999)) * 0.04;
    color += texture2D(image, clamp(uv - trail * 0.6667, 0.001, 0.999)) * 0.06;
    color += texture2D(image, clamp(uv - trail * 0.5, 0.001, 0.999)) * 0.08;
    color += texture2D(image, clamp(uv - trail * 0.3333, 0.001, 0.999)) * 0.10;
    color += texture2D(image, clamp(uv - trail * 0.1667, 0.001, 0.999)) * 0.13;
    color += texture2D(image, clamp(uv + trail * 0.1667, 0.001, 0.999)) * 0.13;
    color += texture2D(image, clamp(uv + trail * 0.3333, 0.001, 0.999)) * 0.10;
    color += texture2D(image, clamp(uv + trail * 0.5, 0.001, 0.999)) * 0.08;
    color += texture2D(image, clamp(uv + trail * 0.6667, 0.001, 0.999)) * 0.06;
    color += texture2D(image, clamp(uv + trail * 0.8333, 0.001, 0.999)) * 0.04;
    color += texture2D(image, clamp(uv + trail, 0.001, 0.999)) * 0.02;
    return color;
  }

  void main() {
    float eased = uMix * uMix * (3.0 - 2.0 * uMix);
    float energy = sin(eased * 3.14159265);

    float fromZoom = mix(1.0, 1.18, eased);
    float toZoom = mix(0.96, 1.0, eased);
    vec2 fromViewportUv = zoomAroundFocus(vUv, uFocus, fromZoom);
    vec2 toViewportUv = zoomAroundFocus(vUv, uFocus, toZoom);
    vec2 fromUv = coverUv(fromViewportUv, uFromSize, uFromScale, uFromOffset);
    vec2 toUv = coverUv(toViewportUv, uToSize, uToScale, uToOffset);
    vec2 fromFocusUv = coverUv(uFocus, uFromSize, uFromScale, uFromOffset);
    vec2 toFocusUv = coverUv(uFocus, uToSize, uToScale, uToOffset);

    float blurAmount = pow(energy, 0.82) * 14.0;
    vec4 fromColor = focusMotionSample(tFrom, fromUv, fromFocusUv, blurAmount);
    vec4 toColor = focusMotionSample(tTo, toUv, toFocusUv, blurAmount);
    float lensCut = step(0.5, eased);
    vec4 color = mix(fromColor, toColor, lensCut);

    vec3 warmVeil = vec3(0.965, 0.952, 0.925);
    float veil = pow(energy, 3.0) * 0.94;
    color.rgb = mix(color.rgb, warmVeil, veil);
    gl_FragColor = color;
  }
`;

export default function ResearchScene({
  language,
  reducedMotionFallback = "/hero-journey/01-grid-campus-v1.jpg",
}: ResearchSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    const track = mount?.closest<HTMLElement>(".hero-section");
    if (!mount || !canvas || !track) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      queueMicrotask(() => setFallback(true));
      track.style.setProperty("--hero-progress", "0");
      return () => track.style.removeProperty("--hero-progress");
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => setFallback(true));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tFrom: { value: null },
        tTo: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uFromSize: { value: new THREE.Vector2(1, 1) },
        uToSize: { value: new THREE.Vector2(1, 1) },
        uFromOffset: { value: new THREE.Vector2() },
        uToOffset: { value: new THREE.Vector2() },
        uFocus: { value: new THREE.Vector2(0.65, 0.5) },
        uFromScale: { value: 1.03 },
        uToScale: { value: 1.03 },
        uMix: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });
    scene.add(new THREE.Mesh(geometry, material));

    const pointerTarget = new THREE.Vector2();
    const pointer = new THREE.Vector2();
    const textures: Array<THREE.Texture | null> = new Array(journeyFrames.length).fill(null);
    let targetProgress = 0;
    let renderedProgress = 0;
    let previousPhase = -1;
    let previousTime = performance.now();
    let animationFrame = 0;
    let visible = true;
    let disposed = false;
    let loaded = false;

    const textureSize = (texture: THREE.Texture) => {
      const image = texture.image as { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number };
      return new THREE.Vector2(
        image.naturalWidth ?? image.width ?? 1,
        image.naturalHeight ?? image.height ?? 1,
      );
    };

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      const mobile = width <= 720;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.5));
      renderer.setSize(width, height, false);
      material.uniforms.uResolution.value.set(width, height);
      ScrollTrigger.refresh();
    };

    const render = (time: number) => {
      animationFrame = 0;
      if (disposed || !visible || !loaded) return;

      const deltaSeconds = Math.min(0.064, Math.max(0.001, (time - previousTime) / 1000));
      previousTime = time;
      renderedProgress = THREE.MathUtils.damp(renderedProgress, targetProgress, 11.5, deltaSeconds);
      pointer.lerp(pointerTarget, 1 - Math.exp(-deltaSeconds * 7.5));
      if (Math.abs(renderedProgress - targetProgress) < 0.00008) renderedProgress = targetProgress;

      track.style.setProperty("--hero-progress", renderedProgress.toFixed(4));
      const phaseIndex = Math.min(phases.length - 1, Math.floor(renderedProgress * phases.length));
      if (phaseIndex !== previousPhase) {
        previousPhase = phaseIndex;
        setActivePhase(phaseIndex);
      }

      const scaled = renderedProgress >= 0.9999
        ? journeyFrames.length - 1
        : renderedProgress * (journeyFrames.length - 1);
      const frameIndex = Math.min(journeyFrames.length - 1, Math.floor(scaled));
      const nextIndex = Math.min(journeyFrames.length - 1, frameIndex + 1);
      const localProgress = frameIndex === journeyFrames.length - 1 ? 1 : scaled - frameIndex;
      const mix = frameIndex === nextIndex ? 0 : smoothstep(0.52, 0.86, localProgress);
      const resolveTextureIndex = (requestedIndex: number) => {
        for (let distance = 0; distance < journeyFrames.length; distance += 1) {
          const previousIndex = requestedIndex - distance;
          if (previousIndex >= 0 && textures[previousIndex]) return previousIndex;
          const followingIndex = requestedIndex + distance;
          if (followingIndex < journeyFrames.length && textures[followingIndex]) return followingIndex;
        }
        return 0;
      };
      const resolvedFrameIndex = resolveTextureIndex(frameIndex);
      const resolvedNextIndex = textures[nextIndex] ? nextIndex : resolvedFrameIndex;
      const currentTexture = textures[resolvedFrameIndex];
      const nextTexture = textures[resolvedNextIndex];
      if (!currentTexture || !nextTexture) return;
      const currentFrame = journeyFrames[resolvedFrameIndex];
      const nextFrame = journeyFrames[resolvedNextIndex];
      const effectiveMix = resolvedFrameIndex === resolvedNextIndex ? 0 : mix;
      const currentOffset = new THREE.Vector2(...currentFrame.offsetStart)
        .lerp(new THREE.Vector2(...currentFrame.offsetEnd), smoothstep(0, 1, localProgress));
      currentOffset.x += pointer.x * 0.0025;
      currentOffset.y += pointer.y * 0.0018;
      const nextOffset = new THREE.Vector2(...nextFrame.offsetStart);
      nextOffset.x += pointer.x * 0.0025;
      nextOffset.y += pointer.y * 0.0018;

      material.uniforms.tFrom.value = currentTexture;
      material.uniforms.tTo.value = nextTexture;
      material.uniforms.uFromSize.value.copy(textureSize(currentTexture));
      material.uniforms.uToSize.value.copy(textureSize(nextTexture));
      material.uniforms.uFromOffset.value.copy(currentOffset);
      material.uniforms.uToOffset.value.copy(nextOffset);
      material.uniforms.uFocus.value
        .set(...currentFrame.focus)
        .lerp(new THREE.Vector2(...nextFrame.focus), effectiveMix);
      material.uniforms.uFromScale.value = THREE.MathUtils.lerp(
        currentFrame.scaleStart,
        currentFrame.scaleEnd,
        smoothstep(0, 1, localProgress),
      );
      material.uniforms.uToScale.value = nextFrame.scaleStart - (1 - effectiveMix) * 0.018;
      material.uniforms.uMix.value = effectiveMix;

      renderer.render(scene, camera);

      const moving =
        Math.abs(renderedProgress - targetProgress) > 0.00008 ||
        pointer.distanceTo(pointerTarget) > 0.001;
      if (moving) animationFrame = window.requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (!animationFrame && visible && !disposed) animationFrame = window.requestAnimationFrame(render);
    };

    const loader = new THREE.TextureLoader();
    const loadTexture = async (index: number) => {
      const texture = await loader.loadAsync(journeyFrames[index].src);
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      textures[index] = texture;
      if (index === 0) {
        loaded = true;
        setReady(true);
      }
      requestRender();
    };

    loadTexture(0)
      .then(() => {
        journeyFrames.slice(1).forEach((_, frameOffset) => {
          void loadTexture(frameOffset + 1).catch(() => undefined);
        });
      })
      .catch(() => {
        if (!disposed) setFallback(true);
      });

    const lenis = new Lenis({
      lerp: 0.095,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });
    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);
    const ticker = (seconds: number) => lenis.raf(seconds * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const scrollTrigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        targetProgress = self.progress;
        requestRender();
      },
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) requestRender();
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(track);

    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.set(
        (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2,
        -(event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2,
      );
      requestRender();
    };
    const onResize = () => {
      resize();
      requestRender();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setFallback(true);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    canvas.addEventListener("webglcontextlost", onContextLost);
    resize();

    return () => {
      disposed = true;
      observer.disconnect();
      scrollTrigger.kill();
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      gsap.ticker.remove(ticker);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.cancelAnimationFrame(animationFrame);
      textures.forEach((texture) => texture?.dispose());
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      track.style.removeProperty("--hero-progress");
    };
  }, []);

  const phase = phases[activePhase];

  return (
    <div
      className={`research-scene${fallback ? " is-fallback" : " is-webgl"}${ready ? " is-ready" : ""}`}
      ref={mountRef}
    >
      <div
        className="scene-poster"
        style={{ backgroundImage: `url("${reducedMotionFallback}")` }}
        aria-hidden="true"
      />
      <canvas className="research-canvas" ref={canvasRef} aria-hidden="true" />
      {!fallback && !ready && (
        <div className="scene-loading" aria-live="polite">
          <i />
          <span>{language === "en" ? "Loading the AI system" : "正在载入 AI 系统"}</span>
        </div>
      )}
      <div className="scene-atmosphere" aria-hidden="true" />
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
      <div className="scene-source">
        SPEC-DRIVEN MODEL · NVIDIA PUBLIC RA → NVL72 → TRAY → SILICON → APPLICATION
      </div>
    </div>
  );
}
