"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ResearchDeck } from "../decks";
import { deckPageSource } from "../decks";
import DeckReader from "./DeckReader";
import styles from "./viewer.module.css";

type Language = "en" | "zh";

const workflow = [
  {
    number: "01",
    title: { en: "Script and confirmation", zh: "剧本与确认" },
    body: {
      en: "Expand the one-line idea into project constraints, story setup, episode outlines, a full script and a locked style and ratio.",
      zh: "把一句话创意逐层展开为项目约束、故事设定、分集大纲、完整剧本，并锁定风格与画幅。",
    },
  },
  {
    number: "02",
    title: { en: "Reusable asset library", zh: "可复用资产库" },
    body: {
      en: "Analyze characters, scenes, props and states, then generate reusable visual references before any expensive video pass.",
      zh: "先拆解角色、场景、道具和状态，批量生成可反复引用的视觉资产，再进入高成本的视频生成。",
    },
  },
  {
    number: "03",
    title: { en: "Clips into episodes", zh: "从片段到分集" },
    body: {
      en: "Break each episode into shots and clips, generate and repair the smallest valid unit, then preview, export and assemble the final episode.",
      zh: "把每集拆成分镜和片段，以最小有效单元生成和局部重做，最后预览、导出并合成完整分集。",
    },
  },
];

export default function BilingualDeckPage({ deck }: { deck: ResearchDeck }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    document.documentElement.lang = "en";
  }, []);

  const toggleLanguage = () => {
    const next = language === "en" ? "zh" : "en";
    setLanguage(next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  };

  const localizedDeck = {
    ...deck,
    folder: language === "zh" ? deck.chineseFolder ?? deck.folder : deck.folder,
  };
  const title = language === "en" ? deck.title : deck.chineseTitle;
  const subtitle = language === "en" ? deck.chineseTitle : deck.title;
  const summary = language === "en" ? deck.summary : deck.chineseSummary ?? deck.summary;

  return (
    <main className={`${styles.shell} ${styles[deck.accent]}`}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          <span>Eric Wang</span>
        </Link>
        <div className={styles.headerActions}>
          <Link href="/#research">{language === "en" ? "Back to research" : "返回研究"} ↗</Link>
          <button
            className={styles.languageButton}
            type="button"
            onClick={toggleLanguage}
            aria-label={language === "en" ? "切换至中文" : "Switch to English"}
          >
            {language === "en" ? "中文" : "EN"}
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}><span>{deck.category}</span><i /><span>2026</span></div>
          <h1>{title}</h1>
          <h2>{subtitle}</h2>
          <p>{summary}</p>
          <dl>
            <div><dt>{language === "en" ? "Format" : "形式"}</dt><dd>{language === "en" ? "Bilingual visual report" : "中英双语视觉报告"}</dd></div>
            <div><dt>{language === "en" ? "Length" : "页数"}</dt><dd>{deck.pages} {language === "en" ? "pages per language" : "页 / 每种语言"}</dd></div>
            <div><dt>{language === "en" ? "Includes" : "包含"}</dt><dd>{language === "en" ? "3 playable outputs" : "3 段可播放成片"}</dd></div>
          </dl>
        </div>
        <div className={styles.cover} aria-hidden="true">
          <Image
            key={localizedDeck.folder}
            src={deckPageSource(localizedDeck, 1)}
            alt=""
            width="1536"
            height="864"
            priority
            unoptimized
          />
        </div>
      </section>

      <section className={styles.brief} aria-labelledby="workflow-heading">
        <div className={styles.briefIntro}>
          <p>{language === "en" ? "Workflow at a glance" : "工作流概览"}</p>
          <h2 id="workflow-heading">
            {language === "en" ? "One line becomes a production system in three layers." : "一句话通过三层流程变成可生产的短剧。"}
          </h2>
          <p>{language === "en"
            ? "The public CLI provides access and orchestration, but the actual generation backend remains a cloud service. The report keeps that boundary explicit."
            : "公开 CLI 负责接入与编排，真正的生成后端仍是云端服务。报告会始终把这条边界说清。"}</p>
        </div>
        <div className={styles.briefGrid}>
          {workflow.map((item) => (
            <article className={styles.briefCard} key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title[language]}</h3>
              <p>{item.body[language]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.samples} aria-labelledby="samples-heading">
        <div className={styles.samplesHeader}>
          <p>{language === "en" ? "Production samples" : "成片样例"}</p>
          <h2 id="samples-heading">{language === "en" ? "The workflow produced real, exportable episodes." : "这套流程最终产出了可导出的真实分集。"}</h2>
          <p>{language === "en"
            ? "These are web-optimized copies of the delivered MP4 files. Playback starts only when you press play."
            : "以下是从交付 MP4 压缩得到的网页预览版，只有在你点击播放后才会加载播放。"}</p>
        </div>
        <div className={styles.sampleGrid}>
          {deck.samples?.map((sample) => (
            <article className={styles.sampleCard} key={sample.src}>
              <div className={styles.videoFrame}>
                <video controls playsInline preload="metadata" poster={sample.poster}>
                  <source src={sample.src} type="video/mp4" />
                  {language === "en" ? "Your browser does not support embedded video." : "当前浏览器不支持嵌入式视频。"}
                </video>
              </div>
              <div className={styles.sampleCopy}>
                <p className={styles.sampleMeta}>{sample.meta[language]}</p>
                <h3>{sample.title[language]}</h3>
                <p>{sample.description[language]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.notice}>
        <strong>{language === "en" ? "FULL REPORT" : "完整报告"}</strong>
        <p>{language === "en"
          ? "The browser reader below preserves all 46 pages. Use the language switch at the top to move between the original Chinese and English editions."
          : "下方网页阅读器保留了全部 46 页内容。可使用顶部语言按钮在中英文版本之间切换。"}</p>
      </div>

      <DeckReader deck={localizedDeck} language={language} />

      <footer className={styles.footer}>
        <p>{language === "en" ? "Workflow research and production verification by Eric Wang" : "工作流研究与制作验证：Eric Wang"}</p>
        <Link href="/#research">{language === "en" ? "More research" : "更多研究"} ↗</Link>
      </footer>
    </main>
  );
}
