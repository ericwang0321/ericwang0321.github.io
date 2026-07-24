"use client";

import { useEffect, useRef, useState } from "react";

type Language = "en" | "zh";

type ResearchSceneProps = {
  language: Language;
  reducedMotionFallback?: string;
};

type FrameSpec = {
  src: string;
  alt: string;
  fadeIn: [number, number];
  fadeOut?: [number, number];
  scale: [number, number];
  x: [number, number];
  y: [number, number];
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

const frames: FrameSpec[] = [
  {
    src: "/hero-journey/01-grid-campus-v1.jpg",
    alt: "AI data center campus with power and cooling infrastructure",
    fadeIn: [0, 0],
    fadeOut: [0.23, 0.24],
    scale: [1, 1.16],
    x: [0, -3.2],
    y: [0, -1.2],
  },
  {
    src: "/hero-journey/02-nvl72-rack-v1.jpg",
    alt: "Full liquid-cooled AI rack cutaway",
    fadeIn: [0.17, 0.23],
    fadeOut: [0.44, 0.45],
    scale: [0.97, 1.13],
    x: [1.8, -2.4],
    y: [0.6, -1],
  },
  {
    src: "/hero-journey/03-compute-tray-v1.jpg",
    alt: "Exploded liquid-cooled AI compute tray",
    fadeIn: [0.38, 0.44],
    fadeOut: [0.66, 0.67],
    scale: [0.97, 1.17],
    x: [2.2, -3.4],
    y: [1.2, -1.8],
  },
  {
    src: "/hero-journey/04-gpu-package-v1.jpg",
    alt: "Exploded GPU, HBM and interposer package",
    fadeIn: [0.6, 0.66],
    fadeOut: [0.92, 0.93],
    scale: [0.96, 1.2],
    x: [2.4, -4.8],
    y: [1.2, -2.2],
  },
  {
    src: "/hero-journey/05-ai-application-v1.jpg",
    alt: "Professional using an AI application",
    fadeIn: [0.86, 0.92],
    scale: [0.98, 1.035],
    x: [1.5, 0],
    y: [0.8, 0],
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const smoothstep = (start: number, end: number, value: number) => {
  if (start === end) return value >= end ? 1 : 0;
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

const lerp = (start: number, end: number, progress: number) => start + (end - start) * progress;

export default function ResearchScene({
  language,
  reducedMotionFallback = "/hero-journey/01-grid-campus-v1.jpg",
}: ResearchSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    const track = mount?.closest<HTMLElement>(".hero-section");
    if (!mount || !track) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactQuery = window.matchMedia("(max-width: 720px)");
    const useFallback = motionQuery.matches || compactQuery.matches;
    setFallback(useFallback);

    if (useFallback) {
      track.style.setProperty("--hero-progress", "0");
      return () => track.style.removeProperty("--hero-progress");
    }

    const frameElements = Array.from(mount.querySelectorAll<HTMLElement>(".journey-frame"));
    let animationFrame = 0;
    let visible = true;
    let previousPhase = -1;

    const render = () => {
      animationFrame = 0;
      if (!visible) return;

      const bounds = track.getBoundingClientRect();
      const scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
      const progress = clamp(-bounds.top / scrollable);
      track.style.setProperty("--hero-progress", progress.toFixed(4));

      frameElements.forEach((element, index) => {
        const spec = frames[index];
        const incoming = index === 0 ? 1 : Math.pow(smoothstep(spec.fadeIn[0], spec.fadeIn[1], progress), 1.35);
        const outgoing = spec.fadeOut ? 1 - smoothstep(spec.fadeOut[0], spec.fadeOut[1], progress) : 1;
        const opacity = clamp(incoming * outgoing);
        const localProgress = clamp((progress - spec.fadeIn[0]) / (1 - spec.fadeIn[0]));
        const easedProgress = smoothstep(0, 1, localProgress);
        const scale = lerp(spec.scale[0], spec.scale[1], easedProgress);
        const x = lerp(spec.x[0], spec.x[1], easedProgress);
        const y = lerp(spec.y[0], spec.y[1], easedProgress);
        const depth = Math.max(0, 1 - opacity);

        element.style.opacity = opacity.toFixed(4);
        element.style.transform = `translate3d(${x.toFixed(3)}%, ${y.toFixed(3)}%, 0) scale(${scale.toFixed(4)})`;
        element.style.filter = `blur(${(depth * 1.4).toFixed(2)}px) saturate(${(0.92 + opacity * 0.08).toFixed(3)})`;
        element.style.visibility = opacity < 0.002 ? "hidden" : "visible";
      });

      const phaseIndex = Math.min(phases.length - 1, Math.floor(progress * phases.length));
      if (phaseIndex !== previousPhase) {
        previousPhase = phaseIndex;
        setActivePhase(phaseIndex);
      }
    };

    const requestRender = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) requestRender();
      },
      { rootMargin: "20% 0px" },
    );

    observer.observe(track);
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    requestRender();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      window.cancelAnimationFrame(animationFrame);
      track.style.removeProperty("--hero-progress");
    };
  }, []);

  const phase = phases[activePhase];

  return (
    <div className={fallback ? "research-scene is-fallback" : "research-scene"} ref={mountRef}>
      <div className="journey-frames" aria-hidden="true">
        {fallback ? (
          <div className="scene-fallback" style={{ backgroundImage: `url(${reducedMotionFallback})` }} />
        ) : (
          frames.map((frame, index) => (
            <div
              className="journey-frame"
              key={frame.src}
              style={{
                backgroundImage: `url(${frame.src})`,
                opacity: index === 0 ? 1 : 0,
                zIndex: index + 1,
              }}
              role="img"
              aria-label={frame.alt}
            />
          ))
        )}
      </div>
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
