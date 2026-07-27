"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import * as THREE from "three";
import { createResearchScenes, createTransitionPass } from "./researchScene3d";

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
    factEn: "4 B300 GPUs · 2 Grace CPUs · liquid cooling",
    factZh: "4 个 B300 GPU · 2 个 Grace CPU · 液冷",
  },
  {
    en: "NVLink fabric",
    zh: "NVLink 互联",
    factEn: "Switch fabric · optical links · system bandwidth",
    factZh: "交换网络 · 光互联 · 系统带宽",
  },
  {
    en: "GPU module",
    zh: "GPU 模组",
    factEn: "Compute dies · HBM · cold plate",
    factZh: "计算裸片 · HBM · 冷板",
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
    factEn: "Infrastructure becomes a human decision",
    factZh: "基础设施最终进入人的工作流",
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / Math.max(0.0001, end - start));
  return progress * progress * (3 - 2 * progress);
};

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
        antialias: window.innerWidth > 720,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => setFallback(true));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.autoClear = true;

    const scenes = createResearchScenes();
    const transition = createTransitionPass();
    const targetOptions: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
    };
    const renderTargetA = new THREE.WebGLRenderTarget(1, 1, targetOptions);
    const renderTargetB = new THREE.WebGLRenderTarget(1, 1, targetOptions);

    const pointerTarget = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };
    let targetProgress = 0;
    let renderedProgress = 0;
    let previousPhase = -1;
    let previousTime = performance.now();
    let animationFrame = 0;
    let visible = true;
    let disposed = false;
    let firstFrame = true;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      const mobile = width <= 720;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.1 : 1.5);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      renderTargetA.setSize(Math.round(width * pixelRatio), Math.round(height * pixelRatio));
      renderTargetB.setSize(Math.round(width * pixelRatio), Math.round(height * pixelRatio));
      scenes.forEach((bundle) => {
        bundle.camera.aspect = width / height;
        bundle.camera.fov = mobile ? 46 : 35;
        bundle.camera.updateProjectionMatrix();
      });
      ScrollTrigger.refresh();
    };

    const render = (time: number) => {
      animationFrame = 0;
      if (disposed || !visible) return;

      const deltaSeconds = Math.min(0.064, Math.max(0.001, (time - previousTime) / 1000));
      previousTime = time;
      renderedProgress = THREE.MathUtils.damp(renderedProgress, targetProgress, 10.5, deltaSeconds);
      pointer.x = THREE.MathUtils.damp(pointer.x, pointerTarget.x, 7.5, deltaSeconds);
      pointer.y = THREE.MathUtils.damp(pointer.y, pointerTarget.y, 7.5, deltaSeconds);
      if (Math.abs(renderedProgress - targetProgress) < 0.00008) renderedProgress = targetProgress;

      track.style.setProperty("--hero-progress", renderedProgress.toFixed(4));
      const phaseIndex = Math.min(phases.length - 1, Math.floor(renderedProgress * phases.length));
      if (phaseIndex !== previousPhase) {
        previousPhase = phaseIndex;
        setActivePhase(phaseIndex);
      }

      const scaled = renderedProgress >= 0.9999 ? 4 : renderedProgress * 4;
      const sceneIndex = Math.min(4, Math.floor(scaled));
      const sceneProgress = sceneIndex === 4 ? 1 : scaled - sceneIndex;
      const nextIndex = Math.min(4, sceneIndex + 1);
      const transitionStart = sceneIndex === 3 ? 0.32 : 0.7;
      const transitionProgress = sceneIndex === 4 ? 0 : smoothstep(transitionStart, 1, sceneProgress);
      const localProgress = sceneIndex === 4 ? 1 : clamp(sceneProgress / transitionStart);

      scenes[sceneIndex].update(localProgress, pointer);
      if (nextIndex !== sceneIndex) scenes[nextIndex].update(0, pointer);

      renderer.setRenderTarget(renderTargetA);
      renderer.clear();
      renderer.render(scenes[sceneIndex].scene, scenes[sceneIndex].camera);

      renderer.setRenderTarget(renderTargetB);
      renderer.clear();
      renderer.render(scenes[nextIndex].scene, scenes[nextIndex].camera);

      transition.material.uniforms.tFrom.value = renderTargetA.texture;
      transition.material.uniforms.tTo.value = renderTargetB.texture;
      transition.material.uniforms.uMix.value = transitionProgress;
      transition.material.uniforms.uDirection.value = sceneIndex % 2;

      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(transition.scene, transition.camera);

      if (firstFrame) {
        firstFrame = false;
        setReady(true);
      }

      const moving =
        Math.abs(renderedProgress - targetProgress) > 0.00008 ||
        Math.abs(pointer.x - pointerTarget.x) > 0.001 ||
        Math.abs(pointer.y - pointerTarget.y) > 0.001;
      if (moving) animationFrame = window.requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (!animationFrame && visible && !disposed) animationFrame = window.requestAnimationFrame(render);
    };

    const lenis = new Lenis({
      lerp: 0.1,
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
      pointerTarget.x = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      pointerTarget.y = -(event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
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
    requestRender();

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
      renderTargetA.dispose();
      renderTargetB.dispose();
      transition.dispose();
      scenes.forEach((bundle) => bundle.dispose());
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
      <canvas className="research-canvas" ref={canvasRef} aria-hidden="true" />
      {fallback && (
        <div
          className="scene-fallback"
          style={{ backgroundImage: `url(${reducedMotionFallback})` }}
          aria-hidden="true"
        />
      )}
      {!fallback && !ready && (
        <div className="scene-loading" aria-live="polite">
          <i />
          <span>{language === "en" ? "Building the AI stack" : "正在构建 AI 系统"}</span>
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
      <div className="scene-source">GRID → CAMPUS → RACK → TRAY → PACKAGE → APPLICATION</div>
    </div>
  );
}
