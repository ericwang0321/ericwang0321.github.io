"use client";

import { useEffect, useRef, useState } from "react";

type Language = "en" | "zh";

type VectorMapInstance = {
  destroy: () => void;
  updateSize: () => void;
};

type VectorMapConstructor = new (options: Record<string, unknown>) => VectorMapInstance;

type Tooltip = {
  text: (value: string) => void;
};

const visitedCountries = [
  { code: "CN", flag: "🇨🇳", en: "China", zh: "中国" },
  { code: "HK", flag: "🇭🇰", en: "Hong Kong", zh: "香港" },
  { code: "TW", flag: "🇹🇼", en: "Taiwan", zh: "台湾" },
  { code: "SG", flag: "🇸🇬", en: "Singapore", zh: "新加坡" },
  { code: "MY", flag: "🇲🇾", en: "Malaysia", zh: "马来西亚" },
  { code: "TH", flag: "🇹🇭", en: "Thailand", zh: "泰国" },
  { code: "KH", flag: "🇰🇭", en: "Cambodia", zh: "柬埔寨" },
  { code: "VN", flag: "🇻🇳", en: "Vietnam", zh: "越南" },
  { code: "ID", flag: "🇮🇩", en: "Indonesia", zh: "印度尼西亚" },
  { code: "QA", flag: "🇶🇦", en: "Qatar", zh: "卡塔尔" },
  { code: "RU", flag: "🇷🇺", en: "Russia", zh: "俄罗斯" },
  { code: "GB", flag: "🇬🇧", en: "United Kingdom", zh: "英国" },
  { code: "IE", flag: "🇮🇪", en: "Ireland", zh: "爱尔兰" },
  { code: "ME", flag: "🇲🇪", en: "Montenegro", zh: "黑山" },
  { code: "BA", flag: "🇧🇦", en: "Bosnia & Herzegovina", zh: "波斯尼亚和黑塞哥维那" },
  { code: "RS", flag: "🇷🇸", en: "Serbia", zh: "塞尔维亚" },
  { code: "CA", flag: "🇨🇦", en: "Canada", zh: "加拿大" },
  { code: "US", flag: "🇺🇸", en: "United States", zh: "美国" },
] as const;

const chinaRegions = [
  { en: "Beijing", zh: "北京市" },
  { en: "Shanghai", zh: "上海市" },
  { en: "Tianjin", zh: "天津市" },
  { en: "Guangdong", zh: "广东省" },
  { en: "Jiangsu", zh: "江苏省" },
  { en: "Fujian", zh: "福建省" },
  { en: "Hebei", zh: "河北省" },
  { en: "Ningxia", zh: "宁夏回族自治区" },
  { en: "Qinghai", zh: "青海省" },
  { en: "Gansu", zh: "甘肃省" },
  { en: "Jilin", zh: "吉林省" },
  { en: "Heilongjiang", zh: "黑龙江省" },
  { en: "Shanxi", zh: "山西省" },
  { en: "Shaanxi", zh: "陕西省" },
  { en: "Sichuan", zh: "四川省" },
  { en: "Guizhou", zh: "贵州省" },
  { en: "Hunan", zh: "湖南省" },
  { en: "Hong Kong SAR", zh: "香港特别行政区" },
] as const;

const mapCodes = visitedCountries.map((country) => country.code);

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Unable to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(`Unable to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

export default function VisitedPlacesMap({ language }: { language: Language }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let map: VectorMapInstance | null = null;
    let resizeObserver: ResizeObserver | null = null;

    async function initializeMap() {
      try {
        setMapStatus("loading");
        await loadScript("/maps/jsvectormap.min.js", "jsvectormap-core");
        await loadScript("/maps/world.min.js", "jsvectormap-world");

        if (cancelled || !mapElement.current) return;

        const vectorMapWindow = window as typeof window & { jsVectorMap?: VectorMapConstructor };
        const VectorMap = vectorMapWindow.jsVectorMap;
        if (!VectorMap) throw new Error("Map library unavailable");

        mapElement.current.replaceChildren();
        const overrides: Record<string, { en: string; zh: string }> = Object.fromEntries(
          visitedCountries.map((country) => [country.code, { en: country.en, zh: country.zh }]),
        );
        const displayNames = new Intl.DisplayNames([language === "zh" ? "zh-CN" : "en"], {
          type: "region",
        });

        const regionName = (code: string) =>
          overrides[code]?.[language] ?? displayNames.of(code) ?? code;

        map = new VectorMap({
          selector: mapElement.current,
          map: "world",
          backgroundColor: "transparent",
          draggable: true,
          zoomButtons: true,
          zoomOnScroll: true,
          zoomOnScrollSpeed: 1.4,
          zoomMax: 9,
          bindTouchEvents: true,
          regionsSelectable: false,
          selectedRegions: mapCodes,
          regionStyle: {
            initial: {
              fill: "#dfe4e8",
              stroke: "#ffffff",
              strokeWidth: 0.65,
              fillOpacity: 1,
            },
            hover: {
              fill: "#aab9c6",
              cursor: "grab",
            },
            selected: {
              fill: "#315f8f",
            },
            selectedHover: {
              fill: "#244b73",
            },
          },
          markers: [
            { name: language === "zh" ? "香港" : "Hong Kong", coords: [22.3193, 114.1694] },
            { name: language === "zh" ? "新加坡" : "Singapore", coords: [1.3521, 103.8198] },
            { name: "Raleigh", coords: [35.7796, -78.6382] },
          ],
          markerStyle: {
            initial: {
              fill: "#c77c2d",
              stroke: "#ffffff",
              strokeWidth: 1.8,
              r: 4,
            },
            hover: {
              fill: "#a96520",
              stroke: "#ffffff",
              r: 5,
            },
          },
          onRegionTooltipShow(_event: Event, tooltip: Tooltip, code: string) {
            const visited = mapCodes.includes(code as (typeof mapCodes)[number]);
            tooltip.text(
              `${regionName(code)}${visited ? (language === "zh" ? " · 去过" : " · Visited") : ""}`,
            );
          },
        });

        resizeObserver = new ResizeObserver(() => map?.updateSize());
        resizeObserver.observe(mapElement.current);
        setMapStatus("ready");
      } catch {
        if (!cancelled) setMapStatus("error");
      }
    }

    initializeMap();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      map?.destroy();
    };
  }, [language]);

  return (
    <section id="places" className="content-section places-section">
      <h2>{language === "en" ? "Places I’ve Been" : "我去过的地方"}</h2>
      <p className="places-intro">
        {language === "en"
          ? "Countries and regions are highlighted in blue. Zoom, scroll or drag to explore; markers identify Hong Kong, Singapore and Raleigh."
          : "蓝色区域代表我去过的国家和地区。可缩放、滚动或拖动查看；圆点标记香港、新加坡和 Raleigh。"}
      </p>

      <div className="places-grid">
        <div className="places-map-shell">
          <div className="places-map" ref={mapElement} aria-label={language === "en" ? "Map of places visited" : "去过地点的世界地图"} />
          {mapStatus !== "ready" ? (
            <div className="places-map-status" role="status">
              {mapStatus === "error"
                ? language === "en"
                  ? "The map could not load. The complete place list remains available."
                  : "地图暂时无法加载，右侧仍保留完整地点列表。"
                : language === "en"
                  ? "Loading map…"
                  : "地图加载中…"}
            </div>
          ) : null}
        </div>

        <aside className="places-country-panel" aria-label={language === "en" ? "Countries and regions visited" : "去过的国家和地区"}>
          <h3>
            {language === "en" ? "Countries & regions" : "国家与地区"}
            <span>{visitedCountries.length}</span>
          </h3>
          <ul className="places-country-list">
            {visitedCountries.map((country) => (
              <li key={country.code}>
                <span className="places-flag" aria-hidden="true">{country.flag}</span>
                <span>{country[language]}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="china-regions">
        <h3>
          {language === "en" ? "China · provincial-level regions" : "中国 · 省级地区"}
          <span>{chinaRegions.length}</span>
        </h3>
        <div className="china-region-list">
          {chinaRegions.map((region) => (
            <span key={region.en}>{region[language]}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
