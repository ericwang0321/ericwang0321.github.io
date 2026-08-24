"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./about.module.css";

type Language = "en" | "zh";

type Story = {
  marker: { en: string; zh: string };
  title: { en: string; zh: string };
  body: { en: string[]; zh: string[] };
};

const stories: Story[] = [
  {
    marker: { en: "University", zh: "大学初期" },
    title: { en: "Physics first, then machine learning", zh: "从物理出发，第一次接触机器学习" },
    body: {
      en: [
        "When I started university, machine learning was being tested in almost every field. I was studying physics, but I have always been drawn to new ideas before they become familiar, so I began learning outside my degree. Like many people at the time, I started with Andrew Ng’s Machine Learning course on Coursera.",
        "The course gave me a vocabulary for models, loss functions and optimization. More importantly, it made me want to use those ideas on a real problem instead of only completing exercises.",
      ],
      zh: [
        "我刚上大学时，机器学习正在各个领域快速展开。虽然主修物理，但我一直对尚未普及的新知识更感兴趣，于是开始在课程之外自学。和当时很多学习者一样，我从 Coursera 上吴恩达的 Machine Learning 课程开始。",
        "那门课让我第一次系统理解模型、损失函数和优化，也让我不满足于只完成练习，而是想把这些概念真正用在一个问题上。",
      ],
    },
  },
  {
    marker: { en: "Second-year summer", zh: "大二暑假" },
    title: { en: "My first research project", zh: "第一次真正做研究" },
    body: {
      en: [
        "That interest led me to a summer research project on machine-learning fairness. It was my first time building an experiment with TensorFlow and running it in Google Colab. For a physics student starting computer science from zero, the hard part was not one equation. It was learning how code is structured, how to debug it, how to design a reproducible experiment and how to rebuild an entire pipeline when something failed.",
        "I stayed with it. The project eventually became Fair Single Index Model, a peer-reviewed paper published by ACM TKDD. That experience taught me that I could enter a technical field without beginning as an insider, as long as I was willing to learn the underlying system carefully.",
      ],
      zh: [
        "这份兴趣把我带到大二暑假的机器学习公平性研究。那是我第一次用 TensorFlow 搭建实验，并在 Google Colab 上运行。对一个从零学习计算机的物理学生来说，困难并不只是一条公式，而是理解代码结构、调试错误、设计可复现实验，以及在工程失败后重新搭建整条流程。",
        "我最终坚持完成了这项研究，并将它发展为发表于 ACM TKDD 的同行评审论文 Fair Single Index Model。这段经历让我知道，即使不是从计算机专业出发，只要愿意认真理解底层系统，也可以进入一个陌生的技术领域。",
      ],
    },
  },
  {
    marker: { en: "ChatGPT arrives", zh: "ChatGPT 出现" },
    title: { en: "Natural language became an interface", zh: "自然语言第一次成为真正的交互界面" },
    body: {
      en: [
        "Learning to program had trained me to be exact: syntax, types and logic all had to be correct or the program would fail. Search engines were similar in a different way—the keyword mattered, and a small change could produce completely different results.",
        "ChatGPT felt different. I could describe what I meant in ordinary language, even imperfectly, and the system could still follow the intent. That was the part that surprised me most. I began using it continuously and testing where that understanding worked, where it broke and what kinds of tasks it could change.",
        "For the next period, however, most of my use was still web-based chat: one prompt, one answer, one turn at a time.",
      ],
      zh: [
        "学习编程让我习惯了精确：语法、类型和逻辑必须正确，否则程序就会报错。传统搜索也有相似之处——关键词必须足够准确，细微差异就可能带来完全不同的结果。",
        "ChatGPT 的不同之处在于，我可以用并不完美的自然语言描述意图，它仍然能够理解。这是最让我震撼的部分。从那以后，我一直在使用它，也不断测试这种理解在哪些任务上有效、在哪里会失效，以及它可能改变什么。",
        "不过在随后一段时间里，我对 AI 的使用仍主要停留在网页聊天：一轮提问、一轮回答，再进入下一轮。",
      ],
    },
  },
  {
    marker: { en: "ChinaAMC (HK)", zh: "华夏基金（香港）" },
    title: { en: "From chatting to building workflows", zh: "从聊天转向真正的工作流" },
    body: {
      en: [
        "The bigger change came during my internship at ChinaAMC (Hong Kong). I began using Claude Code with a GLM model for day-to-day work. It was my first serious experience with a coding agent that could inspect files, call tools and work through a task rather than only answer a question.",
        "The productivity gain was real, but so were the limitations. To make the system useful, I had to learn what skills and MCP were, how APIs could extend a model, and how to connect capabilities such as vision and web search. The workflow worked, but it was rough. If I still needed substantial technical effort after already learning to code, the product would be much harder for someone without that background.",
      ],
      zh: [
        "真正明显的变化发生在华夏基金（香港）实习期间。我开始用 Claude Code 接入 GLM 模型处理日常工作。这是我第一次认真使用能够检查文件、调用工具并持续完成任务的编程代理，而不只是让模型回答一个问题。",
        "生产力提升是真实的，但问题也很明显。为了让系统真正可用，我需要理解 skills、MCP，学习如何接入不同 API，并加入视觉、Web Search 等能力。它能够工作，但过程仍然粗糙。如果我已经学过编程，仍需要投入大量时间配置，那么没有技术背景的人会更难使用。",
      ],
    },
  },
  {
    marker: { en: "Product judgment", zh: "产品判断" },
    title: { en: "A capable model is not yet a usable product", zh: "模型有能力，不代表产品已经可用" },
    body: {
      en: [
        "Those experiments changed how I judge AI products. Some early open agent products had a strong idea but a weak product form: too many configuration steps, too much hidden technical knowledge and unclear security boundaries. They showed what might be possible, but not yet what most people could safely use.",
        "I also found terminal-based CLI coding agents increasingly awkward for multi-task work. A command line gives control, but it is still organized around one text stream. As the number of parallel tasks grew, task visibility and management became more important than terminal purity.",
      ],
      zh: [
        "这些尝试改变了我判断 AI 产品的方式。一些早期开放式 Agent 产品有很好的想法，却仍是很差的产品形态：配置步骤太多，依赖大量隐藏的技术知识，安全边界也不清晰。它们证明了什么可能实现，却还没有回答普通用户如何安全使用。",
        "我也逐渐发现，基于终端的 CLI coding agent 不适合多任务管理。命令行提供了控制力，但本质上仍围绕单一文本流组织。当并行任务越来越多时，任务可见性和管理方式比是否坚持使用终端更重要。",
      ],
    },
  },
  {
    marker: { en: "Yuanbao · Now", zh: "元保 · 现在" },
    title: { en: "Staying close to the frontier", zh: "持续靠近 AI 的能力边界" },
    body: {
      en: [
        "I joined my current team at Yuanbao partly because its CFO—my manager—takes AI seriously as a working tool, not just a topic. That environment gives me room to test new software in daily work. I now use Codex as my main AI workspace because, for my own tasks, it offers a better balance between code-level control and managing multiple pieces of work. My usage has grown quickly, but model quality, speed and cost still have to be balanced rather than maximized blindly.",
        "At the same time, my research has moved deeper into how AI works: the steps of inference, the role of post-training, where performance can be improved, and how the wider value chain connects applications, models, compute, semiconductors, power and data centers. I look at practical questions such as whether a new rack-scale architecture truly requires liquid cooling, and I compare those views with what friends working in physics and materials are seeing in the field.",
        "I am also strengthening the finance side of that work. My goal is to combine technical understanding with the discipline of a financial analyst: read a company’s numbers, understand what drives them, and judge how a change in technology could alter the company’s future. I do not think being at the AI frontier means trying every new product. It means forming a view through use, technical study and evidence—and being willing to revise it when the product or the economics change.",
      ],
      zh: [
        "我加入现在元保的团队，一个重要原因是公司的 CFO——也是我的直属负责人——真正把 AI 当作工作工具，而不只是一个话题。这样的环境让我能够在日常工作中持续测试不同软件。现在我主要使用 Codex，因为对我的任务而言，它在代码层面的控制与多任务管理之间取得了更好的平衡。我的使用量增长很快，但模型质量、速度和成本仍然需要平衡，而不是盲目追求最高配置。",
        "与此同时，我的研究也进一步深入到 AI 如何工作：推理经过哪些步骤，后训练是什么，性能还可以在哪些环节加强，以及应用、模型、算力、半导体、电力和数据中心如何组成完整价值链。我会研究一套新的机柜级架构是否真的必须采用液冷，也会和从事物理、材料相关工作的朋友交流，了解产业一线正在发生的变化。",
        "我也在持续提高自己的财务分析能力。我的目标是把技术理解与金融分析师的纪律结合起来：读懂公司的数字，理解真正的驱动因素，并判断一次技术变化会怎样影响公司的未来。我认为靠近 AI 前沿并不等于尝试每一个新产品，而是通过使用、技术研究和证据形成自己的判断，并在产品或经济性发生变化时愿意修正它。",
      ],
    },
  },
];

export default function AboutPage() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-language");
    if (saved !== "en" && saved !== "zh") return;
    const frame = window.requestAnimationFrame(() => {
      setLanguage(saved);
      document.documentElement.lang = saved === "zh" ? "zh-CN" : "en";
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleLanguage = () => {
    const next = language === "en" ? "zh" : "en";
    setLanguage(next);
    window.localStorage.setItem("portfolio-language", next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  };

  return (
    <main className={styles.page}>
      <header className={styles.nav}>
        <Link className={styles.brand} href="/">Eric Wang</Link>
        <div>
          <Link href="/#about">{language === "en" ? "Back to portfolio" : "返回主页"} ↗</Link>
          <button type="button" onClick={toggleLanguage}
            aria-label={language === "en" ? "切换至中文" : "Switch to English"}>
            {language === "en" ? "中文" : "EN"}
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <p>{language === "en" ? "About myself" : "关于我自己"}</p>
        <h1>{language === "en" ? <>How I learned to<br />work with AI.</> : <>我如何一步步<br />走进 AI。</>}</h1>
        <div className={styles.heroSummary}>
          <span>{language === "en" ? "University—Now" : "大学至今"}</span>
          <p>{language === "en"
            ? "I came to AI through physics, not computer science. What kept me in it was a simple habit: when a new model or interface changes what is possible, I want to understand both how it works and what it changes."
            : "我从物理而不是计算机专业进入 AI。让我一直走下去的是一个简单的习惯：当新的模型或交互方式改变了可能性，我既想理解它如何工作，也想知道它会改变什么。"}</p>
        </div>
      </section>

      <section className={styles.story} aria-label={language === "en" ? "AI journey" : "AI 学习与实践路径"}>
        {stories.map((item, index) => (
          <article className={styles.chapter} key={item.title.en}>
            <div className={styles.marker}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item.marker[language]}</p>
            </div>
            <div className={styles.chapterCopy}>
              <h2>{item.title[language]}</h2>
              {item.body[language].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {index === 1 ? <a href="https://doi.org/10.1145/3690646" target="_blank" rel="noreferrer">
                Fair Single Index Model · ACM TKDD ↗
              </a> : null}
            </div>
          </article>
        ))}
      </section>

      <footer className={styles.footer}>
        <p>{language === "en" ? "The work continues." : "探索还在继续。"}</p>
        <Link href="/#research">{language === "en" ? "Read my research" : "查看我的研究"} →</Link>
      </footer>
    </main>
  );
}
