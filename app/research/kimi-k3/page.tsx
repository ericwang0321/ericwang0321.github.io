import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import styles from "./kimi.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Kimi K3: From Model Architecture to Real Hardware — Eric Wang",
  description:
    "A technical research guide connecting Kimi K3 architecture, numerical precision, memory capacity, parallelism and hardware deployment economics.",
  openGraph: {
    title: "Kimi K3: From Model Architecture to Real Hardware",
    description: "From weights and MXFP precision to rack-scale deployment.",
    images: [{ url: "/readings/kimi-k3-deployment/page-01.avif", width: 1536, height: 864 }],
  },
};

const toc = [
  ["00", "End-to-end data path", "#start-with-the-end-to-end-data-path"],
  ["I", "Units and capacity", "#part-i-fundamental-units-bit-byte-gb-gib-and-tb"],
  ["II", "Weight, activation and HBM", "#part-ii-what-are-weight-activation-and-hbm"],
  ["III", "Numerical precision", "#part-iii-what-does-precision-mean"],
  ["IV", "Operators and engines", "#part-iv-operators-kernels-and-inference-engines"],
  ["V", "Kimi K3 architecture", "#part-v-kimi-k3s-four-core-architectural-components"],
  ["VI", "Multi-accelerator execution", "#part-vi-how-multiple-accelerators-run-kimi-k3-together"],
  ["VII", "Hardware and economics", "#part-vii-one-unified-scenario-for-inference-and-training-hardware"],
];

export default async function KimiK3Article() {
  const articleHtml = await readFile(path.join(process.cwd(), "content/kimi-k3.html"), "utf8");

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/"><strong>EW</strong><span>Eric Wang</span></Link>
        <nav>
          <Link href="/library/kimi-k3-deployment/">VISUAL DECK ↗</Link>
          <Link href="/#research">← RESEARCH</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.kicker}>MODEL ARCHITECTURE × AI HARDWARE · 2026</p>
            <h1>Kimi K3: From Model Architecture to Real Hardware</h1>
            <p className={styles.chinese}>从模型架构、数值精度到真实硬件部署</p>
          </div>
          <p className={styles.lead}>
            A rigorous bridge from Kimi K3’s architectural ideas to weight capacity, HBM pressure, accelerator communication, deployment feasibility and rack-scale economics.
          </p>
        </div>
        <div className={styles.stats}>
          <div><strong>10K+</strong><span>WORDS</span></div>
          <div><strong>07</strong><span>PARTS</span></div>
          <div><strong>07</strong><span>ARCHITECTURE FIGURES</span></div>
          <div><strong>40</strong><span>SOURCE PAGES</span></div>
        </div>
      </section>

      <section className={styles.articleLayout}>
        <aside className={styles.toc}>
          <p>READING MAP</p>
          <ol>
            {toc.map(([number, label, href]) => (
              <li key={number}><a href={href}><span>{number}</span>{label}</a></li>
            ))}
          </ol>
          <div>
            <strong>WEB ARTICLE</strong>
            <p>Adapted from Eric Wang’s original English manuscript. The source DOCX is not published for direct download.</p>
          </div>
        </aside>
        <article className={styles.body} dangerouslySetInnerHTML={{ __html: articleHtml }} />
      </section>

      <footer className={styles.footer}>
        <p>Research and synthesis by Eric Wang · 王逸东</p>
        <div><a href="mailto:wangyidong020321@gmail.com">EMAIL ↗</a><Link href="/#research">MORE RESEARCH ↗</Link></div>
      </footer>
    </main>
  );
}
